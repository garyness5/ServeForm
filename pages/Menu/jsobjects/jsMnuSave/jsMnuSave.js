export default {
	pendingAction: null,

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

		await qryMnuCheckNameExists.run();

		const matchCount = Number(qryMnuCheckNameExists.data?.[0]?.match_count || 0);

		if (matchCount > 0) {
			showAlert("A menu with this name already exists.", "warning");
			return false;
		}

		return true;
	},

	saveSnapshot() {
		return (
			appsmith.store.menu_save_snapshot ||
			jsMnuWorkspace.current()
		);
	},

	headerPayload() {
		return {
			...this.saveSnapshot().header
		};
	},

	dietTagsPayload() {
		return (
			this.saveSnapshot().diet_tags || []
		).map(id => ({
			tag_id: Number(id)
		}));
	},

	componentsPayload() {
		return (
			this.saveSnapshot().components || []
		).map(row => ({
			item_type:
			row.item_type || null,

			ingredient_id:
			row.item_type === "ingredient"
			? Number(row.ingredient_id) || null
			: null,

			child_recipe_id:
			row.item_type === "recipe"
			? Number(row.child_recipe_id) || null
			: null,

			child_dish_id:
			row.item_type === "dish"
			? Number(row.child_dish_id) || null
			: null,

			qty:
			row.qty == null
			? null
			: Number(row.qty),

			unit_id:
			row.unit_id == null
			? null
			: Number(row.unit_id),

			apply_wastage:
			row.apply_wastage !== false,

			active:
			row.active !== false
		}));
	},

	async saveMenu() {
		try {
			await jsMnuCompTable.syncFromTable();

			const snapshot =
						jsMnuWorkspace.current();

			const name =
						String(
							snapshot?.header?.name || ""
						).trim();

			if (!name) {
				showAlert(
					"Menu Name is required before you can save.",
					"warning"
				);

				return false;
			}

			await storeValue(
				"menu_save_snapshot",
				snapshot
			);

			const result =
						await qryMnuSaveMenu.run();

			const savedId =
						Number(
							result?.[0]?.menu_id || 0
						);

			if (!savedId) {
				showAlert(
					"Menu was not saved.",
					"error"
				);

				return false;
			}

			await storeValue(
				"current_menu_id",
				savedId
			);

			await Promise.all([
				qryMnuGetItemById.run(),
				qryMnuGetSelectedDietTags.run(),
				qryMnuGetComponents.run()
			]);

			await jsMnuCompTable.loadFromQuery();

			await jsMnuWorkspace.initializeFromSaved();

			await removeValue(
				"menu_save_snapshot"
			);

			await storeValue(
				"Menu_mode",
				"edit"
			);

			await removeValue(
				"Menu_open_mode"
			);

			showAlert(
				"Menu saved.",
				"success"
			);

			return true;

		} catch (error) {
			await removeValue(
				"menu_save_snapshot"
			);

			showAlert(
				error?.message ||
				"Menu was not saved.",
				"error"
			);

			return false;
		}
	},

	async startNewMenu() {
		await storeValue(
			"Menu_mode",
			"add"
		);

		await removeValue(
			"current_menu_id"
		);

		await jsMnuWorkspace.initializeNew();
		await jsMnuCompTable.clearRows();

		await resetWidget(
			"inpMnuName",
			true
		);

		await resetWidget(
			"selMnuCategory",
			true
		);

		await resetWidget(
			"chkMnuActive",
			true
		);

		await resetWidget(
			"inpMnuServes",
			true
		);

		await resetWidget(
			"inpMnuExtraPercent",
			true
		);

		await resetWidget(
			"msMnuDietTags",
			true
		);

		await resetWidget(
			"rteMnuNotes",
			true
		);

		return true;
	},

	async addMenu() {
		if (!this.isDirty()) {
			return await this.startNewMenu();
		}

		this.pendingAction = "add";

		showModal(
			mdlMnuUnsavedChanges
		);

		return true;
	},

	async addWithoutSaving() {
		closeModal(
			mdlMnuUnsavedChanges
		);

		this.pendingAction = null;

		await jsMnuWorkspace.discard();

		return await this.startNewMenu();
	},

	async saveAndAddMenu() {
		closeModal(
			mdlMnuUnsavedChanges
		);

		const saved =
					await this.saveMenu();

		if (!saved) {
			return false;
		}

		this.pendingAction = null;

		return await this.startNewMenu();
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
			category_id: this.clean(
				selMnuCategory.selectedOptionValue
			),
			active:
			chkMnuActive.isChecked === false
			? false
			: true,
			yield_qty:
			this.clean(inpMnuServes.text),
			extra_percent:
			this.clean(inpMnuExtraPercent.text),
			notes:
			this.textClean(rteMnuNotes.value)
		};
	},

	headerSnapshotFromSaved() {
		const r = Array.isArray(qryMnuGetItemById.data)
		? qryMnuGetItemById.data[0]
		: qryMnuGetItemById.data;

		if (!r) {
			return {
				name: null,
				category_id: null,
				active: true,
				yield_qty: null,
				extra_percent: 0,
				notes: null
			};
		}

		return {
			name: this.textClean(r.name),
			category_id: this.clean(r.category_id),
			active: r.active === false ? false : true,
			yield_qty: this.clean(r.yield_qty),
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
		return this.componentSnapshot(jsMnuCompTable.rowsForSave());
	},

	savedComponentSnapshot() {
		return this.componentSnapshot(qryMnuGetComponents.data || []);
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
		return (qryMnuGetSelectedDietTags.data || [])
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
		await jsMnuCompTable.syncFromTable();

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
		await jsMnuCompTable.clearDraftRows();
		navigateTo("MenuList");
	},

	async duplicateMenuSavedVersion() {
		const result = await qryMnuDuplicateMenu.run();
		const newId = result?.[0]?.new_id || result?.[0]?.id;

		if (!newId) {
			showAlert("Menu duplicate failed", "error");
			return false;
		}

		await storeValue("current_menu_id", newId);

		await qryMnuGetItemById.run();
		await qryMnuGetSelectedDietTags.run();
		await qryMnuGetComponents.run();
		await jsMnuCompTable.loadFromQuery();

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

		await qryMnuGetImpactCount.run();
		showModal("mdlMnuDelete");
		return true;
	},

	async deleteMenuConfirm() {
		await qryMnuDeleteMenu.run();

		closeModal("mdlMnuDelete");
		closeModal("mdlMnuUnsavedChanges");

		await jsMnuCompTable.clearDraftRows();
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

		await qryMnuGetImpactCount.run();
		showModal("mdlMnuDelete");

		return true;
	},

	async deleteWithoutSaving() {
		closeModal("mdlMnuUnsavedChanges");

		await qryMnuGetImpactCount.run();
		showModal("mdlMnuDelete");

		return true;
	},

	testSaveData() {
		return {
			current_menu_id: appsmith.store.current_menu_id,
			rowsForSave: jsMnuCompTable.rowsForSave()
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
	},

	async unsavedYes() {
		switch (this.pendingAction) {
			case "close":
				return await this.saveAndCloseMenu();

			case "add":
				return await this.saveAndAddMenu();

			default:
				return false;
		}
	},

	async unsavedNo() {
		switch (this.pendingAction) {
			case "close":
				return await this.closeWithoutSaving();

			case "add":
				return await this.addWithoutSaving();

			default:
				return false;
		}
	}
}