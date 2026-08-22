export default {

	listCode() {
		return (
			qryGetListItemImpact.data?.[0]?.list_code ||
			getHelperLists.data?.find(
				x =>
				String(x.id) ===
				String(selListsType.selectedOptionValue)
			)?.list_code ||
			""
		);
	},

	impact() {
		return qryGetListItemImpact.data?.[0] || {};
	},

	ingredientCount() {
		return Number(this.impact().ingredient_count || 0);
	},

	recipeCount() {
		return Number(this.impact().recipe_count || 0);
	},

	dishCount() {
		return Number(this.impact().dish_count || 0);
	},

	menuCount() {
		return Number(this.impact().menu_count || 0);
	},

	totalImpactCount() {
		return Number(this.impact().total_count || 0);
	},

	hasSelection() {
		return Number(tblListsItems.selectedRow?.id || 0) > 0;
	},

	isDietTag() {
		return this.listCode() === "diet_tag";
	},

	isCategory() {
		return [
			"ingredient_category",
			"recipe_category",
			"dish_category",
			"menu_category"
		].includes(this.listCode());
	},

	isSystemItem() {
		return tblListsItems.selectedRow?.is_system === true;
	},

	isProtectedSystemItem() {
		return (
			this.isDietTag() &&
			this.isSystemItem()
		);
	},

	canRenameSelected() {
		return (
			this.hasSelection() &&
			!this.isProtectedSystemItem()
		);
	},

	canReplaceDeleteSelected() {
		return (
			this.hasSelection() &&
			!this.isProtectedSystemItem()
		);
	},

	mustReplaceBeforeDelete() {
		return (
			this.isCategory() &&
			this.totalImpactCount() > 0
		);
	},

	replaceSaveDisabled() {
		return (
			radPLReplaceDeleteAction.selectedOptionValue === "replace" &&
			!selPLReplaceWith.selectedOptionValue
		);
	},

	replaceWithDisabled() {
		return this.isDietTag();
	},

	replaceActionOptions() {
		if (this.isDietTag()) {
			return [
				{
					label: "Delete",
					value: "delete"
				}
			];
		}

		return [
			{
				label: "Replace",
				value: "replace"
			},
			{
				label: "Delete",
				value: "delete"
			}
		];
	},

	replaceActionDefault() {
		return this.isDietTag()
			? "delete"
		: "replace";
	},

	replacementOptions() {
		const selectedId =
					String(tblListsItems.selectedRow?.id || "");

		const options =
					(qryGetPicklistItems.data || [])
		.filter(
			item =>
			String(item.id) !== selectedId
		)
		.map(item => ({
			label: String(item.name || ""),
			value: String(item.id)
		}));

		return options.length
			? options
		: [
			{
				label: "",
				value: ""
			}
		];
	},

	deleteMessage() {
		if (
			appsmith.store.plReplaceAction === "Replace"
		) {
			return "<b>Replace everywhere used?</b><br>The original item will remain in the list.";
		}

		if (this.mustReplaceBeforeDelete()) {
			return "<b>Replace required</b><br>This category is currently being used. Replace it before deleting.";
		}

		if (this.totalImpactCount() > 0) {
			return "<b>Delete item?</b><br>This item is currently being used. Only the selected item will be deleted. Everything else will remain unchanged.";
		}

		return "<b>Delete unused item?</b><br>The selected item is not currently being used.";
	}
}