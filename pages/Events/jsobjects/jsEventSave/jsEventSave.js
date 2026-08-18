export default {
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

		const header =
					jsEventWorkspace.current();

		const nameExists =
					await this.eventNameExists(
						header.name,
						appsmith.store.current_event_id
					);

		if (nameExists) {
			showAlert(
				"Event Name already exists.",
				"warning"
			);

			return false;
		}
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

		const nameExists =
					await this.eventNameExists(
						newName,
						eventId > 0
						? eventId
						: 0
					);

		if (nameExists) {
			showAlert(
				"Event Name already exists.",
				"warning"
			);

			return false;
		}

		/*
	 * Add Event:
	 * create a new blank Event Working State
	 * using the entered name.
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

	async eventNameExists(name, excludeEventId = 0) {
		await storeValue(
			"event_name_check",
			{
				name:
				String(name || "").trim(),

				exclude_event_id:
				Number(excludeEventId || 0)
			}
		);

		try {
			await checkEvtNameExists.run();

			return (
				Number(
					checkEvtNameExists
					.data?.[0]
					?.match_count || 0
				) > 0
			);
		}
		finally {
			await removeValue(
				"event_name_check"
			);
		}
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