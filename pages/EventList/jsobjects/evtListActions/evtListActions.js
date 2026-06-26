export default {
	selectedEventId() {
		return Number(tblEvtList.selectedRow?.id || 0);
	},

	hasSelection() {
		return this.selectedEventId() > 0;
	},

	async openSelectedEvent() {
		if (!this.hasSelection()) {
			showAlert("Select an event first.", "warning");
			return false;
		}

		await storeValue("current_event_id", this.selectedEventId());
		await removeValue("evt_components_local_rows");

		navigateTo("Events");
		return true;
	},

	async addEvent() {
		await storeValue("current_event_id", 0);
		await removeValue("evt_components_local_rows");
		navigateTo("Events");
		return true;
	},

	async duplicateSelectedEvent() {
		if (!this.hasSelection()) {
			showAlert("Select an event first.", "warning");
			return false;
		}

		const result = await duplicateEvtFromList.run();
		const newId = result?.[0]?.new_id || result?.[0]?.id;

		if (!newId) {
			showAlert("Event duplicate failed.", "error");
			return false;
		}

		await getEvtList.run();

		showAlert("Event duplicated.", "success");
		return true;
	},

	async deleteSelectedEventStart() {
		if (!this.hasSelection()) {
			showAlert("Select an event first.", "warning");
			return false;
		}

		showModal("mdlEvtDelete");
		return true;
	},

	async deleteSelectedEventConfirm() {
		if (!this.hasSelection()) {
			showAlert("Select an event first.", "warning");
			return false;
		}

		await deleteEvtFromList.run();

		closeModal("mdlEvtDelete");

		await getEvtList.run();

		showAlert("Event deleted.", "success");
		return true;
	}
}