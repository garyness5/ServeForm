export default {
	async updateAll() {
		await syncEligibleGroEvents.run();

		await checkGroToOrderRemovalImpact.run();

		const impact = checkGroToOrderRemovalImpact.data?.[0] || {};

		const excludedGeneratedCount = Number(impact.excluded_generated_count || 0);
		const hasManualValues = impact.has_manual_values === true;
		const participatingCount = Number(impact.participating_count || 0);

		if (
			excludedGeneratedCount > 0 &&
			hasManualValues &&
			participatingCount > 0
		) {
			showModal("mdlGroToOrderRemove");
			return false;
		}

		return await this.runUpdateAll(true);
	},

  async runUpdateAll(keepManual = true) {
    await refreshGroDetails.run();
    await refreshGroOrder.run();

    if (!keepManual) {
      await clearGroOrderManualValues.run();
      await refreshGroOrder.run();
    }

    await clearGroPrint.run();

    await getGroEvents.run();
    await resetWidget("tblGroEvents", true);
    await tblGroEvents.setData(getGroEvents.data);

    closeModal("mdlGroToOrderRemove");

    showAlert(
      keepManual
        ? "Update complete. Quantities kept where possible. Print list cleared."
        : "Update complete. Quantities removed. Print list cleared.",
      "success"
    );

    return true;
  },

  async confirmToOrderRemoval(keepManual = true) {
    return await this.runUpdateAll(keepManual);
  },

  async cancelToOrderRemoval() {
    closeModal("mdlGroToOrderRemove");

    await getGroEvents.run();
    await resetWidget("tblGroEvents", true);
    await tblGroEvents.setData(getGroEvents.data);

    return true;
  }
}