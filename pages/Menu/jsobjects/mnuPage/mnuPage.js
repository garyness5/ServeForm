export default {
	async loadComponents() {
		await removeValue("mnu_components_local_rows");
		await getMnuComponents.run();
		await mnuCompTable.loadFromQuery();
	}
}