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

			return true;
		}

		const recipeId =
					Number(
						appsmith.store.current_recipe_id || 0
					);

		if (!recipeId) {
			await jsRecipeWorkspace.initializeNew();

			return true;
		}

		await Promise.all([
			qryRecGetItemById.run(),
			qryRecGetSelectedDietTags.run(),
			qryRecGetComponents.run()
		]);

		await jsRecipeWorkspace.initializeFromSaved();

		/*
		 * Transitional bridge:
		 * Components still use the existing
		 * jsRecipeCompTable/local-row path.
		 * We remove this after Components move
		 * into recipe_workspace.
		 */
		await jsRecipeCompTable.setRows(
			jsRecipeWorkspace.current().components
		);

		return true;
	}
}