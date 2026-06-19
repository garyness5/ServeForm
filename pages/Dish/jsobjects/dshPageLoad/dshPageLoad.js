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

		if (!Array.isArray(getDshItemById.data) || getDshItemById.data.length === 0) {
			await this.loadNewDish();
			return false;
		}

		await getSelectedDshDietTags.run();
		await getDshComponents.run();
		await dshCompTable.loadFromQuery();

		return true;
	},

	async loadNewDish() {
		showAlert("loadNewDish ran", "warning");
		
		await storeValue("current_dish_id", 0);
		await removeValue("dsh_components_local_rows");
		await dshCompTable.setRows([]);

		await resetWidget("inpDshName", true);
		await resetWidget("selDshCategory", true);
		await resetWidget("selDshFormat", true);
		await resetWidget("chkDshActive", true);
		await resetWidget("inpDshYieldQty", true);
		await resetWidget("selDshYieldUnit", true);
		await resetWidget("inpDshExtraPercent", true);
		await resetWidget("msDshDietTags", true);
		await resetWidget("rteDshNotes", true);
		await resetWidget("tblDshComponents", true);

		return true;
	},

	async onPageLoad() {
		await this.loadLookups();

		const dishId = Number(appsmith.store.current_dish_id || 0);

		if (dishId > 0) {
			await this.loadExistingDish();
		} else {
			await this.loadNewDish();
		}
	}
}