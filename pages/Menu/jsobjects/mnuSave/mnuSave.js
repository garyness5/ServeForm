export default {
	async safeReset(widgetName) {
		try {
			await resetWidget(widgetName, true);
		} catch (e) {
			return null;
		}
	},

	requiredSaveMessage() {
		const missing = [];

		if (!String(inpMnuName.text || "").trim()) {
			missing.push("Menu name");
		}

		if (!selMnuCategory.selectedOptionValue) {
			missing.push("Category");
		}

		if (!missing.length) return null;

		return `You need to have a ${missing.join(" and a ")} selected before you can save.`;
	},

	async validateBeforeSave() {
		const message = this.requiredSaveMessage();

		if (message) {
			showAlert(message, "warning");
			return false;
		}

		await checkMnuNameExists.run();

		const matchCount = Number(checkMnuNameExists.data?.[0]?.match_count || 0);

		if (matchCount > 0) {
			showAlert("A menu with this name already exists.", "warning");
			return false;
		}

		return true;
	},

	async saveMenu() {
		if (!(await this.validateBeforeSave())) return false;

		await mnuCompTable.syncFromTable();

		const isExisting = Number(appsmith.store.current_menu_id || 0) > 0;
		let result = null;

		if (isExisting) {
			result = await updMnuItem.run();
		} else {
			result = await addMnuItem.run();

			const newId = result?.[0]?.id;
			if (newId) {
				await storeValue("current_menu_id", newId);
			}
		}

		await mnuCompTable.syncFromTable();

		await saveMnuDietTagsSnapshot.run();
		await saveMnuComponentsSnapshot.run();

		await getMnuItemById.run();
		await getSelectedMnuDietTags.run();
		await getMnuComponents.run();

		await mnuCompTable.loadFromQuery();

		showAlert("Menu saved", "success");
		return true;
	},

	async saveAndNew() {
		const result = await this.saveMenu();
		if (!result) return null;

		await storeValue("current_menu_id", 0);
		await mnuCompTable.clearDraftRows();
		await storeValue("mnu_components_local_rows", mnuCompTable.normalizeRows([]));

		await this.safeReset("inpMnuName");
		await this.safeReset("selMnuCategory");
		await this.safeReset("chkMnuActive");
		await this.safeReset("inpMnuYieldQty");
		await this.safeReset("selMnuYieldUnit");
		await this.safeReset("inpMnuExtraPercent");
		await this.safeReset("msMnuDietTags");
		await this.safeReset("rteMnuNotes");
		await this.safeReset("tblMnuComponents");

		await getMnuComponents.run();

		showAlert("Saved. Ready for new menu.", "success");
		return true;
	},

	clean(value) {
		if (value === undefined || value === "") return null;
		if (typeof value === "number") return Number(value);
		if (!isNaN(value) && value !== null && value !== true && value !== false) return Number(value);
		return value;
	},

	textClean(value) {
		const text = String(value || "").trim();
		return text || null;
	},

	headerSnapshotFromPage() {
		return {
			name: this.textClean(inpMnuName.text),
			category_id: this.clean(selMnuCategory.selectedOptionValue),
			active: chkMnuActive.isChecked === false ? false : true,
			yield_qty: this.clean(inpMnuYieldQty.text),
			yield_unit_id: this.clean(selMnuYieldUnit.selectedOptionValue),
			extra_percent: this.clean(inpMnuExtraPercent.text),
			notes: typeof rteMnuNotes !== "undefined" ? this.textClean(rteMnuNotes.value) : null
		};
	},

	headerSnapshotFromSaved() {
		const r = Array.isArray(getMnuItemById.data)
			? getMnuItemById.data[0]
			: getMnuItemById.data;

		if (!r) {
			return {
				name: null,
				category_id: null,
				active: true,
				yield_qty: null,
				yield_unit_id: null,
				extra_percent: 0,
				notes: null
			};
		}

		return {
			name: this.textClean(r.name),
			category_id: this.clean(r.category_id),
			active: r.active === false ? false : true,
			yield_qty: this.clean(r.yield_qty),
			yield_unit_id: this.clean(r.yield_unit_id),
			extra_percent: this.clean(r.extra_percent),
			notes: this.textClean(r.notes)
		};
	},

	componentSnapshot(rows) {
		return (rows || [])
			.filter(r => r.item_type && (r.ingredient_id || r.child_recipe_id || r.child_dish_id))
			.map((r, index) => ({
				line_no: index + 1,
				item_type: r.item_type || null,
				ingredient_id: r.item_type === "ingredient" ? this.clean(r.ingredient_id) : null,
				child_recipe_id: r.item_type === "recipe" ? this.clean(r.child_recipe_id) : null,
				child_dish_id: r.item_type === "dish" ? this.clean(r.child_dish_id) : null,
				qty: this.clean(r.saved_qty ?? r.qty),
				unit_id: this.clean(r.saved_unit_id ?? r.unit_id),
				apply_wastage: r.apply_wastage === false ? false : true,
				active: r.active === false ? false : true
			}));
	},

	currentComponentSnapshot() {
		return this.componentSnapshot(mnuCompTable.rowsForSave());
	},

	savedComponentSnapshot() {
		return this.componentSnapshot(getMnuComponents.data || []);
	},

	isNewBlankMenu() {
		return Number(appsmith.store.current_menu_id || 0) === 0 &&
			!this.headerSnapshotFromPage().name &&
			!this.headerSnapshotFromPage().category_id &&
			this.currentComponentSnapshot().length === 0;
	},

	dietTagSnapshotFromPage() {
		return (msMnuDietTags.selectedOptionValues || [])
			.map(x => Number(x))
			.filter(x => x)
			.sort((a, b) => a - b);
	},

	dietTagSnapshotFromSaved() {
		return (getSelectedMnuDietTags.data || [])
			.map(r => Number(r.value ?? r.helper_list_item_id ?? r.tag_id))
			.filter(x => x)
			.sort((a, b) => a - b);
	},

	isDirty() {
		if (this.isNewBlankMenu()) return false;

		return (
			JSON.stringify(this.headerSnapshotFromPage()) !== JSON.stringify(this.headerSnapshotFromSaved()) ||
			JSON.stringify(this.currentComponentSnapshot()) !== JSON.stringify(this.savedComponentSnapshot()) ||
			JSON.stringify(this.dietTagSnapshotFromPage()) !== JSON.stringify(this.dietTagSnapshotFromSaved())
		);
	},

	async closeMenu() {
		await mnuCompTable.syncFromTable();

		if (this.isDirty()) {
			await storeValue("pendingMenuAction", "close");
			showModal("mdlMnuUnsavedChanges");
			return;
		}

		navigateTo("MenuList");
	},

	async saveAndCloseMenu() {
		const result = await this.saveMenu();
		if (!result) return null;

		closeModal("mdlMnuUnsavedChanges");
		navigateTo("MenuList");
	},

	async closeWithoutSaving() {
		closeModal("mdlMnuUnsavedChanges");
		await mnuCompTable.clearDraftRows();
		navigateTo("MenuList");
	},

	async duplicateMenuSavedVersion() {
		const result = await duplicateMnu.run();
		const newId = result?.[0]?.new_id || result?.[0]?.id;

		if (!newId) {
			showAlert("Menu duplicate failed", "error");
			return false;
		}

		await storeValue("current_menu_id", newId);

		await getMnuItemById.run();
		await getSelectedMnuDietTags.run();
		await getMnuComponents.run();
		await mnuCompTable.loadFromQuery();

		showAlert("Menu duplicated", "success");
		return true;
	},

	async duplicateMenu() {
		if (this.isDirty()) {
			await storeValue("pendingMenuAction", "duplicate");
			showModal("mdlMnuUnsavedChanges");
			return false;
		}

		return await this.duplicateMenuSavedVersion();
	},

	async saveAndDuplicateMenu() {
		const saved = await this.saveMenu();
		if (!saved) return false;

		closeModal("mdlMnuUnsavedChanges");
		return await this.duplicateMenuSavedVersion();
	},

	async duplicateWithoutSaving() {
		closeModal("mdlMnuUnsavedChanges");
		return await this.duplicateMenuSavedVersion();
	},

	async deleteMenuStart() {
		if (this.isDirty()) {
			await storeValue("pendingMenuAction", "delete");
			showModal("mdlMnuUnsavedChanges");
			return false;
		}

		await getMnuImpactCount.run();
		showModal("mdlMnuDelete");
		return true;
	},

	async deleteMenuConfirm() {
		await deleteMnu.run();

		closeModal("mdlMnuDelete");
		closeModal("mdlMnuUnsavedChanges");

		await mnuCompTable.clearDraftRows();
		await removeValue("mnu_components_local_rows");
		await storeValue("current_menu_id", 0);

		showAlert("Menu deleted", "success");
		navigateTo("MenuList");

		return true;
	},

	async saveAndDeleteMenu() {
		const saved = await this.saveMenu();
		if (!saved) return false;

		closeModal("mdlMnuUnsavedChanges");

		await getMnuImpactCount.run();
		showModal("mdlMnuDelete");

		return true;
	},

	async deleteWithoutSaving() {
		closeModal("mdlMnuUnsavedChanges");

		await getMnuImpactCount.run();
		showModal("mdlMnuDelete");

		return true;
	},

	testSaveData() {
		return {
			current_menu_id: appsmith.store.current_menu_id,
			rowsForSave: mnuCompTable.rowsForSave()
		};
	},

	testDirtyData() {
		return {
			isDirty: this.isDirty(),

			headerCurrent: this.headerSnapshotFromPage(),
			headerSaved: this.headerSnapshotFromSaved(),

			componentCurrent: this.currentComponentSnapshot(),
			componentSaved: this.savedComponentSnapshot(),

			dietTagsCurrent: this.dietTagSnapshotFromPage(),
			dietTagsSaved: this.dietTagSnapshotFromSaved()
		};
	}
}