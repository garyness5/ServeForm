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
			const categories = [
				...new Set(
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
				)
			];

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
			const units = [
				...new Set(
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
				)
			];

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
						clean(sourceValue);

			if (!source) {
				return "";
			}

			const match =
						valueMapRows.find(
							row =>
							row.type === type &&
							clean(row.imported_data) === source
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
					this.buildMappedImportRows();

		const existingIngredients =
					Array.isArray(qryImpExistingIngredients.data)
		? qryImpExistingIngredients.data
		: [];

		const existingSupplierItems =
					Array.isArray(qryImpExistingSupplierItems.data)
		? qryImpExistingSupplierItems.data
		: [];

		const normaliseName = value =>
		String(value || "")
		.trim()
		.toLowerCase();

		const normaliseCode = value =>
		String(value || "")
		.trim()
		.toLowerCase();

		const validRows =
					rows.filter(
						row =>
						normaliseName(row.ingredient)
					);

		const missingIngredientName =
					rows.length - validRows.length;

		const missingIngredientsCategory =
					validRows.filter(
						row =>
						!row.category_id
					).length;

		const unmappedUnits =
					validRows.filter(
						row =>
						row.source_unit &&
						!row.unit_id
					).length;

		// ------------------------------------------------------------
		// Existing Ingredient names
		// Exact normalized-name match only.
		// ------------------------------------------------------------

		const existingNameSet =
					new Set(
						existingIngredients
						.map(
							row =>
							normaliseName(
								row.name_norm || row.name
							)
						)
						.filter(Boolean)
					);

		// ------------------------------------------------------------
		// Duplicate names inside the import file
		// ------------------------------------------------------------

		const importNameCounts = {};

		validRows.forEach(row => {
			const name =
						normaliseName(
							row.ingredient
						);

			importNameCounts[name] =
				(importNameCounts[name] || 0) + 1;
		});

		const duplicateNameRows =
					new Set();

		validRows.forEach((row, index) => {
			const name =
						normaliseName(
							row.ingredient
						);

			if (
				existingNameSet.has(name) ||
				importNameCounts[name] > 1
			) {
				duplicateNameRows.add(index);
			}
		});

		// ------------------------------------------------------------
		// Supplier recurrence
		//
		// Code match first.
		// If Code is blank, use exact normalized Ingredient name.
		// ------------------------------------------------------------

		const supplierCodeSet =
					new Set(
						existingSupplierItems
						.map(
							row =>
							normaliseCode(
								row.item_code
							)
						)
						.filter(Boolean)
					);

		const supplierNameSet =
					new Set(
						existingSupplierItems
						.map(
							row =>
							normaliseName(
								row.name_norm ||
								row.supplier_name
							)
						)
						.filter(Boolean)
					);

		let updatedIngredients = 0;
		let newIngredients = 0;

		validRows.forEach(row => {
			const code =
						normaliseCode(
							row.code
						);

			const name =
						normaliseName(
							row.ingredient
						);

			const isUpdate =
						code
			? supplierCodeSet.has(code)
			: supplierNameSet.has(name);

			if (isUpdate) {
				updatedIngredients += 1;
			} else {
				newIngredients += 1;
			}
		});

		return {
			total_rows:
			rows.length,

			importable_rows:
			validRows.length,

			new_ingredients:
			newIngredients,

			updated_ingredients:
			updatedIngredients,

			duplicate_names:
			duplicateNameRows.size,

			missing_ingredients_category:
			missingIngredientsCategory,

			unmapped_units:
			unmappedUnits,

			missing_ingredient_name:
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
		const impact =
					appsmith.store.impImpact || {};

		const supplier =
					selImportListSupplier.selectedOptionLabel ||
					"No Supplier";

		return `Do you want to import ${impact.importable_rows || 0} Ingredients to ${supplier}?`;
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
	}
}