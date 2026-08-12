export default {
	async dirtyState() {
		/*
		 * Capture the live Proposal table before
		 * checking dirty state.
		 */
		await jsProposalWorkspaces
			.captureCurrentComponents();

		return {
			event_dirty:
			jsEventSave.isDirty(),

			proposal_ids:
			jsProposalWorkspaces
			.dirtyProposalIds()
		};
	},

	proposalLabel(proposalId) {
		const row =
					(
						qryGetProposalsForEvent.data ||
						[]
					).find(item =>
								 Number(item.id || 0) ===
								 Number(proposalId || 0)
								);

		return row?.proposal_no != null
			? `Proposal ${row.proposal_no}`
		: "Unsaved Proposal";
	},

	proposalText(proposalIds) {
		return (proposalIds || [])
			.map(id =>
					 this.proposalLabel(id)
					)
			.join(", ");
	},

	actionTitle(action) {
		switch (action) {
			case "save":
				return "Proposals: Unsaved Changes";

			case "save_new":
				return "Save & New";

			case "add":
				return "Add Event";

			case "duplicate":
				return "Duplicate Event";

			case "close":
				return "Close Event";

			default:
				return "Proposals: Unsaved Changes";
		}
	},

	actionMessage(action, proposalIds) {
		const proposals =
					(proposalIds || [])
		.map(id =>
				 this.proposalLabel(id)
				);

		const list =
					proposals
		.map(label => `• ${label}`)
		.join("\n");

		const firstPart =
					`The following are unsaved:\n\n${list}`;

		switch (action) {
			case "save":
				return (
					firstPart +
					"\n\nSave the Event and all unsaved Proposal changes?"
				);

			case "save_new":
				return (
					firstPart +
					"\n\nSave all changes before starting a new Event?"
				);

			case "add":
				return (
					firstPart +
					"\n\nSave all changes before adding another Event?"
				);

			case "duplicate":
				return (
					firstPart +
					"\n\nSave all changes before duplicating this Event?"
				);

			case "close":
				return (
					firstPart +
					"\n\nSave all changes before closing this Event?"
				);

			default:
				return firstPart;
		}
	},

	async request(action) {
		const state =
					await this.dirtyState();

		/*
		 * The shared warning exists specifically
		 * for unsaved Proposal work.
		 */
		if (state.proposal_ids.length) {
			await storeValue(
				"pendingEventAction",
				action
			);

			await storeValue(
				"evt_unsaved_title",
				this.actionTitle(action)
			);

			await storeValue(
				"evt_unsaved_message",
				this.actionMessage(
					action,
					state.proposal_ids
				)
			);

			showModal(
				"mdlEvtUnsavedChanges"
			);

			return false;
		}

		return await this.executeWithoutWarning(
			action
		);
	},

	async executeWithoutWarning(action) {
		switch (action) {
			case "save":
				return await jsEventSave
					.saveEvent();

				/*
			 * Other actions are wired as we
			 * normalize their final behavior.
			 */
			default:
				return false;
		}
	},

	async confirm() {
		const action =
					appsmith.store
		.pendingEventAction ||
					null;

		if (!action) {
			return false;
		}

		if (action === "save") {
			try {
				const saved =
							await this.saveAllDirty();

				if (!saved) {
					return false;
				}

				closeModal(
					"mdlEvtUnsavedChanges"
				);

				await removeValue(
					"pendingEventAction"
				);

				await removeValue(
					"evt_unsaved_title"
				);

				await removeValue(
					"evt_unsaved_message"
				);

				/*
			 * Reload Event truth.
			 */
				await getEvtItemById.run();

				await Promise.all([
					qryGetProposalsForEvent.run(),
					qryGetSelectedProposal.run(),
					qryGetSelectedProposalMenus.run()
				]);

				/*
			 * All saved Proposal workspaces are now stale.
			 */
				await removeValue(
					"proposal_workspaces"
				);

				await jsProposalWorkspaces
					.initializeCurrentDraft();

				await resetWidget(
					"tblEvtComponents",
					true
				);

				await removeValue(
					"evt_working_customer_id"
				);

				await removeValue(
					"evt_working_venue_id"
				);

				await removeValue(
					"evt_working_contact_ids"
				);

				await removeValue(
					"evt_working_venue_contact_ids"
				);

				showAlert(
					"Event and unsaved Proposals saved.",
					"success"
				);

				return true;
			} catch (error) {
				showAlert(
					error?.message ||
					"Event and Proposals could not be saved. No changes were saved.",
					"error"
				);

				return false;
			}
		}

		return false;
	},

	async cancel() {
		closeModal(
			"mdlEvtUnsavedChanges"
		);

		await removeValue(
			"pendingEventAction"
		);

		await removeValue(
			"evt_unsaved_title"
		);

		await removeValue(
			"evt_unsaved_message"
		);

		return true;
	},

	proposalPayload(proposalId) {
		const id =
					Number(proposalId || 0);

		const workspace =
					jsProposalWorkspaces.get(id);

		const rows =
					id ===
					Number(
						appsmith.store.current_proposal_id || 0
					)
		? jsProposalComponents.effectiveRows()
		: (workspace?.components || []);

		return {
			proposal_id: id,

			menus:
			jsProposalSave.menuPayload(
				rows
			)
		};
	},

	async saveAllDirty() {
		await jsProposalWorkspaces
			.captureCurrentComponents();

		const dirtyIds =
					jsProposalWorkspaces
		.dirtyProposalIds();

		const request = {
			event_id:
			Number(
				appsmith.store.current_event_id || 0
			),

			header:
			jsEventSave
			.headerSnapshotFromPage(),

			proposals:
			dirtyIds.map(id =>
									 this.proposalPayload(id)
									)
		};

		await storeValue(
			"event_document_save_request",
			request
		);

		try {
			const result =
						await qrySaveEventDocument.run();

			if (
				Number(
					result?.[0]?.event_id || 0
				) <= 0
			) {
				showAlert(
					"Event and Proposals were not saved.",
					"error"
				);

				return false;
			}

			return true;
		} finally {
			await removeValue(
				"event_document_save_request"
			);
		}
	},
};