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

    resetWidget("mdlAddIng", true);
    showModal("mdlAddIng");
  },

  isEdit() {
    return appsmith.store.IngForm_mode === "edit";
  },

  editRow() {
    return appsmith.store.IngForm_edit_row || {};
  },

  async save(closeAfterSave = true) {
    const name = inpIngIngredient.text ? inpIngIngredient.text.trim() : "";
    const categoryId = selIngCategory.selectedOptionValue;

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

    let result;

    if (this.isEdit()) {
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

  cancel() {
    closeModal("mdlAddIng");
  }
}