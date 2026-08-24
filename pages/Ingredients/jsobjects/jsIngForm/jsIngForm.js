export default {
	CONTEXT_ADD_INGREDIENTS: "addFromIngredients",
	CONTEXT_EDIT_INGREDIENTS: "editFromIngredients",

	async openAddFromIngredients() {
		await storeValue("IngForm_context", this.CONTEXT_ADD_INGREDIENTS);
		await storeValue("IngForm_mode", "add");
		await storeValue("IngForm_edit_id", null);
		await storeValue("IngForm_edit_row", null);

		resetWidget("mdlAddIng", true);
		showModal("mdlAddIng");
	},

	async openEditFromIngredients() {
		const row = tblIngList.selectedRow;

		if (!row || !row.id) {
			showAlert("Select an ingredient to edit.", "warning");
			return;
		}

		await storeValue("IngForm_context", this.CONTEXT_EDIT_INGREDIENTS);
		await storeValue("IngForm_mode", "edit");
		await storeValue("IngForm_edit_id", row.id);
		await storeValue("IngForm_edit_row", row);

		await qryGetIngAllergenIds.run();
		await qryGetIngDietTagIds.run();
		await getIngredientImpactCount.run();

		resetWidget("mdlAddIng", true);
		showModal("mdlAddIng");
	},

	isEdit() {
		return appsmith.store.IngForm_mode === "edit" || appsmith.store.IngForm_mode === "duplicate";
	},

	editRow() {
		return appsmith.store.IngForm_edit_row || {};
	},

	async save(closeAfterSave = true) {
		const name =
					inpIngIngredient.text
		? inpIngIngredient.text.trim()
		: "";

		const categoryId =
					selIngCategory.selectedOptionValue;

		if (!name) {
			showAlert(
				"Ingredient Name is required.",
				"warning"
			);
			return false;
		}

		if (!categoryId) {
			showAlert(
				"Category is required.",
				"warning"
			);
			return false;
		}

		try {
			const result =
						await qrySaveIngredient.run();

			const savedId =
						Number(result?.[0]?.ingredient_id || 0);

			if (!savedId) {
				showAlert(
					"Ingredient was not saved.",
					"error"
				);
				return false;
			}

			await storeValue(
				"IngForm_saved_id",
				savedId
			);

			await qryGetIngredients.run();

			showAlert(
				"Ingredient saved.",
				"success"
			);

			if (closeAfterSave) {
				closeModal("mdlAddIng");
				return true;
			}

			await storeValue(
				"IngForm_context",
				this.CONTEXT_ADD_INGREDIENTS
			);

			await storeValue(
				"IngForm_mode",
				"add"
			);

			await storeValue(
				"IngForm_edit_id",
				null
			);

			await storeValue(
				"IngForm_edit_row",
				null
			);

			await storeValue(
				"IngForm_saved_id",
				null
			);

			resetWidget(
				"mdlAddIng",
				true
			);

			return true;

		} catch (error) {
			showAlert(
				error?.message ||
				"Ingredient could not be saved.",
				"error"
			);

			return false;
		}
	},

	async openDeleteConfirm() {
		const row = tblIngList.selectedRow;

		if (!row || !row.id) {
			showAlert("Select an ingredient to delete.", "warning");
			return;
		}

		await getIngredientImpactCount.run();
		showModal("mdlDelConfirmIng");
	},

	async confirmDelete() {
		const row = tblIngList.selectedRow;

		if (!row || !row.id) {
			showAlert("No ingredient selected.", "warning");
			return;
		}

		await delIng.run();
		await qryGetIngredients.run();

		closeModal("mdlDelConfirmIng");
		showAlert("Ingredient deleted.", "success");
	},

	cancelDelete() {
		closeModal("mdlDelConfirmIng");
	},

	async openDuplicateFromIngredients() {
		const row = tblIngList.selectedRow;

		if (!row?.id) {
			showAlert(
				"Select an ingredient to duplicate.",
				"warning"
			);
			return false;
		}

		// Load source-owned relationship data before
		// removing the source Ingredient identity.
		await storeValue(
			"IngForm_edit_id",
			row.id
		);

		const allergenRows =
					await qryGetIngAllergenIds.run();

		const dietTagRows =
					await qryGetIngDietTagIds.run();

		const duplicateAllergens =
					(allergenRows || [])
		.map(r => String(r.helper_list_item_id));

		const duplicateDietTags =
					(dietTagRows || [])
		.map(r => String(r.helper_list_item_id));


		// Generate the next available copy name from
		// currently published Ingredients.
		const allNames =
					(qryGetIngredients.data || [])
		.map(r => String(r.name || ""));

		const escapedName =
					String(row.name || "")
		.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

		const copyRegex =
					new RegExp(
						`^${escapedName} - Copy(?: (\\d+))?$`
					);

		const usedNumbers =
					allNames
		.map(name => {
			const match = name.match(copyRegex);

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

		const copyName =
					nextNumber === 1
		? `${row.name} - Copy`
		: `${row.name} - Copy ${nextNumber}`;


		// Duplicate is a new unsaved Ingredient workspace.
		await storeValue(
			"IngForm_context",
			this.CONTEXT_ADD_INGREDIENTS
		);

		await storeValue(
			"IngForm_mode",
			"duplicate"
		);

		await storeValue(
			"IngForm_edit_id",
			null
		);

		await storeValue(
			"IngForm_edit_row",
			{
				...row,
				id: null,
				name: copyName
			}
		);

		await storeValue(
			"IngForm_duplicate_allergens",
			duplicateAllergens
		);

		await storeValue(
			"IngForm_duplicate_diet_tags",
			duplicateDietTags
		);

		resetWidget(
			"mdlAddIng",
			true
		);

		showModal(
			"mdlAddIng"
		);

		return true;
	},

	allergenDefaultValues() {
		if (appsmith.store.IngForm_mode === "duplicate") {
			return appsmith.store.IngForm_duplicate_allergens || [];
		}

		if (appsmith.store.IngForm_mode === "edit") {
			return (qryGetIngAllergenIds.data || [])
				.map(r => String(r.helper_list_item_id));
		}

		return [];
	},

	dietTagDefaultValues() {
		if (appsmith.store.IngForm_mode === "duplicate") {
			return appsmith.store.IngForm_duplicate_diet_tags || [];
		}

		if (appsmith.store.IngForm_mode === "edit") {
			return (qryGetIngDietTagIds.data || [])
				.map(r => String(r.helper_list_item_id));
		}

		return [];
	},
}