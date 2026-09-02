export default {

	// ============================================================
	// Header Mapping
	// ============================================================

	mapToOptions() {
		return [
			{ label: "Code", value: "item_number" },
			{ label: "Category", value: "category" },
			{ label: "Ingredient", value: "ingredient" },
			{ label: "Qty", value: "qty" },
			{ label: "Unit", value: "unit" },
			{ label: "Cost", value: "cost" }
		];
	},

	suggestHeaderMap(header) {
		const value = String(header || "")
		.trim()
		.toLowerCase();

		const suggestions = {
			"item number": "item_number",
			"item #": "item_number",
			"item no": "item_number",
			"code": "item_number",

			"category": "category",

			"ingredient": "ingredient",
			"item description": "ingredient",
			"description": "ingredient",

			"qty": "qty",
			"quantity": "qty",
			"total qty": "qty",

			"unit": "unit",
			"uom": "unit",

			"cost": "cost",
			"case price": "cost",
			"price": "cost"
		};

		return suggestions[value] || "";
	},

	async applyHeaderMapEdit() {
		const edits =
					tblImportMapHeaders.updatedRows || [];

		if (!edits.length) {
			return false;
		}

		const edit =
					edits[edits.length - 1];

		const importedHeader =
					edit?.allFields?.imported_data;

		const targetField =
					edit?.updatedFields?.map_to;

		if (!importedHeader) {
			return false;
		}

		const rows =
					(appsmith.store.impHeaderMapRows || [])
		.map(row => ({ ...row }));

		// Header targets are one-to-one.
		// The newest assignment wins.
		if (targetField) {
			rows.forEach(row => {
				if (
					row.imported_data !== importedHeader &&
					row.map_to === targetField
				) {
					row.map_to = "";
				}
			});
		}

		const row = rows.find(
			x => x.imported_data === importedHeader
		);

		if (row) {
			row.map_to = targetField || "";
		}

		await storeValue(
			"impHeaderMapRows",
			rows
		);

		resetWidget("tblImportMapHeaders");

		return true;
	},

	// ============================================================
	// Import Workspace
	// ============================================================

	async discardImport() {
		await removeValue("impSelectedSupplierId");

		await removeValue("impSourceHeaders");
		await removeValue("impSourceRows");

		await removeValue("impHeaderMapRows");
		await removeValue("impHeaderSignature");

		await removeValue("impAppliedHeaderMapRows");
		await removeValue("impAppliedHeaderSignature");

		await removeValue("impValueMapRows");
		await removeValue("impParsedRows");
		await removeValue("impBatchId");

		await removeValue("impImpact");

		await removeValue("accImportMapHeaders");
		await removeValue("accImportMapItems");

		resetWidget("selImportListSupplier");
		resetWidget("filImportListPriceList");
		resetWidget("tblImportMapHeaders");
		resetWidget("tblImportMapItems");

		showAlert(
			"Import workspace cleared.",
			"success"
		);

		return true;
	},

	// ============================================================
	// File Loading
	// ============================================================

	async readWorkbook() {
		const file =
					filImportListPriceList.files?.[0];

		if (!file?.data) {
			showAlert(
				"Please choose an Excel file.",
				"warning"
			);
			return false;
		}

		try {
			const workbook = XLSX.read(
				file.data,
				{
					type: "binary"
				}
			);

			if (!workbook.SheetNames?.length) {
				showAlert(
					"No worksheets were found in this file.",
					"error"
				);
				return false;
			}

			const sheetName =
						workbook.SheetNames[0];

			const sheet =
						workbook.Sheets[sheetName];

			const sourceRows =
						XLSX.utils.sheet_to_json(
							sheet,
							{
								defval: null
							}
						);

			if (!sourceRows.length) {
				showAlert(
					"No data rows were found in this file.",
					"warning"
				);
				return false;
			}

			const sourceHeaders =
						Object.keys(sourceRows[0]);

			const headerSignature =
						sourceHeaders
			.map(
				h =>
				String(h || "")
				.trim()
				.toLowerCase()
			)
			.join("|");

			await storeValue(
				"impSourceHeaders",
				sourceHeaders
			);

			await storeValue(
				"impSourceRows",
				sourceRows
			);

			await storeValue(
				"impHeaderSignature",
				headerSignature
			);

			await removeValue(
				"impAppliedHeaderMapRows"
			);

			await removeValue(
				"impAppliedHeaderSignature"
			);

			await removeValue(
				"impValueMapRows"
			);

			await removeValue(
				"impParsedRows"
			);

			await removeValue(
				"impBatchId"
			);

			let headerMapRows =
					sourceHeaders.map(
						header => ({
							imported_data: header,
							map_to: this.suggestHeaderMap(header)
						})
					);

			const supplierValue =
						selImportListSupplier.selectedOptionValue;

			if (supplierValue) {
				const savedMappings =
							await qryImpSavedMappings.run();

				const savedHeaderMappings =
							(savedMappings || [])
				.filter(
					row =>
					row.mapping_scope === "header"
				);

				if (savedHeaderMappings.length) {
					headerMapRows =
						sourceHeaders.map(header => {
						const saved =
									savedHeaderMappings.find(
										row =>
										String(
											row.source_value || ""
										)
										.trim()
										.toLowerCase() ===
										String(header || "")
										.trim()
										.toLowerCase()
									);

						return {
							imported_data: header,
							map_to:
							saved?.target_value || ""
						};
					});

					await storeValue(
						"impHeaderMapRows",
						headerMapRows
					);

					await storeValue(
						"impAppliedHeaderMapRows",
						headerMapRows.map(
							row => ({ ...row })
						)
					);

					await storeValue(
						"impAppliedHeaderSignature",
						headerSignature
					);

					await this.initialiseValueMapRows();

					showAlert(
						`Loaded ${sourceRows.length} rows from "${sheetName}". Saved Header Mapping applied.`,
						"success"
					);

					return {
						sheetName,
						rowCount: sourceRows.length,
						headers: sourceHeaders,
						headerMappingApplied: true
					};
				}
			}

			await storeValue(
				"impHeaderMapRows",
				headerMapRows
			);

			showAlert(
				`Loaded ${sourceRows.length} rows from "${sheetName}"`,
				"success"
			);

			return {
				sheetName,
				rowCount: sourceRows.length,
				headers: sourceHeaders,
				headerMappingApplied: false
			};

		} catch (error) {
			showAlert(
				error?.message ||
				"The file could not be loaded.",
				"error"
			);

			return false;
		}
	},

	async applyHeaderMapping() {
		const rows =
					(appsmith.store.impHeaderMapRows || [])
		.map(row => ({ ...row }));

		const ingredientMapping =
					rows.find(
						row =>
						row.map_to === "ingredient"
					);

		if (!ingredientMapping) {
			showAlert(
				"Map an imported column to Ingredient before applying the mapping.",
				"warning"
			);
			return false;
		}

		const headerSignature =
					appsmith.store.impHeaderSignature || "";

		if (!headerSignature) {
			showAlert(
				"Header signature is missing. Reload the file.",
				"error"
			);
			return false;
		}

		await storeValue(
			"impAppliedHeaderMapRows",
			rows
		);

		await storeValue(
			"impAppliedHeaderSignature",
			headerSignature
		);

		await this.initialiseValueMapRows();

		return true;
	},

	// ============================================================
	// Category / Unit Mapping
	// ============================================================

	suggestValueMap(type, value) {
		const normalise = input =>
		String(input || "")
		.trim()
		.toLowerCase();

		if (type === "Category") {
			const rows =
						Array.isArray(qryImpCategories.data)
			? qryImpCategories.data
			: [];

			const match =
						rows.find(
							x =>
							normalise(x.name) ===
							normalise(value)
						);

			return match
				? String(match.id)
			: "";
		}

		if (type === "Unit") {
			const rows =
						Array.isArray(qryImpUnits.data)
			? qryImpUnits.data
			: [];

			const match =
						rows.find(
							x =>
							normalise(x.abbreviation) ===
							normalise(value)
						);

			return match
				? String(match.id)
			: "";
		}

		return "";
	},

	buildValueMapRows() {
		const sourceRows =
					appsmith.store.impSourceRows || [];

		const headerMapRows =
					appsmith.store.impHeaderMapRows || [];

		const normalise = value =>
		String(value || "")
		.trim()
		.toLowerCase();

		const uniqueValues = values => {
			const seen = new Set();

			return values.filter(value => {
				const key = normalise(value);

				if (!key || seen.has(key)) {
					return false;
				}

				seen.add(key);
				return true;
			});
		};

		const categoryHeader =
					headerMapRows.find(
						row =>
						row.map_to === "category"
					)?.imported_data;

		const unitHeader =
					headerMapRows.find(
						row =>
						row.map_to === "unit"
					)?.imported_data;

		const rows = [];

		if (categoryHeader) {
			const categories =
						uniqueValues(
							sourceRows
							.map(
								row =>
								row[categoryHeader]
							)
							.filter(
								value =>
								value !== null &&
								value !== undefined &&
								String(value).trim() !== ""
							)
							.map(
								value =>
								String(value).trim()
							)
						);

			const categoryOptions = [
				{
					label: "",
					value: ""
				},
				...(qryImpCategories.data || [])
				.map(x => ({
					label: x.name,
					value: String(x.id)
				})),
				{
					label: "+ Add to list",
					value: "__ADD_NEW_CATEGORY__"
				}
			];

			categories.forEach(value => {
				rows.push({
					list_id: `Category:${normalise(value)}`,
					type: "Category",
					imported_data: value,
					map_to:
					this.suggestValueMap(
						"Category",
						value
					),
					options: categoryOptions
				});
			});
		}

		if (unitHeader) {
			const units =
						uniqueValues(
							sourceRows
							.map(
								row =>
								row[unitHeader]
							)
							.filter(
								value =>
								value !== null &&
								value !== undefined &&
								String(value).trim() !== ""
							)
							.map(
								value =>
								String(value).trim()
							)
						);

			const unitOptions = [
				{
					label: "",
					value: ""
				},
				...(qryImpUnits.data || [])
				.map(x => ({
					label:
					`${x.abbreviation} (${x.name})`,
					value: String(x.id)
				}))
			];

			units.forEach(value => {
				rows.push({
					list_id: `Unit:${normalise(value)}`,
					type: "Unit",
					imported_data: value,
					map_to:
					this.suggestValueMap(
						"Unit",
						value
					),
					options: unitOptions
				});
			});
		}

		return rows;
	},

	async initialiseValueMapRows() {
		await Promise.all([
			qryImpCategories.run(),
			qryImpUnits.run()
		]);

		const rows =
					this.buildValueMapRows();

		await storeValue(
			"impValueMapRows",
			rows
		);

		resetWidget(
			"tblImportMapItems"
		);

		return true;
	},

	async updateValueMapping(rowId, selectedValue) {
		const rows =
					appsmith.store.impValueMapRows || [];

		const updatedRows =
					rows.map(row =>
									 row.list_id === rowId
									 ? {
						...row,
						map_to: selectedValue || ""
					}
									 : row
									);

		await storeValue(
			"impValueMapRows",
			updatedRows
		);

		await removeValue("impImpact");

		return true;
	},

	async supplierChanged() {
		const supplierValue =
					selImportListSupplier.selectedOptionValue;

		await storeValue(
			"impSelectedSupplierId",
			supplierValue || ""
		);

		const hasFile =
					(appsmith.store.impSourceRows || []).length > 0;

		const headerApplied =
					(appsmith.store.impAppliedHeaderMapRows || []).length > 0;

		if (!hasFile || !headerApplied || !supplierValue) {
			return true;
		}

		try {
			const savedMappings =
						await qryImpSavedMappings.run();

			await Promise.all([
				qryImpCategories.run(),
				qryImpUnits.run()
			]);

			let rows =
					this.buildValueMapRows();

			const savedValueMappings =
						(savedMappings || [])
			.filter(
				row =>
				row.mapping_scope === "value"
			);

			const normalise = value =>
			String(value || "")
			.trim()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toLowerCase();

			rows = rows.map(row => {
				const mappingType =
							row.type === "Category"
				? "category"
				: "unit";

				const saved =
							savedValueMappings.find(
								x =>
								x.mapping_type === mappingType &&
								normalise(x.source_value) ===
								normalise(row.imported_data)
							);

				return {
					...row,
					map_to:
					saved?.target_id
					? String(saved.target_id)
					: row.map_to
				};
			});

			await storeValue(
				"impValueMapRows",
				rows
			);



			return true;

		} catch (error) {
			return jsUserErrors.show(
				error,
				"Supplier mappings could not be loaded."
			);
		}
	},

	buildMappedImportRows() {
		const sourceRows =
					appsmith.store.impSourceRows || [];

		const headerMapRows =
					appsmith.store.impAppliedHeaderMapRows || [];

		const valueMapRows =
					appsmith.store.impValueMapRows || [];

		const sourceHeader = target =>
		headerMapRows.find(
			row => row.map_to === target
		)?.imported_data || null;

		const headers = {
			code: sourceHeader("item_number"),
			category: sourceHeader("category"),
			ingredient: sourceHeader("ingredient"),
			qty: sourceHeader("qty"),
			unit: sourceHeader("unit"),
			cost: sourceHeader("cost")
		};

		const clean = value => {
			if (
				value === null ||
				value === undefined
			) {
				return "";
			}

			return String(value).trim();
		};

		const mappedValue = (type, sourceValue) => {
			const source =
						clean(sourceValue)
			.toLowerCase();

			if (!source) {
				return "";
			}

			const match =
						valueMapRows.find(
							row =>
							row.type === type &&
							clean(row.imported_data)
							.toLowerCase() === source
						);

			return match?.map_to || "";
		};

		return sourceRows.map((sourceRow, index) => {
			const sourceCategory =
						headers.category
			? clean(sourceRow[headers.category])
			: "";

			const sourceUnit =
						headers.unit
			? clean(sourceRow[headers.unit])
			: "";

			return {
				source_row_number: index + 2,

				code:
				headers.code
				? clean(sourceRow[headers.code])
				: "",

				ingredient:
				headers.ingredient
				? clean(sourceRow[headers.ingredient])
				: "",

				source_category: sourceCategory,

				category_id:
				mappedValue(
					"Category",
					sourceCategory
				),

				source_unit: sourceUnit,

				unit_id:
				mappedValue(
					"Unit",
					sourceUnit
				),

				qty:
				headers.qty
				? sourceRow[headers.qty]
				: null,

				cost:
				headers.cost
				? sourceRow[headers.cost]
				: null
			};
		});
	},

	buildImportImpact() {
		const rows =
					this.buildMappedImportRows() || [];

		const existingIngredients =
					qryImpExistingIngredients.data || [];

		const supplierRows =
					qryImpExistingSupplierItems.data || [];

		const supplierSelected =
					selImportListSupplier.selectedOptionValue &&
					selImportListSupplier.selectedOptionValue !== "__NO_SUPPLIER__";

		const normalize = value =>
		String(value || "")
		.trim()
		.toLowerCase();

		const codeNorm = value =>
		normalize(value);

		// ----------------------------------------------------------
		// Existing live Ingredient names
		// ----------------------------------------------------------

		const existingByName = new Map();

		existingIngredients.forEach(item => {
			const name =
						normalize(
							item.name_norm ||
							item.name
						);

			if (!name) return;

			if (!existingByName.has(name)) {
				existingByName.set(name, []);
			}

			existingByName.get(name).push(item);
		});


		// ----------------------------------------------------------
		// Current Supplier recurrence lookup
		// ----------------------------------------------------------

		const supplierByCode = new Map();
		const supplierByName = new Map();

		if (supplierSelected) {
			supplierRows.forEach(item => {
				const code =
							codeNorm(item.item_code);

				const name =
							normalize(
								item.name_norm ||
								item.supplier_name ||
								item.name
							);

				if (code) {
					supplierByCode.set(code, item);
				}

				if (name) {
					supplierByName.set(name, item);
				}
			});
		}


		// ----------------------------------------------------------
		// First classify every incoming row by recurrence identity
		// ----------------------------------------------------------

		const classified = rows.map((row, index) => {
			const name =
						normalize(row.ingredient);

			const code =
						codeNorm(row.code);

			let recurrence = null;

			/*
		 * Recurrence contract:
		 *
		 * Supplier + Code
		 *     -> Supplier + Code
		 *
		 * Supplier + no Code
		 *     -> Supplier + normalized Ingredient Name
		 *
		 * No Supplier
		 *     -> never automatic recurrence
		 */

			if (supplierSelected) {
				if (code) {
					recurrence =
						supplierByCode.get(code) || null;
				} else if (name) {
					recurrence =
						supplierByName.get(name) || null;
				}
			}

			return {
				index,
				row,
				name,
				code,
				recurrence,
				isUpdate: !!recurrence,
				isCreate: !recurrence
			};
		});


		// ----------------------------------------------------------
		// New / Updated
		// ----------------------------------------------------------

		const updatedIngredients =
					classified.filter(x =>
														x.name && x.isUpdate
													 ).length;

		const newIngredients =
					classified.filter(x =>
														x.name && x.isCreate
													 ).length;


		// ----------------------------------------------------------
		// Duplicate-name warnings
		//
		// A recurrence update is NOT a duplicate.
		//
		// Warn only where the incoming row represents a different
		// Ingredient identity but has an existing/imported exact
		// normalized name.
		// ----------------------------------------------------------

		const duplicateIndexes = new Set();


		// Existing database name collisions
		classified.forEach(item => {
			if (!item.name || item.isUpdate) {
				return;
			}

			const existingMatches =
						existingByName.get(item.name) || [];

			if (existingMatches.length > 0) {
				duplicateIndexes.add(item.index);
			}
		});


		// ----------------------------------------------------------
		// Same-name rows inside this Import
		//
		// Do not flag rows merely because multiple rows resolve to
		// the same recurrence identity.
		// ----------------------------------------------------------

		const importByName = new Map();

		classified.forEach(item => {
			if (!item.name) return;

			if (!importByName.has(item.name)) {
				importByName.set(item.name, []);
			}

			importByName.get(item.name).push(item);
		});


		importByName.forEach(group => {
			if (group.length < 2) {
				return;
			}

			/*
		 * Build the effective identity for comparison.
		 *
		 * Recurring supplier row:
		 *     use Ingredient ID / recurrence row identity.
		 *
		 * New row:
		 *     each separate incoming recurrence key is its own
		 *     potential Ingredient identity.
		 */

			const identities = new Set();

			group.forEach(item => {
				if (item.recurrence) {
					const ingredientId =
								item.recurrence.ingredient_id ||
								item.recurrence.id;

					identities.add(
						`existing:${ingredientId}`
					);

					return;
				}

				if (supplierSelected && item.code) {
					identities.add(
						`supplier-code:${item.code}`
					);
					return;
				}

				if (supplierSelected && !item.code) {
					/*
				 * Same Supplier + no Code + same normalized Name
				 * is one recurrence identity.
				 */
					identities.add(
						`supplier-name:${item.name}`
					);
					return;
				}

				/*
			 * No Supplier has no recurrence identity.
			 * Two same-name rows therefore represent separate
			 * potential Ingredients and should be warned.
			 */
				identities.add(
					`no-supplier-row:${item.index}`
				);
			});


			if (identities.size > 1) {
				group.forEach(item => {
					/*
				 * Do not warn an established recurrence update
				 * merely because another separate row has the
				 * same name.
				 *
				 * Warn the row that would create the additional
				 * Ingredient identity.
				 */
					if (item.isCreate) {
						duplicateIndexes.add(item.index);
					}
				});
			}
		});


		// ----------------------------------------------------------
		// Other impact counts
		// ----------------------------------------------------------

		const missingIngredientName =
					rows.filter(row =>
											!normalize(row.ingredient)
										 ).length;

		const missingIngredientCategory =
					rows.filter(row =>
											normalize(row.ingredient) &&
											!String(row.category_id || "").trim()
										 ).length;

		const unmappedUnits =
					rows.filter(row =>
											normalize(row.ingredient) &&
											String(row.source_unit || "").trim() &&
											!String(row.unit_id || "").trim()
										 ).length;


		return {
			totalIngredients: rows.length,

			newIngredients,
			updatedIngredients,

			duplicateNames:
			duplicateIndexes.size,

			missingIngredientCategory,
			unmappedUnits,
			missingIngredientName
		};
	},

	async openImportConfirm() {
		await Promise.all([
			qryImpExistingIngredients.run(),
			qryImpExistingSupplierItems.run()
		]);

		const impact =
					this.buildImportImpact();

		await storeValue(
			"impImpact",
			impact
		);

		showModal(
			mdlImportConfirm.name
		);

		return true;
	},

	importConfirmQuestion() {
		const count =
					appsmith.store.impImpact?.totalIngredients || 0;

		const supplier =
					selImportListSupplier.selectedOptionLabel || "No Supplier";

		return `Do you want to import ${count} Ingredients to ${supplier}?`;
	},

	async applyValueMapEdit() {
		const edits =
					tblImportMapItems.updatedRows || [];

		if (!edits.length) {
			return false;
		}

		const edit =
					edits[edits.length - 1];

		const type =
					edit?.allFields?.type;

		const importedValue =
					edit?.allFields?.imported_data;

		const targetId =
					edit?.updatedFields?.map_to;

		if (!type || !importedValue) {
			return false;
		}

		const rows =
					(appsmith.store.impValueMapRows || [])
		.map(row => ({ ...row }));

		const row =
					rows.find(
						x =>
						x.type === type &&
						x.imported_data === importedValue
					);

		if (row) {
			// Value mappings are many-to-one.
			// Do not clear another row using the same target.
			row.map_to =
				targetId || "";
		}

		await storeValue(
			"impValueMapRows",
			rows
		);

		resetWidget(
			"tblImportMapItems"
		);

		return true;
	},

	async confirmImport() {
		try {
			const data = await qryCommitIngredientImport.run();
			const result = data?.[0]?.result || {};

			closeModal("mdlImportConfirm");

			showAlert(
				`${result.created_ingredients || 0} Ingredients added, ${result.updated_ingredients || 0} updated.`,
				"success"
			);

			await this.discardImport();

			return true;

		} catch (error) {
			return jsUserErrors.show(
				error,
				"Ingredient list could not be imported."
			);
		}
	},
}