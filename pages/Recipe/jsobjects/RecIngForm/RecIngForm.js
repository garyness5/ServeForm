export default {
  async openAdd() {
    await storeValue("RecIngForm_mode", "add");
    await storeValue("RecIngForm_saved_id", null);

    resetWidget("mdlRecIngAddIng", true);
    showModal("mdlRecIngAddIng");
  },

  validate() {
    if (!inpRecIngIngredient.text || !inpRecIngIngredient.text.trim()) {
      showAlert("Ingredient Name is required.", "warning");
      return false;
    }

    if (!selRecIngCategory.selectedOptionValue) {
      showAlert("Category is required.", "warning");
      return false;
    }

    return true;
  },

  async save(closeAfterSave = true) {
    if (!this.validate()) return;

    await storeValue("RecIngForm_save_name", inpRecIngIngredient.text.trim());
    await storeValue("RecIngForm_save_category_id", selRecIngCategory.selectedOptionValue);
    await storeValue("RecIngForm_save_purchase_unit_id", selRecIngPurchaseUnit.selectedOptionValue || null);
    await storeValue("RecIngForm_save_purchase_qty", inpRecIngQuantity.text || null);
    await storeValue("RecIngForm_save_total_cost", inpRecIngPurchaseCost.text || null);
    await storeValue("RecIngForm_save_wastage_percent", inpRecIngWastage.text || null);
    await storeValue("RecIngForm_save_supplier_id", selRecIngSupplier.selectedOptionValue || null);
    await storeValue("RecIngForm_save_packaging_id", selRecIngPackaging.selectedOptionValue || null);
    await storeValue("RecIngForm_save_item_code", inpRecIngSupplierCode.text ? inpRecIngSupplierCode.text.trim() : null);
    await storeValue("RecIngForm_save_notes", rteRecIngAddRecNotes.text || null);
    await storeValue("RecIngForm_save_active", chkRecIngActive.isChecked === false ? false : true);
    await storeValue("RecIngForm_save_allergens", msRecIngAllergens.selectedOptionValues || []);
    await storeValue("RecIngForm_save_diet_tags", msRecIngDietTags.selectedOptionValues || []);

    const duplicate = await recIngCheckNameExists.run();

    if (duplicate && duplicate.length > 0) {
      showAlert("An Ingredient with this name already exists.", "warning");
      return;
    }

    const result = await recAddIngredient.run();
    const savedId = result?.[0]?.id;

    if (!savedId) {
      showAlert("Ingredient saved, but no Ingredient ID was returned.", "error");
      return;
    }

    await storeValue("RecIngForm_saved_id", savedId);

    await recClearIngredientAllergens.run();
    await recInsertIngredientAllergens.run();

    await recClearIngredientDietTags.run();
    await recInsertIngredientDietTags.run();

    await getRecComponentItems.run();

    showAlert("Ingredient saved.", "success");

    if (closeAfterSave) {
      closeModal("mdlRecIngAddIng");
      return;
    }

    await storeValue("RecIngForm_saved_id", null);
    resetWidget("mdlRecIngAddIng", true);
  },

  cancel() {
    closeModal("mdlRecIngAddIng");
  }
}