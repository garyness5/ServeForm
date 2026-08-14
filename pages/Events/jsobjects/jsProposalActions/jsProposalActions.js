export default {
	async setActive(row, active) {
		const proposalId =
					Number(
						row?.id || 0
					);

		if (!proposalId) {
			showAlert(
				"Proposal could not be identified.",
				"warning"
			);

			return false;
		}

		await storeValue(
			"proposal_active_request",
			active === true
		);

		await storeValue(
			"proposal_active_id",
			proposalId
		);

		try {
			await qrySetEvtProposalActive.run();

			await qryGetProposalsForEvent.run();

			if (
				proposalId ===
				Number(
					appsmith.store.current_proposal_id || 0
				)
			) {
				await qryGetSelectedProposal.run();
			}

			return true;

		} finally {
			await removeValue(
				"proposal_active_request"
			);

			await removeValue(
				"proposal_active_id"
			);
		}
	},

	async toggleActive() {
		if (!jsProposalData.hasSelectedProposal()) {
			showAlert(
				"Select a Proposal first.",
				"warning"
			);

			return false;
		}

		const proposal =
					jsProposalData.proposal();

		return await this.setActive(
			proposal,
			proposal.active === false
		);
	},

	filteredProposals() {
		const filter =
					selPropActiveFilter.selectedOptionValue ||
					"All";

		const rows =
					qryGetProposalsForEvent.data || [];

		if (filter === "Active") {
			return rows.filter(row =>
												 row.active !== false
												);
		}

		if (filter === "Inactive") {
			return rows.filter(row =>
												 row.active === false
												);
		}

		return rows;
	},
};