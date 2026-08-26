export default {
	selectedRecipeId() {
		return Number(
			tblRecipeList.selectedRow?.id || 0
		);
	},

	hasSelection() {
		return this.selectedRecipeId() > 0;
	},

	async addRecipe() {
		await storeValue(
			"current_recipe_id",
			0
		);

		await storeValue(
			"Recipe_mode",
			"add"
		);

		await removeValue(
			"rec_components_local_rows"
		);

		navigateTo("Recipe");

		return true;
	},

	async editSelectedRecipe() {
		if (!this.hasSelection()) {
			showAlert(
				"Select a Recipe first.",
				"warning"
			);

			return false;
		}

		await storeValue(
			"current_recipe_id",
			this.selectedRecipeId()
		);

		await storeValue(
			"Recipe_mode",
			"edit"
		);

		await removeValue(
			"rec_components_local_rows"
		);

		navigateTo("Recipe");

		return true;
	},

	async duplicateSelectedRecipe() {
		if (!this.hasSelection()) {
			showAlert(
				"Select a Recipe first.",
				"warning"
			);

			return false;
		}

		const source =
					tblRecipeList.selectedRow;

		const sourceId =
					Number(source?.id || 0);

		if (!sourceId) {
			return false;
		}

		const sourceName =
					String(source?.name || "").trim();

		const names =
					(qryRecListGetRecipes.data || [])
		.map(r =>
				 String(r.name || "").trim()
				)
		.filter(Boolean);

		const escaped =
					sourceName.replace(
						/[.*+?^${}()|[\]\\]/g,
						"\\$&"
					);

		const regex =
					new RegExp(
						`^${escaped} - copy(?: (\\d+))?$`,
						"i"
					);

		const usedNumbers =
					names
		.map(name => {
			const match =
						name.match(regex);

			if (!match) return 0;

			return match[1]
				? Number(match[1])
			: 1;
		})
		.filter(n => n > 0);

		const nextNumber =
					usedNumbers.length === 0
		? 1
		: Math.max(...usedNumbers) + 1;

		const duplicateName =
					nextNumber === 1
		? `${sourceName} - copy`
		: `${sourceName} - copy ${nextNumber}`;

		await storeValue(
			"Recipe_duplicate_source_id",
			sourceId
		);

		await storeValue(
			"Recipe_duplicate_name",
			duplicateName
		);

		await storeValue(
			"current_recipe_id",
			sourceId
		);

		await storeValue(
			"Recipe_mode",
			"duplicate_from_list"
		);

		await removeValue(
			"rec_components_local_rows"
		);

		navigateTo("Recipe");

		return true;
	},
	async deleteSelectedRecipeStart() {
		if (!this.hasSelection()) {
			showAlert(
				"Select a Recipe first.",
				"warning"
			);

			return false;
		}

		await qryRecListGetImpactCount.run();

		showModal("mdlRecDelete");

		return true;
	},

	async deleteSelectedRecipeConfirm() {
		if (!this.hasSelection()) {
			showAlert(
				"Select a Recipe first.",
				"warning"
			);

			return false;
		}

		try {
			const result =
						await qryRecListDelete.run();

			const deletedId =
						Number(result?.[0]?.id || 0);

			if (
				!deletedId ||
				deletedId !== this.selectedRecipeId()
			) {
				showAlert(
					"Recipe was not deleted.",
					"error"
				);

				return false;
			}

			await removeValue(
				"current_recipe_id"
			);

			closeModal(
				"mdlRecDelete"
			);

			await qryRecListGetRecipes.run();

			showAlert(
				"Recipe deleted.",
				"success"
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

	async setActive(row, active) {
		const recipeId =
					Number(row?.id || 0);

		if (!recipeId) {
			return false;
		}

		try {
			await qryRecListSetActive.run({
				recipe_id: recipeId,
				active: active === true
			});

			await qryRecListGetRecipes.run();

			return true;

		} catch (error) {
			showAlert(
				error?.message ||
				"Recipe Active status could not be changed.",
				"error"
			);

			await qryRecListGetRecipes.run();

			return false;
		}
	},

	async setCategory(row, categoryId) {
		const recipeId =
					Number(row?.id || 0);

		const newCategoryId =
					Number(categoryId || 0);

		if (!recipeId || !newCategoryId) {
			return false;
		}

		try {
			await qryRecListSetCategory.run({
				recipe_id: recipeId,
				category_id: newCategoryId
			});

			await qryRecListGetRecipes.run();

			return true;

		} catch (error) {
			showAlert(
				error?.message ||
				"Recipe Category could not be changed.",
				"error"
			);

			await qryRecListGetRecipes.run();

			return false;
		}
	},

	searchText() {
		return String(
			inpRecListSearch.text || ""
		)
			.trim()
			.toLowerCase();
	},

	statusFilter() {
		return String(
			selRecListFilter.selectedOptionValue || "all"
		).toLowerCase();
	},

	filteredRows() {
		const search =
					this.searchText();

		const status =
					this.statusFilter();

		return (qryRecListGetRecipes.data || [])
			.filter(row => {
			if (status === "active" && row.active !== true) {
				return false;
			}

			if (status === "inactive" && row.active !== false) {
				return false;
			}

			return true;
		})
			.filter(row => {
			if (!search) return true;

			const haystack = [
				row.name,
				row.category_name,
				row.yield_unit,
				row.diet_tag_names,
				row.derived_allergens
			]
			.map(x => String(x || "").toLowerCase())
			.join(" ");

			return haystack.includes(search);
		});
	},
}