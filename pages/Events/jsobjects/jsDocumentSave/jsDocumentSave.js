export default {
	async save() {
		/*
		 * Existing Proposal:
		 * regardless of Draft / Issued / Accepted,
		 * save the whole Proposal.
		 */
		if (jsProposalData.hasSelectedProposal()) {
			try {
				const saved =
							await jsProposalSave.saveDraft();

				return saved === true;
			} catch (error) {
				showAlert(
					error?.message ||
					"Proposal could not be saved.",
					"error"
				);

				return false;
			}
		}

		/*
		 * Brand-new Event:
		 * first Save creates Event + Draft 1.
		 * We will normalize this path next.
		 */
		const header =
					jsProposalSave.headerSnapshotFromPage();

		if (!header.event_name) {
			showAlert(
				"Event Name is required.",
				"warning"
			);
			return false;
		}

		if (!header.customer_id) {
			showAlert(
				"Customer is required.",
				"warning"
			);
			return false;
		}

		try {
			const result =
						await createEventDraft.run();

			const row =
						result?.[0] || null;

			const eventId =
						Number(
							row?.event_id || 0
						);

			const proposalId =
						Number(
							row?.proposal_id || 0
						);

			if (!eventId || !proposalId) {
				throw new Error(
					"Event and Draft 1 were created, but their IDs were not returned."
				);
			}

			await storeValue(
				"current_event_id",
				eventId
			);

			await storeValue(
				"current_proposal_id",
				proposalId
			);

			await Promise.all([
				getEvtItemById.run(),
				qryGetProposalsForEvent.run()
			]);

			await jsProposalSelector
				.loadSelectedProposal();

			showAlert(
				"Event saved. Draft 1 created.",
				"success"
			);

			return true;
		} catch (error) {
			showAlert(
				error?.message ||
				"Event could not be saved.",
				"error"
			);

			return false;
		}
	}
};