export default {
	async loadSelectedProposal() {
		const proposalId = Number(
			appsmith.store.current_proposal_id || 0
		);

		if (proposalId === 0) {
			await qryGetSelectedProposal.clear();
			await qryGetSelectedProposalMenus.clear();
			return null;
		}

		await qryGetSelectedProposal.run();

		try {
			await qryGetSelectedProposalMenus.run();

			await jsProposalWorkspaces
				.initializeCurrentDraft();
		} catch (error) {
			await qryGetSelectedProposalMenus.clear();

			showAlert(
				"Proposal header loaded, but Proposal menus failed to load.",
				"warning"
			);
		}

		await Promise.all([
			qryGetEvtContacts.run(),
			qryGetEvtVenueContacts.run()
		]);

		await Promise.all([
			resetWidget("inpEvtName", true),
			resetWidget("datEvtDate", true),
			resetWidget("inpTotalGuests", true),
			resetWidget("inpEvtRef", true),
			resetWidget("selEvtFormat", true),
			resetWidget("selEvtCustomer", true),
			resetWidget("msEvtContacts", true),
			resetWidget("selEvtVenue", true),
			resetWidget("msEvtVenueContacts", true),
			resetWidget("rteEvtCustomerNotes", true),
			resetWidget("rteEvtInternalNotes", true)
		]);

		return qryGetSelectedProposal.data?.[0] ?? null;
	},

	async initialize(usePriority = false) {
		await qryGetProposalsForEvent.run();

		const rows =
					qryGetProposalsForEvent.data || [];

		if (rows.length === 0) {
			await removeValue("current_proposal_id");
			await qryGetSelectedProposal.clear();
			await qryGetSelectedProposalMenus.clear();
			return null;
		}

		const currentId = Number(
			appsmith.store.current_proposal_id || 0
		);

		const currentStillExists =
					rows.some(
						row => Number(row.id) === currentId
					);

		const proposalId =
					usePriority || !currentStillExists
		? Number(rows[0].id)
		: currentId;

		await storeValue(
			"current_proposal_id",
			proposalId
		);

		return await this.loadSelectedProposal();
	},

	async selectProposal(row) {
		if (!row?.id) {
			showAlert(
				"Select a Proposal.",
				"warning"
			);
			return null;
		}

		/*
	 * Preserve the currently displayed Proposal
	 * before changing Proposal identity.
	 */
		await jsProposalWorkspaces
			.captureCurrentDraft();

		await storeValue(
			"current_proposal_id",
			Number(row.id)
		);

		return await this.loadSelectedProposal();
	},

	async clearSelection() {
		await removeValue("current_proposal_id");
		await qryGetSelectedProposal.clear();
		await qryGetSelectedProposalMenus.clear();
		return null;
	}
};