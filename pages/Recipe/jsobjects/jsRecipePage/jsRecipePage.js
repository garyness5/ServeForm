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

		return true;
	}
}