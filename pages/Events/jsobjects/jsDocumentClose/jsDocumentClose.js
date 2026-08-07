export default {
	async dirtyState() {
		await jsProposalWorkspaces.captureCurrentDraft();

		return {
			event_dirty:
			jsProposalData.isEventMode() &&
			jsEventSave.isDirty(),

			proposal_ids:
			jsProposalWorkspaces.dirtyProposalIds()
		};
	},

	proposalLabel(proposalId) {
		const row = (
			qryGetProposalsForEvent.data || []
		).find(item =>
					 Number(item.id) === Number(proposalId)
					);

		return row?.proposal_no
			? `Draft ${row.proposal_no}`
		: `Draft ${proposalId}`;
	},

	buildMessage(state) {
		const parts = [];

		if (state.event_dirty) {
			parts.push(
				"The Event has unsaved changes."
			);
		}

		if (state.proposal_ids.length) {
			const labels = state.proposal_ids.map(id =>
																						this.proposalLabel(id)
																					 );

			parts.push(
				[
					"The following Proposals have not been saved:",
					"",
					...labels
				].join("\n")
			);
		}

		parts.push(
			state.event_dirty
			? "You may cancel and save the Event and/or individual Drafts you want to keep."
			: "You may cancel and save the individual Drafts you want to keep."
		);

		parts.push(
			"Click Yes to save all unsaved changes and close.\n" +
			"Click No to discard all unsaved changes and close."
		);

		return parts.join("\n\n");
	},

	async close() {
		const state = await this.dirtyState();

		if (
			state.event_dirty ||
			state.proposal_ids.length
		) {
			await storeValue(
				"pendingEventAction",
				"close"
			);

			await storeValue(
				"evt_unsaved_close_message",
				this.buildMessage(state)
			);

			showModal(
				"mdlEvtUnsavedChangesClose"
			);

			return false;
		}

		navigateTo("EventList");
		return true;
	},

	async saveAndClose() {
		const state = await this.dirtyState();

		if (state.event_dirty) {
			const eventSaved =
						await jsEventSave.saveEvent();

			if (!eventSaved) {
				return false;
			}
		}

		const proposalsSaved =
					await jsProposalSave.saveAllDirty();

		if (!proposalsSaved) {
			return false;
		}

		closeModal(
			"mdlEvtUnsavedChangesClose"
		);

		await removeValue(
			"evt_unsaved_close_message"
		);

		await removeValue(
			"pendingEventAction"
		);

		navigateTo("EventList");
		return true;
	},

	async discardAndClose() {
		closeModal(
			"mdlEvtUnsavedChangesClose"
		);

		await removeValue(
			"evt_components_local_rows"
		);

		await removeValue(
			"proposal_workspaces"
		);

		await removeValue(
			"proposal_save_request"
		);

		await removeValue(
			"evt_unsaved_close_message"
		);

		await removeValue(
			"pendingEventAction"
		);

		navigateTo("EventList");
		return true;
	},

	async cancel() {
		await removeValue(
			"pendingEventAction"
		);

		await removeValue(
			"evt_unsaved_close_message"
		);

		closeModal(
			"mdlEvtUnsavedChangesClose"
		);

		return true;
	}
};