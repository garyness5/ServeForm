export default {
async openAddFromRecipe() {
  showAlert("Recipe Add Clicked", "success");
},

  isEdit() {
    return false;
  },

  editRow() {
    return {};
  },

  cancel() {
    closeModal("mdlAddIngredient");
  }
}