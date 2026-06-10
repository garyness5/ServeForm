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

		if (!String(inpRecName.text || "").trim()) {
			missing.push("Recipe name");
		}

		if (!selRecCategory.selectedOptionValue) {
			missing.push("Category");
		}

		if (!missing.length) return null;

		return `You need to have a ${missing.join(" and a ")} selected before you can save.`;
	},

	validateBeforeSave() {
		const message = this.requiredSaveMessage();

		if (message) {
			showAlert(message, "warning");
			return false;
		}

		return true;
	},

	async saveRecipe() {
		if (!this.validateBeforeSave()) return false;

		await recCompTable.syncFromTable();

		const isExisting = Number(appsmith.store.current_recipe_id || 0) > 0;
		let result = null;

		if (isExisting) {
			result = await updRecItem.run();
		} else {
			result = await addRecItem.run();

			const newId = result?.[0]?.id;
			if (newId) {
				await storeValue("current_recipe_id", newId);
			}
		}

		await recCompTable.syncFromTable();

		await saveRecDietTagsSnapshot.run();
		await saveRecComponentsSnapshot.run();

		await getRecItemById.run();
		await getSelectedRecDietTags.run();
		await getRecComponents.run();

		await recCompTable.loadFromQuery();

		showAlert("Recipe saved", "success");
		return true;
	},

	async saveAndNew() {
		const result = await this.saveRecipe();
		if (!result) return null;

		await storeValue("current_recipe_id", 0);
		await recCompTable.clearDraftRows();

		await this.safeReset("inpRecName");
		await this.safeReset("selRecCategory");
		await this.safeReset("chkRecActive");
		await this.safeReset("inpRecYieldQty");
		await this.safeReset("selRecYieldUnit");
		await this.safeReset("inpRecExtraPercent");
		await this.safeReset("msRecDietTags");
		await this.safeReset("rteRecNotes");
		await this.safeReset("tblRecComponents");

		showAlert("Saved. Ready for new recipe.", "success");
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
			name: this.textClean(inpRecName.text),
			category_id: this.clean(selRecCategory.selectedOptionValue),
			active: chkRecActive.isChecked === false ? false : true,
			yield_qty: this.clean(inpRecYieldQty.text),
			yield_unit_id: this.clean(selRecYieldUnit.selectedOptionValue),
			extra_percent: this.clean(inpRecExtraPercent.text),
			notes: this.textClean(rteRecNotes.value)
		};
	},

	headerSnapshotFromSaved() {
		const r = Array.isArray(getRecItemById.data)
		? getRecItemById.data[0]
		: getRecItemById.data;

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
			.filter(r => r.item_type && (r.ingredient_id || r.child_recipe_id))
			.map((r, index) => ({
			line_no: index + 1,
			item_type: r.item_type || null,
			ingredient_id: r.item_type === "ingredient" ? this.clean(r.ingredient_id) : null,
			child_recipe_id: r.item_type === "recipe" ? this.clean(r.child_recipe_id) : null,
			qty: this.clean(r.qty),
			unit_id: this.clean(r.unit_id),
			apply_wastage: r.apply_wastage === false ? false : true,
			active: r.active === false ? false : true
		}));
	},

	currentComponentSnapshot() {
		return this.componentSnapshot(recCompTable.rowsForSave());
	},

	savedComponentSnapshot() {
		return this.componentSnapshot(getRecComponents.data || []);
	},

	isNewBlankRecipe() {
		return Number(appsmith.store.current_recipe_id || 0) === 0 &&
			!this.headerSnapshotFromPage().name &&
			!this.headerSnapshotFromPage().category_id &&
			this.currentComponentSnapshot().length === 0;
	},

	dietTagSnapshotFromPage() {
		return (msRecDietTags.selectedOptionValues || [])
			.map(x => Number(x))
			.filter(x => x)
			.sort((a, b) => a - b);
	},

	dietTagSnapshotFromSaved() {
		return (getSelectedRecDietTags.data || [])
			.map(r => Number(r.value))
			.filter(x => x)
			.sort((a, b) => a - b);
	},

	isDirty() {
		if (this.isNewBlankRecipe()) return false;

		return (
			JSON.stringify(this.headerSnapshotFromPage()) !== JSON.stringify(this.headerSnapshotFromSaved()) ||
			JSON.stringify(this.currentComponentSnapshot()) !== JSON.stringify(this.savedComponentSnapshot()) ||
			JSON.stringify(this.dietTagSnapshotFromPage()) !== JSON.stringify(this.dietTagSnapshotFromSaved())
		);
	},

	async closeRecipe() {
		await recCompTable.syncFromTable();

		if (this.isDirty()) {
			showModal("mdlRecUnsavedChanges");
			return;
		}

		navigateTo("RecipeList");
	},

	async saveAndCloseRecipe() {
		const result = await this.saveRecipe();
		if (!result) return null;

		closeModal("mdlRecUnsavedChanges");
		navigateTo("RecipeList");
	},

	async closeWithoutSaving() {
		closeModal("mdlRecUnsavedChanges");
		await recCompTable.clearDraftRows();
		navigateTo("RecipeList");
	},

	testSaveData() {
		return {
			current_recipe_id: appsmith.store.current_recipe_id,
			rowsForSave: recCompTable.rowsForSave()
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