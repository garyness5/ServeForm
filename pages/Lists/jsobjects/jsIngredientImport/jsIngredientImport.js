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

		// New assignment wins.
		// Remove the same Savveyra target from every other row.
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

		// Apply the new assignment.
		const row = rows.find(
			x => x["Imported Data"] === importedHeader
		);

		if (row) {
			row["Map To"] = targetField || "";
		}

		await storeValue("impHeaderMapRows", rows);

		// Clear Appsmith's temporary editable-table state
		// and redraw from our working state.
		resetWidget("tblImportMapHeaders");

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

			// ----------------------------------------------------
			// Raw import working state
			// ----------------------------------------------------

			await storeValue(
				"impSourceHeaders",
				sourceHeaders
			);

			await storeValue(
				"impSourceRows",
				sourceRows
			);

			// ----------------------------------------------------
			// Initial Header Mapping working state
			// Suggestions are applied once here.
			// ----------------------------------------------------

			const headerMapRows =
						sourceHeaders.map(header => ({
							"Imported Data": header,
							"Map To":
							this.suggestHeaderMap(header)
						}));

			await storeValue(
				"impHeaderMapRows",
				headerMapRows
			);

			// ----------------------------------------------------
			// Clear downstream state from any previous file
			// ----------------------------------------------------

			await removeValue(
				"impParsedRows"
			);

			await removeValue(
				"impBatchId"
			);

			showAlert(
				`Loaded ${sourceRows.length} rows from "${sheetName}"`,
				"success"
			);

			return {
				sheetName,
				rowCount: sourceRows.length,
				headers: sourceHeaders
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


	// ============================================================
	// Category / Unit Mapping
	// ============================================================

	mappingOptions(row) {
		const isCategory =
					row?.mapping_type === "category";

		const data = isCategory
		? qryImpCategories.data
		: qryImpUnits.data;

		const rows =
					Array.isArray(data)
		? data
		: [];

		return rows.map(x => ({
			label: isCategory
			? x.name
			: `${x.abbreviation} - ${x.name}`,
			value: String(x.id)
		}));
	}

}