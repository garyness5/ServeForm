export default {
	load() {
		return Promise.all([
			qryGetMnuCategories.run(),
			getMnuDietTags.run(),
			getMnuUnits.run(),
			getMnuComponentItems.run(),
			getMnuComponentUnits.run()
		]);
	}
}