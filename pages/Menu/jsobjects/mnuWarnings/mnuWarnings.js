export default {
	rows() {
		return mnuCompTable.rowsForSave();
	},

	list() {
		return mnuWarnEngine.buildWarnings({
			rows: this.rows(),
			parentLabel: "Menu",
			parentActive: chkMnuActive.isChecked,
			parentYieldQty: inpMnuYieldQty.text,
			parentYieldUnit: selMnuYieldUnit.selectedOptionValue
		});
	},

	text() {
		const warnings = this.list();

		if (!warnings.length) return "";

		return "Your total cost may be wrong<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• " +
			warnings.join("<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• ");
	}
}