export default {
	async safeReset(widgetName) {
		try {
			await resetWidget(widgetName, true);
		} catch (e) {
			return null;
		}
	},

	saveSnapshot() {
		return (
			appsmith.store.recipe_save_snapshot ||
			jsRecipeWorkspace.current()
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

	requiredSaveMessage(snapshot) {
		const name =
					String(
						snapshot?.header?.name || ""
					).trim();

		return name
			? null
		: "Recipe Name is required before you can save.";
	},

	validateBeforeSave(snapshot) {
		const message =
					this.requiredSaveMessage(snapshot);

		if (message) {
			showAlert(
				message,
				"warning"
			);

			return false;
		}

		return true;
	},

	isDirty() {
		return jsRecipeWorkspace.isDirty();
	},

	async saveRecipe() {
		try {
			await jsRecipeCompTable.syncFromTable();

			const snapshot =
						jsRecipeWorkspace.current();

			if (!this.validateBeforeSave(snapshot)) {
				return false;
			}

			/*
				Freeze ONE exact Recipe snapshot.
				qrySaveRecipe reads all three payloads
				from this same object.
			*/
			await storeValue(
				"recipe_save_snapshot",
				snapshot
			);

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

			await Promise.all([
				qryRecGetItemById.run(),
				qryRecGetSelectedDietTags.run(),
				qryRecGetComponents.run()
			]);

			await jsRecipeCompTable.loadFromQuery();

			await jsRecipeWorkspace
				.initializeFromSaved();

			await removeValue(
				"recipe_save_snapshot"
			);

			showAlert(
				"Recipe saved.",
				"success"
			);

			return true;

		} catch (error) {
			await removeValue(
				"recipe_save_snapshot"
			);

			showAlert(
				error?.message ||
				"Recipe could not be saved.",
				"error"
			);

			return false;
		}
	},

	async closeRecipe() {
		await jsRecipeCompTable.syncFromTable();

		if (this.isDirty()) {
			await storeValue(
				"pendingRecipeAction",
				"close"
			);

			showModal(
				"mdlRecUnsavedChanges"
			);

			return false;
		}

		navigateTo("RecipeList");
		return true;
	},

	async saveAndCloseRecipe() {
		const saved =
					await this.saveRecipe();

		if (!saved) {
			return false;
		}

		closeModal(
			"mdlRecUnsavedChanges"
		);

		navigateTo(
			"RecipeList"
		);

		return true;
	},

	async closeWithoutSaving() {
		closeModal(
			"mdlRecUnsavedChanges"
		);

		navigateTo(
			"RecipeList"
		);

		return true;
	},

	async startNewRecipe() {
		await storeValue(
			"current_recipe_id",
			0
		);

		await qryRecGetComponentItems.run();

		await storeValue(
			"Recipe_mode",
			"add"
		);

		await jsRecipeCompTable.clearRows();

		await jsRecipeWorkspace
			.initializeNew();

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
		await jsRecipeCompTable.syncFromTable();

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

	async duplicateRecipe() {
		await jsRecipeCompTable.syncFromTable();

		const source =
					jsRecipeWorkspace.current();

		const sourceId =
					Number(
						appsmith.store.current_recipe_id || 0
					);

		if (!sourceId) {
			showAlert(
				"This Recipe has not been saved yet.",
				"warning"
			);

			return false;
		}

		const savedName =
					String(
						qryRecGetItemById.data?.[0]?.name ||
						source.header.name ||
						""
					).trim();

		const duplicate = {
			header: {
				...source.header,
				name:
				`${savedName} - Copy`
			},

			diet_tags: [
				...(source.diet_tags || [])
			],

			components: (
				source.components || []
			).map(row => ({
				...row
			}))
		};

		await storeValue(
			"current_recipe_id",
			0
		);

		await storeValue(
			"Recipe_mode",
			"duplicate"
		);

		await jsRecipeWorkspace
			.initializeDuplicate(
			duplicate
		);

		await jsRecipeCompTable.setRows(
			duplicate.components
		);

		await this.safeReset("inpRecName");
		await this.safeReset("selRecCategory");
		await this.safeReset("chkRecActive");
		await this.safeReset("inpRecYieldQty");
		await this.safeReset("selRecYieldUnit");
		await this.safeReset("inpRecExtraPercent");
		await this.safeReset("msRecDietTags");
		await this.safeReset("rteRecNotes");
		await this.safeReset("tblRecComponents");

		showAlert(
			"Recipe duplicated. Save to create it.",
			"success"
		);

		return true;
	},

	async deleteRecipeStart() {
		if (this.isDirty()) {
			await storeValue(
				"pendingRecipeAction",
				"delete"
			);

			showModal(
				"mdlRecUnsavedChanges"
			);

			return false;
		}

		await qryRecGetImpactCount.run();

		showModal(
			"mdlRecDeleteConfirm"
		);

		return true;
	},

	async deleteRecipeConfirm() {
		try {
			const result =
						await qryDeleteRecipe.run();

			const deletedId =
						Number(
							result?.[0]?.id || 0
						);

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

			await storeValue(
				"current_recipe_id",
				0
			);

			await jsRecipeCompTable.clearRows();
			await jsRecipeWorkspace.clear();

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
		const saved =
					await this.saveRecipe();

		if (!saved) {
			return false;
		}

		closeModal(
			"mdlRecUnsavedChanges"
		);

		await qryRecGetImpactCount.run();

		showModal(
			"mdlRecDeleteConfirm"
		);

		return true;
	},

	async deleteWithoutSaving() {
		closeModal(
			"mdlRecUnsavedChanges"
		);

		await qryRecGetImpactCount.run();

		showModal(
			"mdlRecDeleteConfirm"
		);

		return true;
	},

	async unsavedYes() {
		switch (
			appsmith.store.pendingRecipeAction
		) {
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
		switch (
			appsmith.store.pendingRecipeAction
		) {
			case "close":
				return await this.closeWithoutSaving();

			case "add":
				return await this.addWithoutSaving();

			case "delete":
				return await this.deleteWithoutSaving();

			default:
				return false;
		}
	}
};