export default {
	async load() {
		const ok = await jsAppInit.init();

		if (!ok) {
			return false;
		}

		await Promise.all([
			qryGetDshCategories.run(),
			qryGetDishList.run()
		]);

		return true;
	}
};