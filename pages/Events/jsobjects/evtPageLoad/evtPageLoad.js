export default {
	load() {
		return Promise.all([
			getEvtCategories.run(),
			getEvtDietTags.run(),
			getEvtUnits.run(),
			getEvtComponentItems.run(),
			getEvtComponentUnits.run()
		]);
	}
}