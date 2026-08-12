export default {
	async loadSelectedProposal() {
		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		if (!proposalId) {
			return null;
		}

		/*
		 * Load the selected Proposal sequentially.
		 * Do not run overlapping Proposal queries.
		 */
		await qryGetSelectedProposal.run();

		await qryGetSelectedProposalMenus.run();

		await jsProposalWorkspaces
			.initializeCurrentDraft();

		await Promise.all([
			qryGetEvtContacts.run(),
			qryGetEvtVenueContacts.run()
		]);

		return (
			qryGetSelectedProposal.data?.[0] ??
			null
		);
	},

	async initialize(usePriority = false) {
		await qryGetProposalsForEvent.run();

		const rows =
					qryGetProposalsForEvent.data || [];

		if (!rows.length) {
			await removeValue(
				"current_proposal_id"
			);

			return null;
		}

		const currentId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		const currentStillExists =
					rows.some(
						row =>
						Number(row.id) === currentId
					);

		const proposalId =
					usePriority ||
					!currentStillExists
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

		const newProposalId =
					Number(row.id);

		const currentProposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		if (
			newProposalId ===
			currentProposalId
		) {
			return true;
		}

		/*
		 * Preserve unsaved work from the Proposal
		 * currently on screen.
		 */
		if (currentProposalId > 0) {
			await jsProposalWorkspaces
				.captureCurrentComponents();
		}

		await storeValue(
			"current_proposal_id",
			newProposalId
		);

		return await this.loadSelectedProposal();
	},

	async clearSelection() {
		await removeValue(
			"current_proposal_id"
		);

		return true;
	}
};