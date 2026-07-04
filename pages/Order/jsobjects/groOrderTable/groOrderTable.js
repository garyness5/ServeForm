export default {
  clean(value) {
    if (value === undefined || value === "") return null;
    if (value === null) return null;
    if (typeof value === "number") return Number(value);
    if (!isNaN(value) && value !== true && value !== false) return Number(value);
    return value;
  },

  mergedRows() {
    const rows = tblGroOrder.tableData || [];
    const updates = tblGroOrder.updatedRows || [];

    return rows.map((row, index) => {
      const update = updates.find(u =>
        u.index === index ||
        u.rowIndex === index ||
        Number(u.allFields?.id || u.updatedFields?.id || u.id || 0) === Number(row.id || 0)
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
      .map(r => ({
        id: Number(r.id),
        required_unit_id: this.clean(r.required_unit_id),
        buy_qty: this.clean(r.buy_qty),
        buy_unit_id: this.clean(r.buy_unit_id),
        to_order: r.to_order === false ? false : true,
        purchased: r.purchased === true ? true : false,
        supplier_id: this.clean(r.supplier_id),
        packaging_id: this.clean(r.packaging_id),
        packs_to_order: this.clean(r.packs_to_order)
      }));
  },
	
	unitById(id) {
		return (getUnits.data || []).find(u => Number(u.id) === Number(id));
	},

	convertedRequiredQty(row) {
		const storedQty = Number(row.stored_required_qty ?? row.required_qty ?? 0);
		const storedUnit = this.unitById(row.stored_required_unit_id ?? row.required_unit_id);
		const displayUnit = this.unitById(row.required_unit_id);

		if (!storedQty || !storedUnit || !displayUnit) return row.required_qty;

		return Math.round(
			(storedQty * Number(storedUnit.factor_to_base) / Number(displayUnit.factor_to_base)) * 100
		) / 100;
	},

	onRequiredUnitChange(row) {
		const newQty = this.convertedRequiredQty(row);

		return storeValue(
			"gro_order_local_rows",
			(tblGroOrder.tableData || []).map(r =>
				Number(r.id) === Number(row.id)
					? {
							...r,
							required_unit_id: row.required_unit_id,
							required_qty: newQty,
							required_unit: this.unitById(row.required_unit_id)?.abbreviation || r.required_unit
						}
					: r
			)
		);
	},

	async updateAll() {
		await syncEligibleGroEvents.run();
		await refreshGroDetails.run();
		await refreshGroOrder.run();
		await clearGroPrint.run();

		await getGroOrder.run();
		await resetWidget("tblGroOrder", true);
		await tblGroOrder.setData(getGroOrder.data);

		showAlert("Update complete. Print list cleared.", "success");
		return true;
	},
	
  testSaveData() {
    return {
      tableDataCount: (tblGroOrder.tableData || []).length,
      updatedRows: tblGroOrder.updatedRows || [],
      firstRow: (tblGroOrder.tableData || [])[0],
      rowsForSave: this.rowsForSave()
    };
  }
}