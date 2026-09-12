export default {
	requiredSaveMessage() {
		if (
			!String(
				jsEventWorkspace.current().name || ""
			).trim()
		) {
			return "You need an Event name before you can save.";
		}

		return null;
	},

	async validateBeforeSave() {
		const message =
					this.requiredSaveMessage();

		if (message) {
			showAlert(
				message,
				"warning"
			);

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

			await jsProposalActions.addNew();

			closeModal(
				mdlEvtRename.name
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
				mdlEvtRename.name
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
		 * Persisted Event:
		 * Rename remains its own explicit action.
		 */
		await qryRenameEvt.run();

		await qryGetEvtItemById.run();

		await jsEventWorkspace
			.resetFromSaved();

		await qryGetProposalsForEvent.run();

		closeModal(
			mdlEvtRename.name
		);

		await resetWidget(
			"inpEvtRenameName",
			true
		);

		return true;
	},

	headerSnapshotFromPage() {
		const workspace =
					jsEventWorkspace.current();

		const saved =
					jsEventWorkspace.savedEvent();

		let statusRequest =
				workspace.status || "Draft";

		/*
		 * Closed is Event-owned Working State.
		 *
		 * Backend temporarily receives Closed/Open
		 * through p_header.status.
		 *
		 * Normal Proposal-derived Event Status
		 * is never manufactured here.
		 */
		if (workspace.closed === true) {
			statusRequest = "Closed";
		}
		else if (
			saved.closed === true &&
			workspace.closed === false
		) {
			statusRequest = "Open";
		}

		return {
			name:
			workspace.name,

			event_ref:
			workspace.event_ref,

			event_datetime:
			workspace.event_datetime,

			customer_id:
			workspace.customer_id,

			contact_ids:
			workspace.contact_ids || [],

			venue_id:
			workspace.venue_id,

			venue_contact_ids:
			workspace.venue_contact_ids || [],

			total_guests_manual:
			workspace.total_guests_manual,

			format:
			workspace.format,

			customer_notes:
			workspace.customer_notes,

			internal_notes:
			workspace.internal_notes,

			active:
			workspace.active,

			status:
			statusRequest
		};
	},

	headerSnapshotFromSaved() {
		const workspace =
					jsEventWorkspace.savedEvent();

		return {
			name:
			workspace.name,

			event_ref:
			workspace.event_ref,

			event_datetime:
			workspace.event_datetime,

			customer_id:
			workspace.customer_id,

			contact_ids:
			workspace.contact_ids || [],

			venue_id:
			workspace.venue_id,

			venue_contact_ids:
			workspace.venue_contact_ids || [],

			total_guests_manual:
			workspace.total_guests_manual,

			format:
			workspace.format,

			customer_notes:
			workspace.customer_notes,

			internal_notes:
			workspace.internal_notes,

			active:
			workspace.active,

			status:
			workspace.status
		};
	},

	isNewBlankEvent() {
		const header =
					this.headerSnapshotFromPage();

		return (
			Number(
				appsmith.store.current_event_id || 0
			) === 0 &&
			!header.name &&
			!header.event_datetime &&
			!header.customer_id &&
			!header.venue_id &&
			!header.format
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

		const closedChanged =
					jsEventWorkspace.current().closed !==
					jsEventWorkspace.savedEvent().closed;

		return (
			closedChanged ||
			JSON.stringify(page) !==
			JSON.stringify(saved)
		);
	},

	async eventNameExists(
		name,
		excludeEventId = 0
	) {
		await storeValue(
			"event_name_check",
			{
				name:
				String(
					name || ""
				).trim(),

				exclude_event_id:
				Number(
					excludeEventId || 0
				)
			}
		);

		try {
			await qryCheckEvtNameExists.run();

			return (
				Number(
					qryCheckEvtNameExists
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

	async ensureEventSavedForProposal() {
		const currentEventId =
					Number(
						appsmith.store.current_event_id || 0
					);

		if (currentEventId > 0) {
			return currentEventId;
		}

		if (!(await this.validateBeforeSave())) {
			return 0;
		}

		const result =
					await qrySaveNewEvent.run();

		const newId =
					Number(
						result?.[0]?.event_id || 0
					);

		if (newId <= 0) {
			showAlert(
				"Event could not be created.",
				"error"
			);

			return 0;
		}

		await storeValue(
			"current_event_id",
			newId
		);

		await qryGetEvtItemById.run();

		await jsEventWorkspace
			.resetFromSaved();

		return newId;
	},

	meaningfulComponents(rows) {
		return (rows || [])
			.filter(row =>
							Number(
			row?.menu_id || 0
		) > 0 ||
							String(
			row?.menu_name || ""
		).trim()
						 );
	},

	proposalIdsForEventSave() {
		/*
		 * Every persisted Proposal belongs to the
		 * Event Save document, whether dirty or not.
		 */
		const savedIds =
					(
						qryGetProposalsForEvent.data ||
						[]
					)
		.map(row =>
				 Number(
			row.id || 0
		)
				)
		.filter(id =>
						id > 0
					 );

		/*
		 * Every Proposal Working State also belongs
		 * to the document. This includes temporary
		 * never-saved Proposals.
		 */
		const workspaceIds =
					Object.keys(
						jsProposalWorkspaces.all()
					)
		.map(Number)
		.filter(id =>
						id !== 0
					 );

		return [
			...new Set([
				...savedIds,
				...workspaceIds
			])
		];
	},

	proposalRowsForSave(
		proposalId,
		allSavedRows = []
	) {
		const id =
					Number(
						proposalId || 0
					);

		const currentId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		const workspace =
					jsProposalWorkspaces.get(id);

		/*
		 * Current visible Proposal:
		 * exact current table Working State wins.
		 */
		if (
			id === currentId &&
			jsProposalData.hasSelectedProposal()
		) {
			return jsProposalComponents
				.effectiveRows();
		}

		/*
		 * Previously visited or temporary Proposal:
		 * preserved Working State wins.
		 */
		if (
			workspace &&
			Array.isArray(
				workspace.components
			)
		) {
			return workspace.components;
		}

		/*
		 * Persisted Proposal never visited during
		 * this session:
		 * use its current saved Supabase rows.
		 */
		return (allSavedRows || [])
			.filter(row =>
							Number(
			row.proposal_id || 0
		) === id
						 );
	},

	proposalPayload(
		proposalId,
		allSavedRows = []
	) {
		const id =
					Number(
						proposalId || 0
					);

		const workspace =
					jsProposalWorkspaces.get(id);

		const rows =
					this.proposalRowsForSave(
						id,
						allSavedRows
					);

		return {
			proposal_id:
			id,

			source_proposal_id:
			id < 0
			? (
				Number(
					workspace
					?.source_proposal_id ||
					0
				) || null
			)
			: null,

			menus:
			jsProposalSave.menuPayload(
				rows
			)
		};
	},

	async saveDocument() {
		if (!(await this.validateBeforeSave())) {
			return null;
		}

		const currentEventId =
					Number(
						appsmith.store.current_event_id || 0
					);

		/*
		 * Persisted Proposals that were never opened
		 * in this session still belong to Event Save.
		 *
		 * Load their saved Menu rows before building
		 * the complete Event document.
		 */
		if (currentEventId > 0) {
			await qryGetAllProposalMenusForEvent.run();
		}

		const allSavedRows =
					currentEventId > 0
		? (
			qryGetAllProposalMenusForEvent.data ||
			[]
		)
		: [];

		const proposalIds =
					this.proposalIdsForEventSave();

		const proposals =
					proposalIds
		.map(id => ({
			id,

			rows:
			this.meaningfulComponents(
				this.proposalRowsForSave(
					id,
					allSavedRows
				)
			)
		}))

		/*
					 * A completely blank never-saved
					 * Proposal is not meaningful Event
					 * content and is not persisted.
					 *
					 * Existing persisted Proposals remain
					 * part of the Event document even when
					 * they currently contain zero Menu rows.
					 */
		.filter(item =>
						item.id > 0 ||
						item.rows.length > 0
					 )

		.map(item =>
				 this.proposalPayload(
			item.id,
			allSavedRows
		)
				);

		const request = {
			event_id:
			currentEventId,

			header:
			this.headerSnapshotFromPage(),

			proposals
		};

		await storeValue(
			"event_document_save_request",
			request
		);

		try {
			const result =
						await qrySaveEventDocument.run();

			const row =
						result?.[0] || null;

			const savedEventId =
						Number(
							row?.event_id || 0
						);

			if (savedEventId <= 0) {
				showAlert(
					"Event was not saved.",
					"error"
				);

				return null;
			}

			/*
			 * New / duplicated Event becomes real
			 * only after successful Event Save.
			 */
			if (currentEventId <= 0) {
				await storeValue(
					"current_event_id",
					savedEventId
				);
			}

			return row;
		}
		finally {
			await removeValue(
				"event_document_save_request"
			);
		}
	}
};