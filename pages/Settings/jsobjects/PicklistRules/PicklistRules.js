export default {
	listCode() {
		const row = getHelperLists.data?.find(x =>
			String(x.id) === String(selPicklistType.selectedOptionValue)
		);

		return row?.list_code || "";
	},

	ingredientCount() {
		return Number(getHelperIngredientImpactCount.data?.[0]?.ingredient_count || 0);
	},

	recipeCount() {
		return Number(getHelperRecipeImpactCount.data?.[0]?.recipe_count || 0);
	},

	totalImpactCount() {
		return this.ingredientCount() + this.recipeCount();
	},

	isCategory() {
		return [
			"ingredient_category",
			"recipe_category",
			"dish_category",
			"menu_category"
		].includes(this.listCode());
	},

	mustReplaceBeforeDelete() {
		return this.isCategory() && this.totalImpactCount() > 0;
	},

	canDeleteDirectly() {
		return !this.mustReplaceBeforeDelete();
	},

	deleteMessage() {
		if (appsmith.store.plReplaceAction === "Replace") {
			return "<b>Replace everywhere used?</b><br>    The original item will remain in the list.";
		}

		if (this.mustReplaceBeforeDelete()) {
			return "<b>Replace required</b><br>    This category is currently being used. Replace it before deleting.";
		}

		if (this.totalImpactCount() > 0) {
			return "<b>Delete item?</b><br>     This item is currently being used. Only the selected item will be deleted. Everything else will remain unchanged.";
		}

		return "<b>Delete unused item?</b><br>    The selected item is not currently being used.";
	}
}