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

    await getIngAllergenIds.run();
    await getIngDietTagIds.run();
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
		const name = inpIngIngredient.text ? inpIngIngredient.text.trim() : "";
		const categoryId = selIngCategory.selectedOptionValue;

		if (appsmith.store.IngForm_mode === "edit") {
			const oldRow = this.editRow();
			const oldUnitId = oldRow.purchase_unit_id ? String(oldRow.purchase_unit_id) : "";
			const newUnitId = selIngPurchaseUnit.selectedOptionValue ? String(selIngPurchaseUnit.selectedOptionValue) : "";

			if (oldUnitId && newUnitId && oldUnitId !== newUnitId) {
				const oldUnitType = oldRow.unit_type;

				const newUnit = (getUnits.data || []).find(u => String(u.id) === newUnitId);
				const newUnitType = newUnit?.unit_type;

				await getIngredientImpactCount.run();

				const impact = getIngredientImpactCount.data?.[0] || {};
				const totalImpact =
					Number(impact.recipe_count || 0) +
					Number(impact.dish_count || 0) +
					Number(impact.menu_count || 0) +
					Number(impact.event_count || 0);

				if (totalImpact > 0 && oldUnitType && newUnitType && oldUnitType !== newUnitType) {
					showAlert(
						"This Ingredient is already used downstream. Purchase Unit can only be changed within the same unit type.",
						"warning"
					);
					return;
				}
			}
		}

		if (!name) {
      showAlert("Ingredient Name is required.", "warning");
      return;
    }

    if (!categoryId) {
      showAlert("Category is required.", "warning");
      return;
    }

    await storeValue("IngForm_save_name", name);
    await storeValue("IngForm_save_category_id", categoryId);
    await storeValue("IngForm_save_purchase_unit_id", selIngPurchaseUnit.selectedOptionValue || null);
    await storeValue("IngForm_save_purchase_qty", inpIngQuantity.text || null);
    await storeValue("IngForm_save_total_cost", inpIngPurchaseCost.text || null);
    await storeValue("IngForm_save_wastage_percent", inpIngWastage.text || null);
    await storeValue("IngForm_save_supplier_id", selIngSupplier.selectedOptionValue || null);
    await storeValue("IngForm_save_packaging_id", selIngPackaging.selectedOptionValue || null);
    await storeValue("IngForm_save_item_code", inpIngSupplierCode.text ? inpIngSupplierCode.text.trim() : null);
    await storeValue("IngForm_save_notes", rteIngNotes.text || null);
    await storeValue("IngForm_save_active", chkIngActive.isChecked === false ? false : true);
    await storeValue("IngForm_save_allergens", msIngAllergens.selectedOptionValues || []);
		await storeValue("IngForm_save_diet_tags", msIngDietTags.selectedOptionValues || []);

		const duplicate = await ingCheckNameExists.run();

		if (duplicate && duplicate.length > 0) {
			showAlert("An Ingredient with this name already exists.", "warning");
			return;
		}

		let result;

    if (appsmith.store.IngForm_mode === "edit") {
      result = await updateIngredient.run();
    } else {
      result = await addIngredient.run();
    }

    const savedId = result?.[0]?.id;

    if (!savedId) {
      showAlert("Ingredient saved, but no Ingredient ID was returned.", "error");
      return;
    }

    await storeValue("IngForm_saved_id", savedId);

    await clearIngredientAllergens.run();
    await insertIngredientAllergens.run();

    await clearIngredientDietTags.run();
    await insertIngredientDietTags.run();

    await getIngredients.run();

    showAlert("Ingredient saved.", "success");

    if (closeAfterSave) {
      closeModal("mdlAddIng");
      return;
    }

    await storeValue("IngForm_context", this.CONTEXT_ADD_INGREDIENTS);
    await storeValue("IngForm_mode", "add");
    await storeValue("IngForm_edit_id", null);
    await storeValue("IngForm_edit_row", null);
    await storeValue("IngForm_saved_id", null);

    resetWidget("mdlAddIng", true);
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
		await getIngredients.run();

		closeModal("mdlDelConfirmIng");
		showAlert("Ingredient deleted.", "success");
	},

	cancelDelete() {
		closeModal("mdlDelConfirmIng");
	},
	
	async openDuplicateFromIngredients() {
		const row = tblIngList.selectedRow;

		if (!row || !row.id) {
			showAlert("Select an ingredient to duplicate.", "warning");
			return;
		}

		await storeValue("IngDuplicate_base_name", row.name);

		const existingCopies = await getIngDuplicateNames.run();

		let copyName = `${row.name} - Copy`;

		if (existingCopies && existingCopies.length > 0) {
			const usedNumbers = existingCopies
				.map(r => r.name)
				.map(name => {
					if (name === `${row.name} - Copy`) return 1;

					const match = name.match(new RegExp(`^${row.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} - Copy (\\d+)$`));
					return match ? Number(match[1]) : 0;
				})
				.filter(n => n > 0);

			const nextNumber = usedNumbers.length > 0
				? Math.max(...usedNumbers) + 1
				: 2;

			copyName = `${row.name} - Copy ${nextNumber}`;
		}

		await storeValue("IngForm_context", this.CONTEXT_ADD_INGREDIENTS);
		await storeValue("IngForm_mode", "duplicate");
		await storeValue("IngForm_edit_id", null);
		await storeValue("IngForm_edit_row", {
			...row,
			id: null,
			name: copyName
		});

		await getIngAllergenIds.run();
		await getIngDietTagIds.run();

		resetWidget("mdlAddIng", true);
		showModal("mdlAddIng");
	},
	
  cancel() {
    closeModal("mdlAddIng");
  }
}