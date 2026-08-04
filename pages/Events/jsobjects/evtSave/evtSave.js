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
		const customerContactIds =
					(msEvtContacts.selectedOptionValues || [])
		.map(Number)
		.filter(Boolean);

		const venueContactIds =
					(msEvtVenueContacts.selectedOptionValues || [])
		.map(Number)
		.filter(Boolean);

		return {
			name:
			this.textClean(inpEvtName.text),

			event_date:
			datEvtDate.selectedDate
			? moment(datEvtDate.selectedDate)
			.format("YYYY-MM-DD")
			: null,

			event_datetime:
			datEvtDate.selectedDate
			? moment(datEvtDate.selectedDate)
			.format("YYYY-MM-DD HH:mm:ss")
			: null,

			customer_id:
			Number(
				selEvtCustomer.selectedOptionValue || 0
			) || null,

			/*
		 * Temporary compatibility for evt_items.
		 * Proposal saves use the full arrays.
		 */
			contact_id:
			customerContactIds[0] || null,

			contact_ids:
			customerContactIds,

			venue_id:
			Number(
				selEvtVenue.selectedOptionValue || 0
			) || null,

			venue_contact_id:
			venueContactIds[0] || null,

			venue_contact_ids:
			venueContactIds,

			event_ref:
			this.textClean(inpEvtRef.text),

			total_guests_manual:
			inpTotalGuests.text === "" ||
			inpTotalGuests.text === null ||
			inpTotalGuests.text === undefined
			? null
			: Number(inpTotalGuests.text),

			status:
			selEvtStatus.selectedOptionValue ||
			"Draft",

			format:
			selEvtFormat.selectedOptionValue ||
			null,

			active:
			chkEvtActive.isChecked === false
			? false
			: true,

			/*
		 * Temporary compatibility for evt_items.notes.
		 */
			notes:
			this.textClean(
				rteEvtInternalNotes.text ||
				rteEvtInternalNotes.value ||
				""
			)
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
				event_datetime: null,
				customer_id: null,
				contact_id: null,
				venue_id: null,
				event_ref: null,
				total_guests_manual: null,
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
			event_datetime: r.event_datetime
			? moment(r.event_datetime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss")
			: null,
			customer_id: r.customer_id ? Number(r.customer_id) : null,
			contact_id: r.contact_id ? Number(r.contact_id) : null,
			venue_id: r.venue_id ? Number(r.venue_id) : null,
			event_ref: this.textClean(r.event_ref),
			total_guests_manual: r.total_guests_manual == null ? null : Number(r.total_guests_manual),
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
			extra_guests: r.extra_guests === "" || r.extra_guests == null ? 0 : Number(r.extra_guests),
			active: r.active === false ? false : true
		}));
	},

	isNewBlankEvent() {
		const h = this.headerSnapshotFromPage();
		return Number(appsmith.store.current_event_id || 0) === 0 &&
			!h.name &&
			!h.event_date &&
			!h.customer_id &&
			!h.venue_id &&
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

	async saveEvent(skipGroceriesCheck = false) {
		if (!(await this.validateBeforeSave())) return false;

		const isExisting = Number(appsmith.store.current_event_id || 0) > 0;

		const oldHeader = this.headerSnapshotFromSaved();
		const newHeader = this.headerSnapshotFromPage();

		const oldEligible =
					oldHeader.status === "Ordered" &&
					oldHeader.active === true;

		const newEligible =
					newHeader.status === "Ordered" &&
					newHeader.active === true;

		if (
			isExisting &&
			!skipGroceriesCheck &&
			oldEligible &&
			!newEligible
		) {
			await checkEvtGroceriesManualImpact.run();

			const hasManual =
						checkEvtGroceriesManualImpact.data?.[0]?.has_manual_values === true;

			if (hasManual) {
				await storeValue("pendingEventAction", "groceries_removal_save");
				showModal("mdlEvtRemoveFromGroceries");
				return false;
			}
		}

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

		await syncEvtGroceriesEligibility.run();

		if (isExisting && oldEligible && !newEligible) {
			await refreshGroDetails.run();
			await refreshGroOrder.run();
			await clearGroPrint.run();
		}

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
		await this.safeReset("msEvtContacts");
		await this.safeReset("msEvtVenueContacts");
		await this.safeReset("selEvtVenue");
		await this.safeReset("chkEvtActive");
		await this.safeReset("selEvtStatus");
		await this.safeReset("selEvtFormat");
		await this.safeReset("msEvtDietTags");
		await this.safeReset("rteEvtCustomerNotes");
		await this.safeReset("rteEvtInternalNotes");

		await getEvtItemById.clear();
		await qryGetEvtContacts.clear();

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

	async cancelGroceriesRemovalSave() {
		closeModal("mdlEvtRemoveFromGroceries");
		await removeValue("pendingEventAction");
		return true;
	},

	async confirmGroceriesRemovalSave(keepManual = true) {
		closeModal("mdlEvtRemoveFromGroceries");

		const saved = await this.saveEvent(true);
		if (!saved) return false;

		if (!keepManual) {
			await clearGroOrderManualValues.run();
			await refreshGroOrder.run();
		}

		await clearGroPrint.run();

		showAlert(
			keepManual
			? "Event saved. Quantities kept. Print cleared."
			: "Event saved. Quantities deleted. Print cleared.",
			"success"
		);

		return true;
	},

	testDirtyData() {
		return {
			isDirty: this.isDirty(),
			headerCurrent: this.headerSnapshotFromPage(),
			headerSaved: this.headerSnapshotFromSaved(),
			dietTagsCurrent: this.dietTagSnapshotFromPage(),
			dietTagsSaved: this.dietTagSnapshotFromSaved(),
			componentCurrent: this.componentSnapshotFromPage(),
			componentSaved: this.componentSnapshotFromSaved()
		};
	}
}