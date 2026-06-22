export default {
	load() {
		return Promise.all([
			getMnuCategories.run(),
			getMnuDietTags.run(),
			getMnuUnits.run(),
			getMnuComponentItems.run(),
			getMnuComponentUnits.run()
		]);
	}
}