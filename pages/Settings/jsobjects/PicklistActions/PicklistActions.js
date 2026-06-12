export default {
	async confirmReplaceDelete() {
		if (appsmith.store.plReplaceAction === "Replace") {
			await updPicklistReplaceEverywhere.run();

			await getPicklistItems.run();
			closeModal("mdPLReplaceConfirm");
			closeModal("mdlPLReplace");
			showAlert("Item replaced everywhere used", "success");
			return true;
		}

		if (appsmith.store.plReplaceToId) {
			await updPicklistReplaceEverywhere.run();
			await delPicklistItem.run();

			await getPicklistItems.run();
			closeModal("mdPLReplaceConfirm");
			closeModal("mdlPLReplace");
			showAlert("Item replaced everywhere used and deleted", "success");
			return true;
		}

		await delPicklistItem.run();

		await getPicklistItems.run();
		closeModal("mdPLReplaceConfirm");
		closeModal("mdlPLReplace");
		showAlert("Item deleted", "success");
		return true;
	}
}