export default {
	async load() {
		const mode =
					String(
						appsmith.store.Recipe_open_mode ||
						appsmith.store.Recipe_mode ||
						"edit"
					);

		await jsRecipeWorkspace.clear();

		if (mode === "add") {
			await jsRecipeWorkspace.initializeNew();
			await jsRecipeCompTable.clearRows();

			return true;
		}

		const recipeId =
					Number(
						appsmith.store.current_recipe_id || 0
					);

		if (!recipeId) {
			await jsRecipeWorkspace.initializeNew();
			await jsRecipeCompTable.clearRows();

			return true;
		}

		/*
		 * Load selected saved Recipe truth.
		 */
		await Promise.all([
			qryRecGetItemById.run(),
			qryRecGetSelectedDietTags.run(),
			qryRecGetComponents.run()
		]);

		await jsRecipeWorkspace.initializeFromSaved();

		await jsRecipeCompTable.loadFromQuery();

		/*
		 * ==========================================
		 * RECIPELIST DUPLICATE HANDOFF
		 *
		 * RecipeList only identifies the saved
		 * source Recipe. Recipe owns duplication.
		 * ==========================================
		 */
		if (mode === "duplicate") {
			await resetWidget("inpRecName", true);
			await resetWidget("selRecCategory", true);
			await resetWidget("chkRecActive", true);
			await resetWidget("inpRecYieldQty", true);
			await resetWidget("selRecYieldUnit", true);
			await resetWidget("inpRecExtraPercent", true);
			await resetWidget("msRecDietTags", true);
			await resetWidget("rteRecNotes", true);

			return await jsRecipeSave.duplicateRecipe();
		}

		await removeValue(
			"Recipe_open_mode"
		);

		await storeValue(
			"Recipe_mode",
			"edit"
		);

		return true;
	}
};