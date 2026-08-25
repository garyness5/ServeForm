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

	headerPayload() {
		return {
			name:
			String(inpRecName.text || "").trim(),

			category_id:
			selRecCategory.selectedOptionValue
			? Number(selRecCategory.selectedOptionValue)
			: null,

			yield_qty:
			inpRecYieldQty.text !== "" &&
			inpRecYieldQty.text != null
			? Number(inpRecYieldQty.text)
			: null,

			yield_unit_id:
			selRecYieldUnit.selectedOptionValue
			? Number(selRecYieldUnit.selectedOptionValue)
			: null,

			extra_percent:
			inpRecExtraPercent.text !== "" &&
			inpRecExtraPercent.text != null
			? Number(inpRecExtraPercent.text)
			: 0,

			notes:
			rteRecNotes.text || null,

			active:
			chkRecActive.isChecked !== false
		};
	},

	dietTagsPayload() {
		return (
			msRecDietTags.selectedOptionValues || []
		).map(id => ({
			tag_id: Number(id)
		}));
	},

	componentsPayload() {
		return recCompTable
			.rowsForSave()
			.map(row => ({
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

			qty:
			row.qty !== "" &&
			row.qty != null
			? Number(row.qty)
			: null,

			unit_id:
			row.unit_id
			? Number(row.unit_id)
			: null,

			apply_wastage:
			row.apply_wastage !== false,

			active:
			row.active !== false
		}));
	},

	async saveRecipe() {
		if (!this.validateBeforeSave()) {
			return false;
		}

		try {
			await recCompTable.syncFromTable();

			const result =
						await qrySaveRecipe.run();

			const savedId =
						Number(
							result?.[0]?.recipe_id || 0
						);

			if (!savedId) {
				showAlert(
					"Recipe was not saved.",
					"error"
				);

				return false;
			}

			await storeValue(
				"current_recipe_id",
				savedId
			);

			await getRecItemById.run();
			await getSelectedRecDietTags.run();
			await getRecComponents.run();

			await recCompTable.loadFromQuery();

			showAlert(
				"Recipe saved.",
				"success"
			);

			return true;

		} catch (error) {
			showAlert(
				error?.message ||
				"Recipe could not be saved.",
				"error"
			);

			return false;
		}
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
			notes: this.textClean(rteRecNotes.text)
		};
	},

	headerSnapshotFromSaved() {
		if (
			Number(appsmith.store.current_recipe_id || 0) === 0
		) {
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

		const r =
					Array.isArray(getRecItemById.data)
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
			qty: this.clean(r.saved_qty ?? r.qty),
			unit_id: this.clean(r.saved_unit_id ?? r.unit_id),
			apply_wastage: r.apply_wastage === false ? false : true,
			active: r.active === false ? false : true
		}));
	},

	currentComponentSnapshot() {
		return this.componentSnapshot(recCompTable.rowsForSave());
	},

	savedComponentSnapshot() {
		if (
			Number(appsmith.store.current_recipe_id || 0) === 0
		) {
			return [];
		}

		return this.componentSnapshot(
			getRecComponents.data || []
		);
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
		if (
			Number(appsmith.store.current_recipe_id || 0) === 0
		) {
			return [];
		}

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
			await storeValue("pendingRecipeAction", "close");
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

	async duplicateRecipe() {
		await recCompTable.syncFromTable();

		const sourceId =
					Number(appsmith.store.current_recipe_id || 0);

		if (!sourceId) {
			showAlert(
				"This Recipe has not been saved yet.",
				"warning"
			);
			return false;
		}

		const header =
					this.headerSnapshotFromPage();

		const currentName =
					String(header.name || "").trim();

		const savedName =
					String(
						getRecItemById.data?.[0]?.name || ""
					).trim();

		const nameChanged =
					currentName !== savedName;

		const allNames = [];

		let duplicateName =
				currentName || savedName;

		if (!nameChanged) {
			const escapedName =
						savedName.replace(
							/[.*+?^${}()|[\]\\]/g,
							"\\$&"
						);

			const copyRegex =
						new RegExp(
							`^${escapedName} - Copy(?: (\\d+))?$`
						);

			const usedNumbers =
						allNames
			.map(name => {
				const match =
							name.match(copyRegex);

				if (!match) {
					return 0;
				}

				return match[1]
					? Number(match[1])
				: 1;
			})
			.filter(n => n > 0);

			const nextNumber =
						usedNumbers.length === 0
			? 1
			: Math.max(...usedNumbers) + 1;

			duplicateName =
				nextNumber === 1
				? `${savedName} - Copy`
			: `${savedName} - Copy ${nextNumber}`;
		}

		const duplicateHeader = {
			...header,
			name: duplicateName
		};

		const duplicateDietTags =
					this.dietTagSnapshotFromPage()
		.map(String);

		const duplicateComponents =
					recCompTable
		.mergeUpdatedRows()
		.filter(r => recCompTable.hasContent(r))
		.map((r, index) => ({
			...r,
			id: null,
			recipe_id: 0,
			line_no: index + 1,
			draft_row_id:
			recCompTable.makeDraftId()
		}));

		await storeValue(
			"Recipe_duplicate_header",
			duplicateHeader
		);

		await storeValue(
			"Recipe_duplicate_diet_tags",
			duplicateDietTags
		);

		await storeValue(
			"Recipe_mode",
			"duplicate"
		);

		await storeValue(
			"current_recipe_id",
			0
		);

		await recCompTable.setRows(
			duplicateComponents
		);

		await resetWidget(
			"inpRecName",
			true
		);

		await resetWidget(
			"selRecCategory",
			true
		);

		await resetWidget(
			"chkRecActive",
			true
		);

		await resetWidget(
			"inpRecYieldQty",
			true
		);

		await resetWidget(
			"selRecYieldUnit",
			true
		);

		await resetWidget(
			"inpRecExtraPercent",
			true
		);

		await resetWidget(
			"msRecDietTags",
			true
		);

		await resetWidget(
			"rteRecNotes",
			true
		);

		await resetWidget(
			"tblRecComponents",
			true
		);

		showAlert(
			"Recipe duplicated.",
			"success"
		);

		return true;
	},

	async deleteRecipeStart() {
		if (this.isDirty()) {
			await storeValue("pendingRecipeAction", "delete");
			showModal("mdlRecUnsavedChanges");
			return false;
		}

		await getRecImpactCount.run();
		showModal("mdlRecDeleteConfirm");
		return true;
	},

	async deleteRecipeConfirm() {
		try {
			const result =
						await qryDeleteRecipe.run();

			const deletedId =
						Number(result?.[0]?.id || 0);

			const currentId =
						Number(
							appsmith.store.current_recipe_id || 0
						);

			if (
				!deletedId ||
				deletedId !== currentId
			) {
				showAlert(
					"Recipe was not deleted.",
					"error"
				);

				return false;
			}

			closeModal(
				"mdlRecDeleteConfirm"
			);

			await recCompTable.clearDraftRows();

			await storeValue(
				"current_recipe_id",
				0
			);

			showAlert(
				"Recipe deleted.",
				"success"
			);

			navigateTo(
				"RecipeList"
			);

			return true;

		} catch (error) {
			showAlert(
				error?.message ||
				"Recipe could not be deleted.",
				"error"
			);

			return false;
		}
	},

	async saveAndDeleteRecipe() {
		const saved = await this.saveRecipe();
		if (!saved) return false;

		closeModal("mdlRecUnsavedChanges");

		await getRecImpactCount.run();
		showModal("mdlRecDeleteConfirm");

		return true;
	},

	async deleteWithoutSaving() {
		closeModal("mdlRecUnsavedChanges");

		await getRecImpactCount.run();
		showModal("mdlRecDeleteConfirm");

		return true;
	},

	async unsavedYes() {
		switch (appsmith.store.pendingRecipeAction) {
			case "close":
				return await this.saveAndCloseRecipe();

			case "add":
				return await this.saveAndAddRecipe();

			case "delete":
				return await this.saveAndDeleteRecipe();

			default:
				return false;
		}
	},

	async unsavedNo() {
		switch (appsmith.store.pendingRecipeAction) {
			case "close":
				return await this.closeWithoutSaving();

			case "add":
				return await this.addWithoutSaving();

			case "delete":
				return await this.deleteWithoutSaving();

			default:
				return false;
		}
	},

	async startNewRecipe() {
		await storeValue(
			"current_recipe_id",
			0
		);

		await storeValue(
			"Recipe_mode",
			"add"
		);

		await removeValue(
			"Recipe_duplicate_header"
		);

		await removeValue(
			"Recipe_duplicate_diet_tags"
		);

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

		return true;
	},

	async addRecipe() {
		await recCompTable.syncFromTable();

		if (this.isDirty()) {
			await storeValue(
				"pendingRecipeAction",
				"add"
			);

			showModal(
				"mdlRecUnsavedChanges"
			);

			return false;
		}

		return await this.startNewRecipe();
	},

	async saveAndAddRecipe() {
		const saved =
					await this.saveRecipe();

		if (!saved) {
			return false;
		}

		closeModal(
			"mdlRecUnsavedChanges"
		);

		return await this.startNewRecipe();
	},

	async addWithoutSaving() {
		closeModal(
			"mdlRecUnsavedChanges"
		);

		return await this.startNewRecipe();
	},

}