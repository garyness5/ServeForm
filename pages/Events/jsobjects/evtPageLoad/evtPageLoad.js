export default {
	async load() {
		await storeValue("current_client_id", "1315144c-801a-4371-aae4-52f2a78873d1");

		return Promise.all([
			getEvtCategories.run(),
			getEvtDietTags.run(),
			getEvtComponentItems.run()
		]);
	}
}