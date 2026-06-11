export default {
  selectedRecipeId() {
    return Number(tblRecipeList.selectedRow?.id || 0);
  },

  hasSelection() {
    return this.selectedRecipeId() > 0;
  },

  async duplicateSelectedRecipe() {
    if (!this.hasSelection()) {
      showAlert("Select a recipe first.", "warning");
      return false;
    }

    const result = await duplicateRecipeFromList.run();
    const newId = result?.[0]?.id;

    if (!newId) {
      showAlert("Recipe duplicate failed.", "error");
      return false;
    }

    await getRecipes.run();

    showAlert("Recipe duplicated.", "success");
    return true;
  },

	async deleteSelectedRecipeStart() {
		if (!this.hasSelection()) {
			showAlert("Select a recipe first.", "warning");
			return false;
		}

		await getRecListImpactCount.run();
		showModal("mdlRecListDeleteConfirm");

		return true;
	},
	
	async deleteSelectedRecipeConfirm() {
		if (!this.hasSelection()) {
			showAlert("Select a recipe first.", "warning");
			return false;
		}

		await deleteRecipeFromList.run();

		closeModal("mdlRecListDeleteConfirm");

		await getRecipes.run();

		showAlert("Recipe deleted.", "success");

		return true;
	},
}