export default {
  async safeReset(widgetName) {
    try {
      await resetWidget(widgetName, true);
    } catch (e) {
      return null;
    }
  },

  async saveRecipe() {
    await recCompTable.syncFromTable();

    const isExisting = Number(appsmith.store.current_recipe_id || 0) > 0;
    let result;

    if (isExisting) {
      result = await updRecItem.run();
    } else {
      result = await addRecItem.run();

      const newId = result?.[0]?.id;
      if (newId) {
        await storeValue("current_recipe_id", newId);
      }
    }

    await saveRecDietTagsSnapshot.run();
    await saveRecComponentsSnapshot.run();

    await getRecComponents.run();
    await recCompTable.loadFromQuery();

    showAlert("Recipe saved", "success");
    return result;
  },

  async saveAndNew() {
    await this.saveRecipe();

    await storeValue("current_recipe_id", 0);
    await recCompTable.clearDraftRows();

    await this.safeReset("inpRecName");
    await this.safeReset("selRecCategory");
    await this.safeReset("chkRecActive");
    await this.safeReset("inpRecYieldQty");
    await this.safeReset("selRecYieldUnit");
    await this.safeReset("inpRecExtraPercent");
    await this.safeReset("msRecDietTags");
    await this.safeReset("rteRecNotes");
    await this.safeReset("tblRecComponents");

    showAlert("Saved. Ready for new recipe.", "success");
    return true;
  },

  clean(value) {
    if (value === undefined || value === "") return null;
    if (typeof value === "number") return Number(value);
    if (!isNaN(value) && value !== null && value !== true && value !== false) return Number(value);
    return value;
  },

  componentSnapshot(rows) {
    return (rows || [])
      .filter(r => r.item_type && (r.ingredient_id || r.child_recipe_id))
      .map((r, index) => ({
        line_no: index + 1,
        item_type: r.item_type || null,
        ingredient_id: r.item_type === "ingredient" ? this.clean(r.ingredient_id) : null,
        child_recipe_id: r.item_type === "recipe" ? this.clean(r.child_recipe_id) : null,
        qty: this.clean(r.qty),
        unit_id: this.clean(r.unit_id),
        apply_wastage: r.apply_wastage === false ? false : true,
        active: r.active === false ? false : true
      }));
  },

  currentComponentSnapshot() {
    return this.componentSnapshot(recCompTable.rowsForSave());
  },

  savedComponentSnapshot() {
    return this.componentSnapshot(getRecComponents.data || []);
  },

  isDirty() {
    return JSON.stringify(this.currentComponentSnapshot()) !== JSON.stringify(this.savedComponentSnapshot());
  },

  async closeRecipe() {
    await recCompTable.syncFromTable();

    if (this.isDirty()) {
      showModal("mdlRecUnsavedChanges");
      return;
    }

    navigateTo("RecipeList");
  },

  async saveAndCloseRecipe() {
    await this.saveRecipe();
    closeModal("mdlRecUnsavedChanges");
    navigateTo("RecipeList");
  },

  async closeWithoutSaving() {
    closeModal("mdlRecUnsavedChanges");
    await recCompTable.clearDraftRows();
    navigateTo("RecipeList");
  },

  testSaveData() {
    return {
      current_recipe_id: appsmith.store.current_recipe_id,
      rowsForSave: recCompTable.rowsForSave()
    };
  },

  testDirtyData() {
    return {
      isDirty: this.isDirty(),
      current: this.currentComponentSnapshot(),
      saved: this.savedComponentSnapshot()
    };
  }
}