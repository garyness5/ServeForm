export default {
	rows() {
		return jsDshCompTable.rowsForSave();
	},

  list() {
    return jsDshWarnEngine.buildWarnings({
      rows: this.rows(),
      parentLabel: "Recipe",
      parentActive: chkDshActive.isChecked,
      parentYieldQty: inpDshYieldQty.text,
      parentYieldUnit: selDshYieldUnit.selectedOptionValue
    });
  },

  text() {
    const warnings = this.list();

    if (!warnings.length) return "";

    return "Your total cost may be wrong<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• " +
       warnings.join("<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• ");
  }
}