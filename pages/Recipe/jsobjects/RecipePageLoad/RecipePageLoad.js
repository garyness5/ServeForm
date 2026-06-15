export default {
  load() {
    return Promise.all([
      recGetIngCategories.run(),
      recGetSuppliers.run(),
      recGetPackaging.run(),
      recGetAllergens.run(),
      recGetDietTags.run(),
      recGetUnits.run()
    ]);
  }
}