export default {
	async loadComponents() {
		await removeValue(
			"rec_components_local_rows"
		);

		await qryRecGetComponents.run();

		await jsRecCompTable.loadFromQuery();
	}
}