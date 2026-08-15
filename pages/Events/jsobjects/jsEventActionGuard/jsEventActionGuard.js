export default {
	async dirtyState() {
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

	proposalIdMap(resultRow) {
		const raw =
					resultRow?.proposal_id_map;

		if (!raw) {
			return {};
		}

		if (
			typeof raw === "object" &&
			!Array.isArray(raw)
		) {
			return raw;
		}

		if (typeof raw === "string") {
			try {
				return JSON.parse(raw);
			} catch (error) {
				return {};
			}
		}

		return {};
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
				const currentProposalId =
							Number(
								appsmith.store.current_proposal_id || 0
							);

				const saveResult =
							await this.saveAllDirty();

				if (!saveResult) {
					return false;
				}

				const idMap =
							this.proposalIdMap(
								saveResult
							);

				/*
				 * Resolve the currently displayed
				 * temporary Proposal.
				 *
				 * Meaningful temp:
				 *     negative ID -> new real ID
				 *
				 * Empty temp:
				 *     not saved -> remove selection
				 */
				if (currentProposalId < 0) {
					const mappedId =
								Number(
									idMap[
										String(
											currentProposalId
										)
									] || 0
								);

					if (mappedId > 0) {
						await storeValue(
							"current_proposal_id",
							mappedId
						);
					} else {
						await removeValue(
							"current_proposal_id"
						);
					}
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
				 * Reload Event Published State.
				 */
				await getEvtItemById.run();

				await jsEventWorkspace
					.resetFromSaved();

				/*
				 * Refresh Proposal selector first.
				 */
				await qryGetProposalsForEvent.run();

				const resolvedProposalId =
							Number(
								appsmith.store.current_proposal_id || 0
							);

				/*
				 * All old Proposal Working State is
				 * now stale.
				 *
				 * This also silently removes any
				 * never-saved empty temporary Proposal.
				 */
				await removeValue(
					"proposal_workspaces"
				);

				/*
				 * Reload the current Proposal only
				 * if it now has a real persisted ID.
				 */
				if (resolvedProposalId > 0) {
					await qryGetSelectedProposal.run();

					await qryGetSelectedProposalMenus.run();

					await jsProposalWorkspaces
						.initializeCurrentDraft();
				} else {
					await removeValue(
						"current_proposal_id"
					);
				}

				await resetWidget(
					"tblEvtComponents",
					true
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

	async saveAllDirty() {
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

			const row =
						result?.[0] || null;

			if (
				Number(
					row?.event_id || 0
				) <= 0
			) {
				showAlert(
					"Event and Proposals were not saved.",
					"error"
				);

				return null;
			}

			return row;

		} finally {
			await removeValue(
				"event_document_save_request"
			);
		}
	}
};