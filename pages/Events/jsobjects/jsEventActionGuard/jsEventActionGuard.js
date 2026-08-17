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
		const id =
					Number(proposalId || 0);

		const row =
					(
						qryGetProposalsForEvent.data || []
					).find(item =>
								 Number(item.id || 0) === id
								);

		if (row?.proposal_no != null) {
			return `Proposal ${row.proposal_no}`;
		}

		const workspace =
					jsProposalWorkspaces.get(id);

		if (
			id < 0 &&
			workspace?.temp_proposal_no != null
		) {
			return `Draft ${workspace.temp_proposal_no}`;
		}

		return "New Proposal";
	},

	actionTitle(action) {
		switch (action) {
			case "save":
				return "Proposals: Unsaved Changes";

			case "duplicate":
				return "Duplicate Event";

			case "close":
				return "Close Event";

			case "delete":
				return "Delete Event";

			default:
				return "Proposals: Unsaved Changes";
		}
	},

	actionMessage(action, state) {
		const proposalIds =
					state?.proposal_ids || [];

		const proposalList =
					proposalIds
		.map(id =>
				 `• ${this.proposalLabel(id)}`
				)
		.join("\n");

		const parts = [
			"This Event has unsaved changes.",
			"",
			"Save All — save all Event and Proposal changes, then continue.",
			"Discard — discard all unsaved changes and revert to the last saved state, then continue.",
			"Cancel — return without doing anything."
		];

		if (proposalIds.length) {
			parts.push(
				"",
				`Unsaved Proposals (${proposalIds.length}):`,
				proposalList
			);
		}

		return parts.join("\n");
	},

	async request(action) {
		await jsEventWorkspace.capture();

		if (action === "duplicate") {
			const staged =
						await jsEventActions
			.stageDuplicateSnapshot();

			if (!staged) {
				return false;
			}
		}

		const state =
					await this.dirtyState();

		/*
	 * SAVE:
	 * Event-only dirty = save directly.
	 * Dirty Proposals = warn because Save becomes Save All.
	 */
		if (action === "save") {
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
						state
					)
				);

				showModal(
					"mdlEvtUnsavedChanges"
				);

				return false;
			}

			return await jsEventSave.saveEvent();
		}

		/*
	 * Other Event actions:
	 * warn for Event OR Proposal dirty state.
	 */
		if (
			state.event_dirty ||
			state.proposal_ids.length
		) {
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
					state
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

			case "duplicate":
				return await jsEventActions
					.openStagedDuplicate();

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
					appsmith.store.pendingEventAction || null;

		if (!action) {
			return false;
		}

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
		 * If this was a new Event,
		 * saveAllDirty() now returned its real ID.
		 */
			const savedEventId =
						Number(
							saveResult.event_id || 0
						);

			if (
				savedEventId > 0 &&
				Number(
					appsmith.store.current_event_id || 0
				) <= 0
			) {
				await storeValue(
					"current_event_id",
					savedEventId
				);
			}

			/*
		 * Resolve current temporary Proposal.
		 */
			if (currentProposalId < 0) {
				const mappedId =
							Number(
								idMap[
									String(currentProposalId)
								] || 0
							);

				if (mappedId > 0) {
					await storeValue(
						"current_proposal_id",
						mappedId
					);
				}
				else {
					await removeValue(
						"current_proposal_id"
					);
				}
			}

			/*
		 * Reload saved Event truth.
		 */
			await getEvtItemById.run();

			await jsEventWorkspace
				.resetFromSaved();

			await qryGetProposalsForEvent.run();

			const resolvedProposalId =
						Number(
							appsmith.store.current_proposal_id || 0
						);

			/*
		 * Old workspaces are now stale.
		 */
			await removeValue(
				"proposal_workspaces"
			);

			if (resolvedProposalId > 0) {
				await qryGetSelectedProposal.run();
				await qryGetSelectedProposalMenus.run();

				await jsProposalWorkspaces
					.initializeCurrentWorkspace();
			}
			else {
				await removeValue(
					"current_proposal_id"
				);
			}

			await resetWidget(
				"tblEvtComponents",
				true
			);

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
		 * Save button itself ends here.
		 */
			if (action === "save") {
				showAlert(
					"Event and Proposals saved.",
					"success"
				);

				return true;
			}

			/*
		 * Other Event actions continue only
		 * after Save All has completed.
		 */
			return await this.executeWithoutWarning(
				action
			);

		}
		catch (error) {
			showAlert(
				error?.message ||
				"Event and Proposals could not be saved. No changes were saved.",
				"error"
			);

			return false;
		}
	},

	async discardAndContinue() {
		const action =
					appsmith.store.pendingEventAction || null;

		if (!action) {
			return false;
		}

		await this.discardAll();

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

		return await this.executeWithoutWarning(
			action
		);
	},

	async discardAll() {
		/*
	 * Restore Event Working State
	 * to the last saved Event.
	 */
		await jsEventWorkspace
			.resetFromSaved();

		/*
	 * Remove every unsaved Proposal workspace.
	 */
		await removeValue(
			"proposal_workspaces"
		);

		/*
	 * Reload persisted Proposal truth.
	 */
		await qryGetProposalsForEvent.run();

		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		if (proposalId > 0) {
			await qryGetSelectedProposal.run();
			await qryGetSelectedProposalMenus.run();

			await jsProposalWorkspaces
				.initializeCurrentWorkspace();
		}
		else {
			await removeValue(
				"current_proposal_id"
			);
		}

		await resetWidget(
			"tblEvtComponents",
			true
		);

		return true;
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

		await removeValue(
			"event_duplicate_snapshot"
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

			const savedEventId =
						Number(
							row.event_id
						);

			/*
		 * New / duplicated Event:
		 * adopt the real Supabase Event ID
		 * returned by Save-All.
		 */
			if (
				Number(
					appsmith.store.current_event_id || 0
				) <= 0
			) {
				await storeValue(
					"current_event_id",
					savedEventId
				);
			}

			return row;

		} finally {
			await removeValue(
				"event_document_save_request"
			);
		}
	}
};