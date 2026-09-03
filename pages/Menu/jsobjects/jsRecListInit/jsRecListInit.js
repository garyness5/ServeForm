export default {
	async init() {
		await storeValue(
			"current_client_id",
			"1315144c-801a-4371-aae4-52f2a78873d1"
		);

		await Promise.all([
			qryRecListGetCategories.run(),
			qryRecListGetRecipes.run()
		]);

		return true;
	}
}