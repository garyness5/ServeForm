export default {
	async readWorkbook() {
		const file = filImpPriceList.files?.[0];

		if (!file?.data) {
			showAlert("Please choose an Excel file.", "warning");
			return;
		}

		if (!selImpSupplier.selectedOptionValue) {
			showAlert("Please select a Supplier.", "warning");
			return;
		}

		try {
			// ------------------------------------------------------------
			// Read workbook
			// ------------------------------------------------------------

			const workbook = XLSX.read(file.data, {
				type: "binary"
			});

			if (!workbook.SheetNames?.length) {
				showAlert("No worksheets were found in this Excel file.", "error");
				return;
			}

			const sheetName = workbook.SheetNames[0];
			const sheet = workbook.Sheets[sheetName];

			const sourceRows = XLSX.utils.sheet_to_json(sheet, {
				defval: null
			});
			// ------------------------------------------------------------
			// Temporary GFS mapping
			// Later replaced by frontend column mapping.
			// ------------------------------------------------------------

			const rows = sourceRows.map((row, index) => ({
				source_row_no: index + 2,

				"Item number":
				row["Item Number"] == null
				? null
				: String(row["Item Number"]).trim(),

				"Category":
				row["Category"] == null
				? null
				: String(row["Category"]).trim(),

				"Ingredient":
				row["Item Description"] == null
				? null
				: String(row["Item Description"]).trim(),

				"Qty":
				row["Total qty"] == null
				? null
				: Number(row["Total qty"]),

				"Unit":
				row["Unit"] == null
				? null
				: String(row["Unit"]).trim(),

				"Cost":
				row["Case price"] == null
				? null
				: Number(
					String(row["Case price"])
					.replace(/[$,\s]/g, "")
				)
			}));

			await storeValue("impParsedRows", rows);

			// ------------------------------------------------------------
			// Create import batch
			// ------------------------------------------------------------

			const batchResult = await qryImpCreateBatch.run();

			const batchId = batchResult?.[0]?.batch_id;

			if (!batchId) {
				throw new Error("Import batch could not be created.");
			}

			await storeValue("impBatchId", batchId);

			// ------------------------------------------------------------
			// Stage parsed rows
			// ------------------------------------------------------------

			const stageResult = await qryImpStageRows.run();
			const stagedCount = stageResult?.[0]?.staged_count ?? 0;

			await qryImpMappings.run();

			showAlert(
				`Loaded ${stagedCount} rows from "${sheetName}"`,
				"success"
			);

			showModal(mdlImpMappings.name);

			return stageResult;

		} catch (error) {
			showAlert(
				error?.message || "The price list could not be loaded.",
				"error"
			);
		}
	},

	mappingOptions(row) {
		const isCategory = row?.mapping_type === "category";

		const data = isCategory
		? qryImpCategories.data
		: qryImpUnits.data;

		const rows = Array.isArray(data) ? data : [];

		return rows.map(x => ({
			label: isCategory
			? x.name
			: `${x.abbreviation} - ${x.name}`,
			value: String(x.id)
		}));
	},
}