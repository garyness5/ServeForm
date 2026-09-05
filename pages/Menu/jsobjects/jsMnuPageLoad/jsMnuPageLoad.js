export default {
	load() {
		return Promise.all([
			qryMnuGetCategories.run(),
			qryMnuGetDietTags.run(),
			qryMnuGetUnits.run(),
			qryMnuGetComponentItems.run(),
			qryMnuGetComponentUnits.run()
		]);
	}
}