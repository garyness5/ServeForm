export default {
  load() {
    return Promise.all([
      qryRecGetIngCategories.run(),
      qryRecGetSuppliers.run(),
      qryRecGetPackaging.run(),
      qryRecGetAllergens.run(),
      qryRecGetDietTags.run(),
      qryRecGetUnits.run()
    ]);
  }
}