export default {
	selectedEventId() {
		return Number(tblEvtList.selectedRow?.id || 0);
	},

	hasSelection() {
		return this.selectedEventId() > 0;
	},

	async openSelectedEvent() {
		if (!this.hasSelection()) {
			showAlert(
				"Select an event first.",
				"warning"
			);

			return false;
		}

		/*
	 * Opening another saved Event abandons
	 * any unsaved Events-page Working State.
	 */
		await removeValue(
			"event_workspace"
		);

		await removeValue(
			"current_proposal_id"
		);

		await removeValue(
			"proposal_workspaces"
		);

		await removeValue(
			"evt_components_local_rows"
		);

		await storeValue(
			"current_event_id",
			this.selectedEventId()
		);

		navigateTo("Events");

		return true;
	},

	async addEvent() {
		await removeValue(
			"event_workspace"
		);

		await removeValue(
			"current_proposal_id"
		);

		await removeValue(
			"proposal_workspaces"
		);

		await removeValue(
			"evt_components_local_rows"
		);

		await storeValue(
			"current_event_id",
			0
		);

		navigateTo("Events");

		return true;
	},

	async duplicateSelectedEvent() {
		if (!this.hasSelection()) {
			showAlert(
				"Select an event first.",
				"warning"
			);

			return false;
		}

		/*
	 * Clear any stale Events-page Working State.
	 */
		await removeValue(
			"event_workspace"
		);

		await removeValue(
			"current_proposal_id"
		);

		await removeValue(
			"proposal_workspaces"
		);

		await removeValue(
			"event_duplicate_snapshot"
		);

		/*
	 * Open the selected saved Event on Events first.
	 *
	 * Events owns the actual Duplicate / Save As engine.
	 */
		await storeValue(
			"current_event_id",
			this.selectedEventId()
		);

		await storeValue(
			"event_open_mode",
			"duplicate"
		);

		navigateTo(
			"Events",
			{},
			"SAME_WINDOW"
		);

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
	},
}