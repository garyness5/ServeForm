export default {
	async loadLookups() {
		await getDshCategories.run();
		await getDshFormats.run();
		await getDshDietTags.run();
		await getDshComponentUnits.run();
		await getDshComponentItems.run();
	},

	async loadExistingDish() {
		await getDshItemById.run();
		await getSelectedDshDietTags.run();
		await getDshComponents.run();
		await dshCompTable.loadFromQuery();
	},

	async loadNewDish() {
		await storeValue("current_dish_id", 0);
		await removeValue("dsh_components_local_rows");
		await dshCompTable.clearDraftRows();
		await storeValue("dsh_components_local_rows", dshCompTable.normalizeRows([]));
	},

	async onPageLoad() {
		await this.loadLookups();

		if (Number(appsmith.store.current_dish_id || 0) > 0) {
			await this.loadExistingDish();
		} else {
			await this.loadNewDish();
		}
	}
}