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
		const row = tblEvtList.updatedRow || tblEvtList.triggeredRow || {};
		const eventId = Number(row.id || 0);

		if (!eventId) {
			showAlert("Event could not be identified.", "error");
			await getEvtList.run();
			await resetWidget("tblEvtList", true);
			return false;
		}

		const newStatus = row.status || "Draft";
		const newActive = row.active === false ? false : true;

		await storeValue("pending_evt_id", eventId);
		await storeValue("pending_evt_status", newStatus);
		await storeValue("pending_evt_active", newActive);

		await getEvtGroceriesSavedState.run();

		const old = getEvtGroceriesSavedState.data?.[0] || {};
		const oldStatus = old.status || "Draft";
		const oldActive = old.active === false ? false : true;

		await storeValue("pending_evt_name", old.name || row.name || "this Event");

		const oldEligible = oldStatus === "Ordered" && oldActive === true;
		const newEligible = newStatus === "Ordered" && newActive === true;

		if (!oldEligible && newEligible) {
			await updEvtListPendingInline.run();
			await syncEvtGroceriesEligibility.run();
			await getEvtList.run();
			await resetWidget("tblEvtList", true);
			showAlert("Event added to Groceries.", "success");
			return true;
		}

		if (oldEligible === newEligible) {
			await updEvtListPendingInline.run();
			await getEvtList.run();
			await resetWidget("tblEvtList", true);
			return true;
		}

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