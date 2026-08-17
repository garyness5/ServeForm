export default {
	textClean(value) {
		const text = String(value || "").trim();
		return text || null;
	},

	requiredSaveMessage() {
		if (!String(jsEventWorkspace.current().name || "").trim()) {
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

	canSaveRename() {
		const newName =
					String(
						inpEvtRenameName.text || ""
					).trim();

		const oldName =
					String(
						jsEventWorkspace.current().name || ""
					).trim();

		return (
			newName.length > 0 &&
			newName !== oldName
		);
	},

	async renameEvent() {
		if (!this.canSaveRename()) {
			return false;
		}

		const newName =
					String(
						inpEvtRenameName.text || ""
					).trim();

		const eventId =
					Number(
						appsmith.store.current_event_id || 0
					);

		/*
	 * Unsaved Event / duplicated Working State.
	 *
	 * Rename changes only the Appsmith
	 * Event Working State.
	 *
	 * Nothing is committed until Save.
	 */
		if (
			appsmith.store.event_name_mode === "add"
		) {
			await removeValue(
				"current_event_id"
			);

			await removeValue(
				"current_proposal_id"
			);

			await removeValue(
				"proposal_workspaces"
			);

			await jsEventWorkspace.set({
				...jsEventWorkspace.emptyWorkspace(),
				name: newName
			});

			closeModal(
				"mdlEvtRename"
			);

			await resetWidget(
				"inpEvtRenameName",
				true
			);

			await removeValue(
				"event_name_mode"
			);

			return true;
		}

		/*
 * Existing unsaved Event / Duplicate:
 * rename Working State only.
 */
		if (eventId <= 0) {
			await jsEventWorkspace.capture({
				name: newName
			});

			closeModal(
				"mdlEvtRename"
			);

			await resetWidget(
				"inpEvtRenameName",
				true
			);

			await removeValue(
				"event_name_mode"
			);

			return true;
		}if (
			appsmith.store.event_name_mode === "add"
		) {
			await removeValue(
				"current_event_id"
			);

			await removeValue(
				"current_proposal_id"
			);

			await removeValue(
				"proposal_workspaces"
			);

			await jsEventWorkspace.set({
				...jsEventWorkspace.emptyWorkspace(),
				name: newName
			});

			closeModal(
				"mdlEvtRename"
			);

			await resetWidget(
				"inpEvtRenameName",
				true
			);

			await removeValue(
				"event_name_mode"
			);

			return true;
		}

		/*
 * Existing unsaved Event / Duplicate:
 * rename Working State only.
 */
		if (eventId <= 0) {
			await jsEventWorkspace.capture({
				name: newName
			});

			closeModal(
				"mdlEvtRename"
			);

			await resetWidget(
				"inpEvtRenameName",
				true
			);

			await removeValue(
				"event_name_mode"
			);

			return true;
		}

		/*
	 * Persisted Event.
	 */
		await renameEvt.run();

		await getEvtItemById.run();

		await jsEventWorkspace
			.resetFromSaved();

		await qryGetProposalsForEvent.run();

		closeModal(
			"mdlEvtRename"
		);

		await resetWidget(
			"inpEvtRenameName",
			true
		);

		showAlert(
			"Event renamed.",
			"success"
		);

		return true;
	},

	headerSnapshotFromPage() {
		const header = {
			...jsEventWorkspace.current()
		};

		delete header.event_id;

		return header;
	},

	headerSnapshotFromSaved() {
		const header = {
			...jsEventWorkspace.savedEvent()
		};

		delete header.event_id;

		return header;
	},

	isNewBlankEvent() {
		const h =
					this.headerSnapshotFromPage();

		return (
			Number(
				appsmith.store.current_event_id || 0
			) === 0 &&
			!h.name &&
			!h.event_datetime &&
			!h.customer_id &&
			!h.venue_id &&
			!h.format
		);
	},

	dirtyDifferences() {
		const page =
					this.headerSnapshotFromPage();

		const saved =
					this.headerSnapshotFromSaved();

		return Object.keys(page)
			.filter(key =>
							JSON.stringify(page[key]) !==
							JSON.stringify(saved[key])
						 )
			.map(key => ({
			field: key,
			page: page[key],
			saved: saved[key]
		}));
	},

	isDirty() {
		if (this.isNewBlankEvent()) {
			return false;
		}

		const page =
					this.headerSnapshotFromPage();

		const saved =
					this.headerSnapshotFromSaved();

		return (
			JSON.stringify(page) !==
			JSON.stringify(saved)
		);
	},

	async saveEvent() {
		if (!(await this.validateBeforeSave())) {
			return false;
		}

		const isExisting =
					Number(
						appsmith.store.current_event_id || 0
					) > 0;

		let result = null;

		if (isExisting) {
			result =
				await qrysaveEvtHeader.run();
		}
		else {
			result =
				await qrySaveNewEvent.run();

			const newId =
						Number(
							result?.[0]?.event_id || 0
						);

			if (!newId) {
				showAlert(
					"Event could not be created.",
					"error"
				);

				return false;
			}

			/*
		 * Event becomes real only here,
		 * on Save.
		 */
			await storeValue(
				"current_event_id",
				newId
			);
		}

		/*
	 * Reload Published State after persistence.
	 */
		await getEvtItemById.run();

		/*
	 * Saved truth becomes the Event
	 * Working State baseline.
	 */
		await jsEventWorkspace.resetFromSaved();

		showAlert(
			"Event saved.",
			"success"
		);

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
	}
}