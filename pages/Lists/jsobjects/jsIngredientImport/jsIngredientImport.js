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
		const edits = tblImportMapHeaders.updatedRows || [];

		if (!edits.length) {
			return false;
		}

		const edit = edits[edits.length - 1];

		const importedHeader =
					edit?.allFields?.["Imported Data"];

		const targetField =
					edit?.updatedFields?.["Map To"];

		if (!importedHeader) {
			return false;
		}

		const rows = (appsmith.store.impHeaderMapRows || [])
		.map(row => ({ ...row }));

		if (targetField) {
			rows.forEach(row => {
				if (
					row["Imported Data"] !== importedHeader &&
					row["Map To"] === targetField
				) {
					row["Map To"] = "";
				}
			});
		}

		const row = rows.find(
			x => x["Imported Data"] === importedHeader
		);

		if (row) {
			row["Map To"] = targetField || "";
		}

		await storeValue(
			"impHeaderMapRows",
			rows
		);

		resetWidget("tblImportMapHeaders");

		return true;
	},

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
		const file = filImportListPriceList.files?.[0];

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

			const sheetName = workbook.SheetNames[0];
			const sheet = workbook.Sheets[sheetName];

			const sourceRows = XLSX.utils.sheet_to_json(
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

			const sourceHeaders = Object.keys(sourceRows[0]);

			const headerSignature = sourceHeaders
			.map(h => String(h || "").trim().toLowerCase())
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

			let headerMapRows = sourceHeaders.map(header => ({
				"Imported Data": header,
				"Map To": this.suggestHeaderMap(header)
			}));

			const supplierValue =
						selImportListSupplier.selectedOptionValue;

			if (supplierValue) {
				const savedMappings =
							await qryImpSavedMappings.run();

				const savedHeaderMappings =
							(savedMappings || []).filter(
								row =>
								row.mapping_scope === "header"
							);

				if (savedHeaderMappings.length) {
					headerMapRows = sourceHeaders.map(header => {
						const saved =
									savedHeaderMappings.find(
										row =>
										String(row.source_value || "")
										.trim()
										.toLowerCase() ===
										String(header || "")
										.trim()
										.toLowerCase()
									);

						return {
							"Imported Data": header,
							"Map To": saved?.target_value || ""
						};
					});

					await storeValue(
						"impHeaderMapRows",
						headerMapRows
					);

					await storeValue(
						"impAppliedHeaderMapRows",
						headerMapRows.map(row => ({
							...row
						}))
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
		const rows = (appsmith.store.impHeaderMapRows || [])
		.map(row => ({ ...row }));

		const ingredientMapping = rows.find(
			row => row["Map To"] === "ingredient"
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

			const match = rows.find(
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

			const match = rows.find(
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

		const categoryHeader = headerMapRows.find(
			row => row["Map To"] === "category"
		)?.["Imported Data"];

		const unitHeader = headerMapRows.find(
			row => row["Map To"] === "unit"
		)?.["Imported Data"];

		const rows = [];

		if (categoryHeader) {
			const categories = [
				...new Set(
					sourceRows
					.map(row => row[categoryHeader])
					.filter(
						value =>
						value !== null &&
						value !== undefined &&
						String(value).trim() !== ""
					)
					.map(value => String(value).trim())
				)
			];

			const categoryOptions = [
				{
					label: "",
					value: ""
				},
				...(qryImpCategories.data || []).map(x => ({
					label: x.name,
					value: String(x.id)
				})),
				{
					label: "+ Add New Category",
					value: "__ADD_NEW_CATEGORY__"
				}
			];

			categories.forEach(value => {
				rows.push({
					"Type": "Category",
					"Imported Data": value,
					"Map To": "",
					"Options": categoryOptions
				});
			});
		}

		if (unitHeader) {
			const units = [
				...new Set(
					sourceRows
					.map(row => row[unitHeader])
					.filter(
						value =>
						value !== null &&
						value !== undefined &&
						String(value).trim() !== ""
					)
					.map(value => String(value).trim())
				)
			];

			const unitOptions = (qryImpUnits.data || []).map(x => ({
				label: `${x.abbreviation} (${x.name})`,
				value: String(x.id)
			}));

			units.forEach(value => {
				rows.push({
					"Type": "Unit",
					"Imported Data": value,
					"Map To": "",
					"Options": unitOptions
				});
			});
		}

		return rows;
	},

	async initialiseValueMapRows() {
		const rows =
					this.buildValueMapRows();

		await storeValue(
			"impValueMapRows",
			rows
		);

		resetWidget("tblImportMapItems");

		return true;
	},

		mappingOptions(row) {
			const isCategory =
						row?.mapping_type === "category" ||
						row?.["Type"] === "Category";

			if (isCategory) {
				const rows =
							Array.isArray(qryImpCategories.data)
				? qryImpCategories.data
				: [];

				return [
					{ label: "", value: "" },
					...rows.map(x => ({
						label: x.name,
						value: String(x.id)
					})),
					{
						label: "+ Add New Category",
						value: "__ADD_NEW_CATEGORY__"
					}
				];
			}

			const rows =
						Array.isArray(qryImpUnits.data)
			? qryImpUnits.data
			: [];

			return rows.map(x => ({
				label: `${x.abbreviation} (${x.name})`,
				value: String(x.id)
			}));
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
							edit?.allFields?.["Type"];

				const importedValue =
							edit?.allFields?.["Imported Data"];

				const targetId =
							edit?.updatedFields?.["Map To"];

				if (!type || !importedValue) {
					return false;
				}

				const rows =
							(appsmith.store.impValueMapRows || [])
				.map(row => ({ ...row }));

				const row = rows.find(
					x =>
					x["Type"] === type &&
					x["Imported Data"] === importedValue
				);

				if (row) {
					row["Map To"] =
						targetId || "";
				}

				await storeValue(
					"impValueMapRows",
					rows
				);

				return true;
			},
}