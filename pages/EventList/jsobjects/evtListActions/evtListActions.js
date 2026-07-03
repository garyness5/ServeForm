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
	},
	
	async syncGroceriesEligibilityFromList() {
		const oldRow = tblEvtList.triggeredRow || {};
		const newRow = tblEvtList.updatedRow || {};

		const eventId = Number(newRow.id || oldRow.id || 0);

		const oldStatus = oldRow.status || "Draft";
		const newStatus = newRow.status || oldRow.status || "Draft";

		const oldActive = oldRow.active === false ? false : true;
		const newActive =
			Object.prototype.hasOwnProperty.call(newRow, "active")
				? newRow.active !== false
				: oldActive;

		await storeValue("pending_evt_id", eventId);
		await storeValue("pending_evt_name", newRow.name || oldRow.name || "this Event");
		await storeValue("pending_evt_status", newStatus);
		await storeValue("pending_evt_active", newActive);

		const oldEligible = oldStatus === "Ordered" && oldActive === true;
		const newEligible = newStatus === "Ordered" && newActive === true;

		// Going TO Groceries
		if (!oldEligible && newEligible) {
			await updEvtListPendingInline.run();
			await syncEvtGroceriesEligibility.run();
			await getEvtList.run();
			showAlert("Event added to Groceries.", "success");
			return true;
		}

		// Staying eligible or staying ineligible — just save Status/Active
		if (oldEligible === newEligible) {
			await updEvtListPendingInline.run();
			await getEvtList.run();
			return true;
		}

		// Going FROM Groceries
		await checkEvtGroceriesManualImpact.run();

		const hasManual =
			checkEvtGroceriesManualImpact.data?.[0]?.has_manual_values === true;

		if (hasManual) {
			showModal("mdlEvtListRemove");
			return false;
		}

		return await this.confirmGroceriesRemoval(true);
	},

	async cancelGroceriesRemoval() {
		closeModal("mdlEvtListRemove");
		await getEvtList.run();
		await resetWidget("tblEvtList", true);
		return true;
	},

	async confirmGroceriesRemoval(keepManual = true) {
		await updEvtListPendingInline.run();
		await syncEvtGroceriesEligibility.run();

		await refreshGroDetails.run();
		await refreshGroOrder.run();

		if (!keepManual) {
			await clearGroOrderManualValues.run();
		}

		await clearGroPrint.run();
		await getEvtList.run();

		closeModal("mdlEvtListRemove");

		showAlert(
			keepManual
				? "Event removed from Groceries. Quantities kept. Print cleared."
				: "Event removed from Groceries. Quantities deleted. Print cleared.",
			"success"
		);

		return true;
	}
}