export default {
  mergedRows() {
    const rows = tblGroPrint.tableData || [];
    const updates = tblGroPrint.updatedRows || [];

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
      .map((r, index) => ({
        id: Number(r.id),
        purchased: r.purchased === true ? true : false,
        print_sort_no: index + 1
      }));
  },

  async savePrint() {
    await saveGroPrintRows.run();
    await getGroPrint.run();
    await resetWidget("tblGroPrint", true);
    await tblGroPrint.setData(getGroPrint.data);
    showAlert("Print saved.", "success");
    return true;
  }
}