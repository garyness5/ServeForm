export default {
	selectedDishId() {
		return Number(tblDishList.selectedRow?.id || 0);
	},

	hasSelection() {
		return this.selectedDishId() > 0;
	},

	async openSelectedDish() {
		if (!this.hasSelection()) {
			showAlert("Select a dish first.", "warning");
			return false;
		}

		await storeValue("current_dish_id", this.selectedDishId());
		navigateTo("Dish");
		return true;
	},

	async addDish() {
		await storeValue("current_dish_id", 0);
		await removeValue("dsh_components_local_rows");
		navigateTo("Dish");
		return true;
	},

	async duplicateSelectedDish() {
		if (!this.hasSelection()) {
			showAlert("Select a dish first.", "warning");
			return false;
		}

		const result = await duplicateDshFromList.run();
		const newId = result?.[0]?.new_id || result?.[0]?.id;

		if (!newId) {
			showAlert("Dish duplicate failed.", "error");
			return false;
		}

		await getDishList.run();

		showAlert("Dish duplicated.", "success");
		return true;
	},

	async deleteSelectedDishStart() {
		if (!this.hasSelection()) {
			showAlert("Select a dish first.", "warning");
			return false;
		}

		await getDshListImpactCount.run();
		showModal("mdlDshListDeleteConfirm");

		return true;
	},

	async deleteSelectedDishConfirm() {
		if (!this.hasSelection()) {
			showAlert("Select a dish first.", "warning");
			return false;
		}

		await deleteDshFromList.run();

		closeModal("mdlDshListDeleteConfirm");

		await getDishList.run();

		showAlert("Dish deleted.", "success");

		return true;
	}
}