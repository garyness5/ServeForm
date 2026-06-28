export default {
	async safeReset(widgetName) {
		try {
			await resetWidget(widgetName, true);
		} catch (e) {
			return null;
		}
	},

	clean(value) {
		if (value === undefined || value === "") return null;
		return value;
	},

	textClean(value) {
		const text = String(value || "").trim();
		return text || null;
	},

	requiredSaveMessage() {
		if (!String(inpEvtName.text || "").trim()) {
			return "You need an Event name before you can save.";
		}
		return null;
	},

	async validateBeforeSave() {
		const message = this.requiredSaveMessage();
		if (message) {
			showAlert(message, "warning");
			return false;
		}

		await checkEvtNameExists.run();

		if (Number(checkEvtNameExists.data?.[0]?.match_count || 0) > 0) {
			showAlert("An event with this name already exists.", "warning");
			return false;
		}

		return true;
	},

	headerSnapshotFromPage() {
		return {
			name: this.textClean(inpEvtName.text),
			event_date: datEvtDate.selectedDate
				? moment(datEvtDate.selectedDate).format("YYYY-MM-DD")
				: null,
			customer_id: selEvtCustomer.selectedOptionValue ? Number(selEvtCustomer.selectedOptionValue) : null,
			contact_id: selEvtContact.selectedOptionValue ? Number(selEvtContact.selectedOptionValue) : null,
			status: selEvtStatus.selectedOptionValue || "Draft",
			format: selEvtFormat.selectedOptionValue || null,
			active: chkEvtActive.isChecked === false ? false : true,
			notes: typeof rteEvtNotes !== "undefined" ? this.textClean(rteEvtNotes.text || rteEvtNotes.value) : null
		};
	},

	headerSnapshotFromSaved() {
		const r = Array.isArray(getEvtItemById.data)
			? getEvtItemById.data[0]
			: getEvtItemById.data;

		if (!r) {
			return {
				name: null,
				event_date: null,
				customer_id: null,
				contact_id: null,
				status: "Draft",
				format: null,
				active: true,
				notes: null
			};
		}

		return {
			name: this.textClean(r.name),
			event_date: r.event_date
				? moment(r.event_date).format("YYYY-MM-DD")
				: null,
			customer_id: r.customer_id ? Number(r.customer_id) : null,
			contact_id: r.contact_id ? Number(r.contact_id) : null,
			status: r.status || "Draft",
			format: r.format || null,
			active: r.active === false ? false : true,
			notes: this.textClean(r.notes)
		};
	},

	dietTagSnapshotFromPage() {
		return [];
	},

	dietTagSnapshotFromSaved() {
		return [];
	},

	componentSnapshotFromPage() {
		return evtCompTable.rowsForSave();
	},

	componentSnapshotFromSaved() {
		return (getEvtComponents.data || []).map((r, index) => ({
			event_id: Number(appsmith.store.current_event_id || 0),
			line_no: index + 1,
			menu_id: Number(r.menu_id || 0) || null,
			guests: r.guests === "" || r.guests == null ? null : Number(r.guests),
			extra_percent: r.extra_percent === "" || r.extra_percent == null ? 0 : Number(r.extra_percent),
			active: r.active === false ? false : true
		}));
	},

	isNewBlankEvent() {
		const h = this.headerSnapshotFromPage();
		return Number(appsmith.store.current_event_id || 0) === 0 &&
			!h.name &&
			!h.event_date &&
			!h.customer_id &&
			!h.format &&
			this.dietTagSnapshotFromPage().length === 0;
	},

	isDirty() {
		if (this.isNewBlankEvent()) return false;

		return (
			JSON.stringify(this.headerSnapshotFromPage()) !== JSON.stringify(this.headerSnapshotFromSaved()) ||
			JSON.stringify(this.dietTagSnapshotFromPage()) !== JSON.stringify(this.dietTagSnapshotFromSaved()) ||
			JSON.stringify(this.componentSnapshotFromPage()) !== JSON.stringify(this.componentSnapshotFromSaved())
		);
	},

	async saveEvent() {
		if (!(await this.validateBeforeSave())) return false;

		const isExisting = Number(appsmith.store.current_event_id || 0) > 0;
		let result = null;

		if (isExisting) {
			result = await updEvtItem.run();
		} else {
			result = await addEvtItem.run();
			const newId = result?.[0]?.id;
			if (newId) {
				await storeValue("current_event_id", newId);
			}
		}

		await saveEvtComponentsSnapshot.run();
		await getEvtItemById.run();
		await getEvtComponents.run();
		await evtCompTable.loadFromQuery();

		showAlert("Event saved.", "success");
		return true;
	},

	async saveAndNew() {
		const result = await this.saveEvent();
		if (!result) return null;

		await storeValue("current_event_id", 0);
		await removeValue("evt_components_local_rows");
		await removeValue("eventCustomerId");
		await removeValue("eventContactId");

		await this.safeReset("inpEvtName");
		await this.safeReset("datEvtDate");
		await this.safeReset("selEvtCustomer");
		await this.safeReset("selEvtContact");
		await this.safeReset("chkEvtActive");
		await this.safeReset("selEvtStatus");
		await this.safeReset("selEvtFormat");
		await this.safeReset("msEvtDietTags");
		await this.safeReset("rteEvtNotes");
		
		await getEvtItemById.clear();
		await getEvtContacts.clear();

		showAlert("Saved. Ready for new event.", "success");
		return true;
	},

	async closeEvent() {
		if (this.isDirty()) {
			await storeValue("pendingEventAction", "close");
			showModal("mdlEvtUnsavedChanges");
			return;
		}

		navigateTo("EventList");
	},

	async saveAndCloseEvent() {
		const result = await this.saveEvent();
		if (!result) return null;

		closeModal("mdlEvtUnsavedChanges");
		navigateTo("EventList");
	},

	async closeWithoutSaving() {
		closeModal("mdlEvtUnsavedChanges");
		await removeValue("evt_components_local_rows");
		navigateTo("EventList");
	},

	async duplicateEventSavedVersion() {
		const result = await duplicateEvent.run();
		const newId = result?.[0]?.new_id || result?.[0]?.id;

		if (!newId) {
			showAlert("Event duplicate failed.", "error");
			return false;
		}

		await storeValue("current_event_id", newId);
		await removeValue("evt_components_local_rows");

		await getEvtItemById.run();
		await getEvtComponents.run();
		await evtCompTable.loadFromQuery();

		showAlert("Event duplicated.", "success");
		return true;
	},

	async duplicateEvent() {
		if (this.isDirty()) {
			await storeValue("pendingEventAction", "duplicate");
			showModal("mdlEvtUnsavedChanges");
			return false;
		}

		return await this.duplicateEventSavedVersion();
	},

	async saveAndDuplicateEvent() {
		const saved = await this.saveEvent();
		if (!saved) return false;

		closeModal("mdlEvtUnsavedChanges");
		return await this.duplicateEventSavedVersion();
	},

	async duplicateWithoutSaving() {
		closeModal("mdlEvtUnsavedChanges");
		return await this.duplicateEventSavedVersion();
	},

	async deleteEventStart() {
		if (this.isDirty()) {
			await storeValue("pendingEventAction", "delete");
			showModal("mdlEvtUnsavedChanges");
			return false;
		}

		showModal("mdlEvtDelete");
		return true;
	},

	async deleteEventConfirm() {
		await deleteEvent.run();

		closeModal("mdlEvtDelete");
		await removeValue("evt_components_local_rows");
		await storeValue("current_event_id", 0);

		showAlert("Event deleted.", "success");
		navigateTo("EventList");

		return true;
	},

	async saveAndDeleteEvent() {
		const saved = await this.saveEvent();
		if (!saved) return false;

		closeModal("mdlEvtUnsavedChanges");
		showModal("mdlEvtDelete");

		return true;
	},

	async deleteWithoutSaving() {
		closeModal("mdlEvtUnsavedChanges");
		showModal("mdlEvtDelete");
		return true;
	},

	testDirtyData() {
		return {
			isDirty: this.isDirty(),
			headerCurrent: this.headerSnapshotFromPage(),
			headerSaved: this.headerSnapshotFromSaved(),
			dietTagsCurrent: this.dietTagSnapshotFromPage(),
			dietTagsSaved: this.dietTagSnapshotFromSaved()
		};
	}
}