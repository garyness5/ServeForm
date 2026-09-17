export default {
	mergedRows() {
		const rows = tblGroPrint.tableData || [];
		const updates = tblGroPrint.updatedRows || [];

		return rows.map((row, index) => {
			const update = updates.find(u =>
																	u.index === index ||
																	u.rowIndex === index ||
																	Number(
				u.allFields?.id ||
				u.updatedFields?.id ||
				u.id ||
				0
			) === Number(row.id || 0)
																 );

			if (!update) return row;

			return {
				...row,
				...(update.allFields || {}),
				...(update.updatedFields || {})
			};
		});
	},

	rowsForSave() {
		return this.mergedRows()
			.filter(r => r.id)
			.map((r, index) => ({
			id: Number(r.id),
			purchased: r.purchased === true,
			print_sort_no: index + 1
		}));
	},

	savedRowsForCompare() {
		return (qryGroPrnGetPrint.data || [])
			.filter(r => r.id)
			.map(r => ({
			id: Number(r.id),
			purchased: r.purchased === true
		}));
	},

	tableDirty() {
		const current = this.rowsForSave()
		.map(r => ({
			id: Number(r.id),
			purchased: r.purchased === true
		}));

		return JSON.stringify(current) !==
			JSON.stringify(this.savedRowsForCompare());
	},

	isDirty() {
		return this.tableDirty();
	},

	async savePrint() {
		try {
			await qryGroPrnSavePrintRows.run();

			await qryGroPrnGetPrint.run();

			await resetWidget(
				"tblGroPrint",
				true
			);

			await tblGroPrint.setData(
				qryGroPrnGetPrint.data || []
			);

			showAlert(
				"Print saved.",
				"success"
			);

			return true;

		} catch (error) {
			showAlert(
				error?.message || "Print could not be saved.",
				"error"
			);

			return false;
		}
	},

	async updatePrint() {

		try {

			/*
         * Save any current Print working changes first.
         * Print Purchased remains Print-owned until rebuild.
         */
			if (this.isDirty()) {
				await qryGroPrnSavePrintRows.run();
			}

			/*
         * Rebuild Print from the current Order To Order rows.
         * Print reaches no further upstream than Order.
         */
			await qryGroPrnSendOrderToPrint.run();

			await qryGroPrnGetPrint.run();

			await resetWidget(
				"tblGroPrint",
				true
			);

			await tblGroPrint.setData(
				qryGroPrnGetPrint.data || []
			);

			showAlert(
				"Print updated from Order.",
				"success"
			);

			return true;

		} catch (error) {

			showAlert(
				error?.message ||
				"Print could not be updated.",
				"error"
			);

			return false;
		}
	},
}