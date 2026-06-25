export default {
	async loadComponents() {
		const currentMenuId = Number(appsmith.store.current_menu_id || 0);

		await removeValue("mnu_components_local_rows");

		if (currentMenuId === 0) {
			await evtCompTable.setRows([]);
			return;
		}

		await getEvtComponents.run();
		await evtCompTable.loadFromQuery();
	}
}