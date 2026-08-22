export default {

	norm(value) {
		return (value || "")
			.trim()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toLowerCase();
	},


	async openAdd() {
		resetWidget("inpPLAddName");
		showModal("mdlPLAdd");

		return true;
	},


	async saveAdd() {
		const newName =
					(inpPLAddName.text || "").trim();

		if (!newName) {
			return false;
		}

		const exists =
					(qryGetPicklistItems.data || [])
		.some(
			item =>
			item.name &&
			this.norm(item.name) ===
			this.norm(newName)
		);

		if (exists) {
			showAlert(
				"Name already exists in this list",
				"warning"
			);

			return false;
		}

		await qryAddListItem.run();

		await qryGetPicklistItems.run();

		resetWidget("inpPLAddName");

		closeModal("mdlPLAdd");

		return true;
	},


	async openRename() {
		if (!jsPicklistRules.hasSelection()) {
			showAlert(
				"Select an item first.",
				"warning"
			);

			return false;
		}

		if (jsPicklistRules.isProtectedSystemItem()) {
			return false;
		}

		resetWidget("inpPLRenameName");

		showModal("mdlPLRename");

		return true;
	},


	async saveRename() {
		const newName =
					(inpPLRenameName.text || "").trim();

		const oldId =
					Number(tblListsItems.selectedRow?.id || 0);

		if (!newName || !oldId) {
			return false;
		}

		const exists =
					(qryGetPicklistItems.data || [])
		.some(
			item =>
			Number(item.id) !== oldId &&
			item.name &&
			this.norm(item.name) ===
			this.norm(newName)
		);

		if (exists) {
			showAlert(
				"Name already exists in this list",
				"warning"
			);

			return false;
		}

		await renamePicklistItem.run();

		await qryGetPicklistItems.run();

		closeModal("mdlPLRename");

		showAlert(
			"Item renamed",
			"success"
		);

		return true;
	},


	async cleanupBlankRows() {
		await cleanupBlankHelperItems.run();

		await qryGetPicklistItems.run();

		showAlert(
			"Blank list items cleaned up",
			"success"
		);

		return true;
	},


	async openReplaceDelete() {
		if (!jsPicklistRules.hasSelection()) {
			showAlert("Select an item first.", "warning");
			return false;
		}

		if (jsPicklistRules.isProtectedSystemItem()) {
			return false;
		}

		await qryGetListItemImpact.run();

		resetWidget("radPLReplaceDeleteAction");
		resetWidget("selPLReplaceWith");

		showModal("mdlPLReplace");

		return true;
	},

	onReplaceDeleteActionChange() {
		return true;
	},

	async saveReplaceDelete() {
		const action =
					jsPicklistRules.isDietTag()
		? "delete"
		: radPLReplaceDeleteAction.selectedOptionValue;

		const replaceToId =
					jsPicklistRules.isDietTag()
		? null
		: selPLReplaceWith.selectedOptionValue;

		if (!action) {
			return false;
		}

		if (
			action === "replace" &&
			!replaceToId
		) {
			showAlert(
				"Select a replacement item first.",
				"warning"
			);

			return false;
		}

		await qryGetListItemImpact.run();

		await storeValue(
			"plReplaceAction",
			action === "replace"
			? "Replace"
			: "Delete"
		);

		await storeValue(
			"plReplaceToId",
			replaceToId || null
		);

		return await this.confirmReplaceDelete();
	},


	async confirmReplaceDelete() {
		await qryReplaceDeleteListItem.run();

		await qryGetPicklistItems.run();

		closeModal("mdlPLReplace");

		showAlert(
			appsmith.store.plReplaceAction === "Replace"
			? "Item replaced everywhere used."
			: appsmith.store.plReplaceToId
			? "Item replaced everywhere used and deleted."
			: "Item deleted.",
			"success"
		);

		return true;
	},
}