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
			"event_open_mode"
		);

		await storeValue(
			"current_event_id",
			this.selectedEventId()
		);

		navigateTo("Events");

		return true;
	},

	async addEvent() {
		const newName =
					String(
						inpEvtListAddName.text || ""
					).trim();

		if (!newName) {
			showAlert(
				"Enter an Event name.",
				"warning"
			);

			return false;
		}

		/*
	 * Clear any stale Events-page state.
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

		await removeValue(
			"event_open_mode"
		);

		/*
	 * Carry the EventList-entered name
	 * into the new Events workspace.
	 */
		await storeValue(
			"event_new_name",
			newName
		);

		await storeValue(
			"current_event_id",
			0
		);

		navigateTo(
			"Events",
			{},
			"SAME_WINDOW"
		);

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
			showAlert(
				"Select an event first.",
				"warning"
			);

			return false;
		}

		try {
			const result =
						await qryDeleteEvtList.run();

			const row =
						result?.[0] || null;

			if (row?.deleted !== true) {
				throw new Error(
					"Event could not be deleted."
				);
			}

			closeModal(
				"mdlEvtDelete"
			);

			await qryGetEvtList.run();

			showAlert(
				"Event deleted.",
				"success"
			);

			return true;
		}
		catch (error) {
			showAlert(
				error?.message ||
				"Event could not be deleted.",
				"error"
			);

			return false;
		}
	},

	filteredEvents() {
		const rows =
					qryGetEvtList.data || [];

		const filter =
					selEvtListFilter.selectedOptionValue ||
					"active";

		switch (filter) {
			case "active":
				return rows.filter(row =>
													 row.active === true &&
													 row.status !== "Closed"
													);

			case "inactive":
				return rows.filter(row =>
													 row.active === false &&
													 row.status !== "Closed"
													);

			case "closed":
				return rows.filter(row =>
													 row.status === "Closed"
													);

			case "all":
			default:
				return rows;
		}
	},
}