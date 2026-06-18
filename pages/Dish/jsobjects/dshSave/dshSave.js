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

		if (!String(inpDshName.text || "").trim()) {
			missing.push("Dish name");
		}

		if (!selDshCategory.selectedOptionValue) {
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

	async saveDish() {
		if (!this.validateBeforeSave()) return false;

		await dshCompTable.syncFromTable();

		const isExisting = Number(appsmith.store.current_dish_id || 0) > 0;
		let result = null;

		if (isExisting) {
			result = await updDshItem.run();
		} else {
			result = await addDshItem.run();

			const newId = result?.[0]?.id;
			if (newId) {
				await storeValue("current_dish_id", newId);
			}
		}

		await dshCompTable.syncFromTable();

		await saveDshDietTagsSnapshot.run();
		await saveDshComponentsSnapshot.run();

		await getDshItemById.run();
		await getSelectedDshDietTags.run();
		await getDshComponents.run();

		await dshCompTable.loadFromQuery();

		showAlert("Dish saved", "success");
		return true;
	},

	async saveAndNew() {
		const result = await this.saveDish();
		if (!result) return null;

		await storeValue("current_dish_id", 0);
		await dshCompTable.clearDraftRows();

		await storeValue("dsh_components_local_rows", dshCompTable.normalizeRows([]));

		await this.safeReset("inpDshName");
		await this.safeReset("selDshCategory");
		await this.safeReset("selDshFormat");
		await this.safeReset("chkDshActive");
		await this.safeReset("inpDshYieldQty");
		await this.safeReset("selDshYieldUnit");
		await this.safeReset("inpDshExtraPercent");
		await this.safeReset("msDshDietTags");
		await this.safeReset("rteDshNotes");
		await this.safeReset("tblDshComponents");

		await getDshComponents.run();

		showAlert("Saved. Ready for new dish.", "success");
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
			name: this.textClean(inpDshName.text),
			category_id: this.clean(selDshCategory.selectedOptionValue),
			serve_form_id: this.clean((selDshFormat.selectedOptionValues || [])[0]),
			active: chkDshActive.isChecked === false ? false : true,
			yield_qty: this.clean(inpDshYieldQty.text),
			yield_unit_id: this.clean(selDshYieldUnit.selectedOptionValue),
			extra_percent: this.clean(inpDshExtraPercent.text),
			notes: this.textClean(rteDshNotes.value)
		};
	},

	headerSnapshotFromSaved() {
		const r = Array.isArray(getDshItemById.data)
			? getDshItemById.data[0]
			: getDshItemById.data;

		if (!r) {
			return {
				name: null,
				category_id: null,
				serve_form_id: null,
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
			serve_form_id: this.clean(r.serve_form_id),
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
				qty: this.clean(r.saved_qty ?? r.qty),
				unit_id: this.clean(r.saved_unit_id ?? r.unit_id),
				apply_wastage: r.apply_wastage === false ? false : true,
				active: r.active === false ? false : true
			}));
	},

	currentComponentSnapshot() {
		return this.componentSnapshot(dshCompTable.rowsForSave());
	},

	savedComponentSnapshot() {
		return this.componentSnapshot(getDshComponents.data || []);
	},

	isNewBlankDish() {
		return Number(appsmith.store.current_dish_id || 0) === 0 &&
			!this.headerSnapshotFromPage().name &&
			!this.headerSnapshotFromPage().category_id &&
			!this.headerSnapshotFromPage().serve_form_id &&
			this.currentComponentSnapshot().length === 0;
	},

	dietTagSnapshotFromPage() {
		return (msDshDietTags.selectedOptionValues || [])
			.map(x => Number(x))
			.filter(x => x)
			.sort((a, b) => a - b);
	},

	dietTagSnapshotFromSaved() {
		return (getSelectedDshDietTags.data || [])
			.map(r => Number(r.value))
			.filter(x => x)
			.sort((a, b) => a - b);
	},

	isDirty() {
		if (this.isNewBlankDish()) return false;

		return (
			JSON.stringify(this.headerSnapshotFromPage()) !== JSON.stringify(this.headerSnapshotFromSaved()) ||
			JSON.stringify(this.currentComponentSnapshot()) !== JSON.stringify(this.savedComponentSnapshot()) ||
			JSON.stringify(this.dietTagSnapshotFromPage()) !== JSON.stringify(this.dietTagSnapshotFromSaved())
		);
	},

	async closeDish() {
		await dshCompTable.syncFromTable();

		if (this.isDirty()) {
			await storeValue("pendingDishAction", "close");
			showModal("mdlDshUnsavedChanges");
			return;
		}

		navigateTo("DishList");
	},

	async saveAndCloseDish() {
		const result = await this.saveDish();
		if (!result) return null;

		closeModal("mdlDshUnsavedChanges");
		navigateTo("DishList");
	},

	async closeWithoutSaving() {
		closeModal("mdlDshUnsavedChanges");
		await dshCompTable.clearDraftRows();
		navigateTo("DishList");
	},

	async duplicateDishSavedVersion() {
		const result = await duplicateDish.run();
		const newId = result?.[0]?.id;

		if (!newId) {
			showAlert("Dish duplicate failed", "error");
			return false;
		}

		await storeValue("current_dish_id", newId);

		await getDshItemById.run();
		await getSelectedDshDietTags.run();
		await getDshComponents.run();
		await dshCompTable.loadFromQuery();

		showAlert("Dish duplicated", "success");
		return true;
	},

	async duplicateDish() {
		if (this.isDirty()) {
			await storeValue("pendingDishAction", "duplicate");
			showModal("mdlDshUnsavedChanges");
			return false;
		}

		return await this.duplicateDishSavedVersion();
	},

	async saveAndDuplicateDish() {
		const saved = await this.saveDish();
		if (!saved) return false;

		closeModal("mdlDshUnsavedChanges");
		return await this.duplicateDishSavedVersion();
	},

	async duplicateWithoutSaving() {
		closeModal("mdlDshUnsavedChanges");
		return await this.duplicateDishSavedVersion();
	},

	async deleteDishStart() {
		if (this.isDirty()) {
			await storeValue("pendingDishAction", "delete");
			showModal("mdlDshUnsavedChanges");
			return false;
		}

		await getDshImpactCount.run();
		showModal("mdlDshDeleteConfirm");
		return true;
	},

	async deleteDishConfirm() {
		await deleteDish.run();

		closeModal("mdlDshDeleteConfirm");
		await dshCompTable.clearDraftRows();
		await storeValue("current_dish_id", 0);

		showAlert("Dish deleted", "success");
		navigateTo("DishList");

		return true;
	},

	async saveAndDeleteDish() {
		const saved = await this.saveDish();
		if (!saved) return false;

		closeModal("mdlDshUnsavedChanges");

		await getDshImpactCount.run();
		showModal("mdlDshDeleteConfirm");

		return true;
	},

	async deleteWithoutSaving() {
		closeModal("mdlDshUnsavedChanges");

		await getDshImpactCount.run();
		showModal("mdlDshDeleteConfirm");

		return true;
	},

	testSaveData() {
		return {
			current_dish_id: appsmith.store.current_dish_id,
			rowsForSave: dshCompTable.rowsForSave()
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