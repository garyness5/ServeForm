export default {
	async load() {
		const ok = await jsAppInit.init();

		if (!ok) {
			return false;
		}

		await Promise.all([
			qryGetIngredients.run(),
			qryGetIngCategories.run(),
			qryGetPackaging.run(),
			qryGetSuppliers.run(),
			qryGetAllergens.run(),
			qryGetDietTags.run()
		]);

		return true;
	}
};