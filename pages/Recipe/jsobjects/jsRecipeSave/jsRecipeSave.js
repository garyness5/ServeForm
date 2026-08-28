export default {
	pendingAction: null,

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

	yieldUnitChanged(snapshot) {
		const baseline =
					jsRecipeWorkspace.baseline();

		const oldUnitId =
					Number(
						baseline?.header?.yield_unit_id || 0
					);

		const newUnitId =
					Number(
						snapshot?.header?.yield_unit_id || 0
					);

		return oldUnitId !== newUnitId;
	},

	impactCount() {
		const impact =
					qryRecGetImpactCount.data?.[0] || {};

		return (
			Number(impact.recipe_count || 0) +
			Number(impact.dish_count || 0) +
			Number(impact.menu_count || 0)
		);
	},

	async checkYieldUnitChange(snapshot) {
		const recipeId =
					Number(
						appsmith.store.current_recipe_id || 0
					);

		if (!recipeId) {
			return false;
		}

		if (!this.yieldUnitChanged(snapshot)) {
			return false;
		}

		/*
	 * Preserve the exact current Recipe state
	 * before running the impact query.
	 *
	 * The query can cause Appsmith widgets to
	 * re-evaluate their defaults.
	 */
		await jsRecipeWorkspace.setWorkspace(
			snapshot
		);

		await storeValue(
			"recipe_save_snapshot",
			snapshot
		);

		await qryRecGetImpactCount.run();

		if (this.impactCount() === 0) {
			return false;
		}

		await storeValue(
			"recipe_impact_mode",
			"unit_change"
		);

		showModal(
			"mdlRecDeleteConfirm"
		);

		return true;
	},

	async saveRecipe() {
		try {
			const wasNew =
						Number(
							appsmith.store.current_recipe_id || 0
						) === 0;

			await jsRecipeCompTable.syncFromTable();

			const snapshot =
						jsRecipeWorkspace.current();

			if (!this.validateBeforeSave(snapshot)) {
				return false;
			}

			/*
		 * Before saving an existing Recipe,
		 * check whether its Yield Unit changed.
		 *
		 * If the Recipe has downstream impact,
		 * checkYieldUnitChange() opens the warning
		 * modal and pauses this Save.
		 */
			if (
				!appsmith.store.recipe_unit_change_confirmed &&
				await this.checkYieldUnitChange(snapshot)
			) {
				return false;
			}

			/*
		 * Freeze ONE exact Recipe snapshot.
		 * qrySaveRecipe reads all three payloads
		 * from this same object.
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

			if (wasNew) {
				await qryRecGetComponentItems.run();
			}

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

			/*
		 * Clear any completed Unit-change
		 * confirmation state.
		 */
			await removeValue(
				"recipe_unit_change_confirmed"
			);

			await removeValue(
				"recipe_impact_mode"
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

			await removeValue(
				"recipe_unit_change_confirmed"
			);

			showAlert(
				jsUserErrors.friendly(error),
				"error"
			);

			return false;
		}
	},

	async closeRecipe() {
		await jsRecipeWorkspace.capture();

		if (this.isDirty()) {
			this.pendingAction = "close";

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
		await jsRecipeWorkspace.capture();

		if (this.isDirty()) {
			this.pendingAction = "add";

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

		/*
	Capture exactly what is currently
	in front of the user.
	*/
		const source =
					await jsRecipeWorkspace.capture();

		const currentName =
					String(
						source.header.name || ""
					).trim();

		const duplicateName =
					`${currentName} - Copy`;

		const duplicate = {
			header: {
				...source.header,
				name:
				duplicateName
			},

			diet_tags: [
				...(source.diet_tags || [])
			],

			components:
			(source.components || [])
			.map(row => ({
				...row,

				id:
				null,

				recipe_id:
				0,

				draft_row_id:
				jsRecipeCompTable.makeDraftId()
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
			"Recipe duplicated. Save it before making changes to enable all Recipe features.",
			"success"
		);

		return true;
	},

	async deleteRecipeStart() {
		await jsRecipeWorkspace.capture();

		await storeValue(
			"recipe_impact_mode",
			"delete"
		);

		await qryRecGetImpactCount.run();

		showModal("mdlRecDeleteConfirm");

		return true;
	},

	async confirmImpactAction() {
		const mode =
					String(
						appsmith.store.recipe_impact_mode || "delete"
					);

		if (mode === "unit_change") {
			await storeValue(
				"recipe_unit_change_confirmed",
				true
			);

			closeModal(
				"mdlRecDeleteConfirm"
			);

			return await this.saveRecipe();
		}

		return await this.deleteRecipeConfirm();
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
				jsUserErrors.friendly(error),
				"error"
			);

			return false;
		}
	},

	async unsavedYes() {
		switch (this.pendingAction) {
			case "close":
				return await this.saveAndCloseRecipe();

			case "add":
				return await this.saveAndAddRecipe();

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
};