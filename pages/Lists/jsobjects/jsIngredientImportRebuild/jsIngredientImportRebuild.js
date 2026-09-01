export default {

	async loadFile() {

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
			.map(header =>
					 String(header || "")
					 .trim()
					 .toLowerCase()
					)
			.join("|");

			const headerMapRows =
						sourceHeaders.map(
							(header, index) => ({
								id: `hdr_${index + 1}`,
								imported_data: header,
								map_to: this.suggestHeaderMap(header)
							})
						);

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

			await storeValue(
				"impHeaderMapRows",
				headerMapRows
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
				"impImpact"
			);

			return true;

		} catch (error) {

			return jsUserErrors.show(
				error,
				"Ingredient file could not be loaded."
			);
		}
	},

	suggestHeaderMap(header) {
		const key =
					String(header || "")
		.trim()
		.toLowerCase();

		const matches = {
			"code": "item_number",
			"item code": "item_number",
			"item number": "item_number",
			"sku": "item_number",

			"category": "category",

			"ingredient": "ingredient",
			"ingredient name": "ingredient",
			"description": "ingredient",
			"item description": "ingredient",

			"qty": "qty",
			"quantity": "qty",

			"unit": "unit",
			"uom": "unit",

			"cost": "cost",
			"price": "cost",
			"case price": "cost"
		};

		return matches[key] || "";
	},

	async applyHeaderMapping() {
		const rows =
					appsmith.store.impHeaderMapRows || [];

		const hasIngredient =
					rows.some(
						row =>
						row.map_to === "ingredient"
					);

		if (!hasIngredient) {
			showAlert(
				"Map one source column to Ingredient before continuing.",
				"warning"
			);
			return false;
		}

		await storeValue(
			"impAppliedHeaderMapRows",
			rows
		);

		await storeValue(
			"impAppliedHeaderSignature",
			appsmith.store.impHeaderSignature || ""
		);

		await removeValue(
			"impValueMapRows"
		);

		await removeValue(
			"impImpact"
		);

		await removeValue("impValueMapRows");

		return true;
	},

	buildValueMapRows() {
		const sourceRows =
					appsmith.store.impSourceRows || [];

		const headerRows =
					appsmith.store.impAppliedHeaderMapRows || [];

		const sourceFor = target =>
		headerRows.find(
			row => row.map_to === target
		)?.imported_data || "";

		const categoryHeader =
					sourceFor("category");

		const unitHeader =
					sourceFor("unit");

		const uniqueValues = (header, type) => {
			if (!header) return [];

			const seen = new Set();

			return sourceRows.reduce((result, row) => {
				const display =
							String(row?.[header] ?? "").trim();

				if (!display) return result;

				const key =
							display
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "")
				.toLowerCase();

				if (seen.has(key)) return result;

				seen.add(key);

				result.push({
					id: `${type.toLowerCase()}_${result.length + 1}`,
					type: type,
					imported_data: display,
					map_to: ""
				});

				return result;
			}, []);
		};

		return [
			...uniqueValues(categoryHeader, "Category"),
			...uniqueValues(unitHeader, "Unit")
		];
	},

	async rebuildValueMappings() {
		await Promise.all([
			qryImpCategories.run(),
			qryImpUnits.run()
		]);

		const rows = this.buildValueMapRows();

		await storeValue(
			"impValueMapRows",
			rows
		);

		return true;
	},

	async supplierChanged() {
		const supplierValue =
					selImportListSupplier.selectedOptionValue || "";

		await storeValue(
			"impSelectedSupplierId",
			supplierValue
		);

		if (
			!(appsmith.store.impAppliedHeaderMapRows || []).length
		) {
			await removeValue("impValueMapRows");
			return true;
		}

		await this.rebuildValueMappings();

		return true;
	},

	async updateHeaderMapping(rowId, selectedValue) {
		const rows =
					appsmith.store.impHeaderMapRows || [];

		const updatedRows =
					rows.map(row => {
						if (row.id === rowId) {
							return {
								...row,
								map_to: selectedValue || ""
							};
						}

						if (
							selectedValue &&
							row.map_to === selectedValue
						) {
							return {
								...row,
								map_to: ""
							};
						}

						return row;
					});

		await storeValue(
			"impHeaderMapRows",
			updatedRows
		);

		if (this.isHeaderMappingDirty(updatedRows)) {
			await removeValue("impValueMapRows");
			await removeValue("impImpact");
		}

		return true;
	},

	isHeaderMappingDirty(rows = null) {
		const editable =
					rows ||
					appsmith.store.impHeaderMapRows ||
					[];

		const applied =
					appsmith.store.impAppliedHeaderMapRows ||
					[];

		if (editable.length !== applied.length) {
			return true;
		}

		return editable.some(row => {
			const appliedRow =
						applied.find(
							saved => saved.id === row.id
						);

			return (
				!appliedRow ||
				appliedRow.map_to !== row.map_to
			);
		});
	}
};