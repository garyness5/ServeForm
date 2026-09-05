export default {
	selectedMenuId() {
		return Number(tblMnuList.selectedRow?.id || 0);
	},

	hasSelection() {
		return this.selectedMenuId() > 0;
	},

	async openSelectedMenu() {
		if (!this.hasSelection()) {
			showAlert("Select a menu first.", "warning");
			return false;
		}

		await storeValue("current_menu_id", this.selectedMenuId());
		navigateTo("Menu");
		return true;
	},

	async addMenu() {
		await storeValue("current_menu_id", 0);
		await removeValue("mnu_components_local_rows");
		navigateTo("Menu");
		return true;
	},

	async duplicateSelectedMenu() {
		if (!this.hasSelection()) {
			showAlert("Select a menu first.", "warning");
			return false;
		}

		const result = await qryMnuLstDuplicateMnuFromList.run();
		const newId = result?.[0]?.new_id || result?.[0]?.id;

		if (!newId) {
			showAlert("Menu duplicate failed.", "error");
			return false;
		}

		await qryMnuLstGetMnuList.run();

		showAlert("Menu duplicated.", "success");
		return true;
	},

	async deleteSelectedMenuStart() {

		if (!this.hasSelection()) {
			showAlert("Select a menu first.", "warning");
			return false;
		}

		await qryMnuLstGetImpactCount.run();
		showModal("mdlMnuDelete");

		return true;
	},
	
	async deleteSelectedMenuConfirm() {
		if (!this.hasSelection()) {
			showAlert("Select a menu first.", "warning");
			return false;
		}

		await qryMnuLstDeleteMnuFromList.run();

		closeModal("mdlMnuDelete");

		await qryMnuLstGetMnuList.run();

		showAlert("Menu deleted.", "success");
		return true;
	}
}