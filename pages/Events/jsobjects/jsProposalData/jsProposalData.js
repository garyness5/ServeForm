export default {
	hasSelectedProposal() {
		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		if (!proposalId) {
			return false;
		}

		/*
	 * Appsmith-only unsaved Proposal.
	 */
		if (proposalId < 0) {
			return (
				jsProposalWorkspaces
				.get(proposalId)
				?.is_new === true
			);
		}

		const loadedProposalId =
					Number(
						qryGetSelectedProposal
						.data?.[0]?.id || 0
					);

		return (
			proposalId > 0 &&
			loadedProposalId === proposalId
		);
	},

	proposal() {
		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		if (
			proposalId < 0 &&
			jsProposalWorkspaces
			.get(proposalId)
			?.is_new === true
		) {
			const workspace =
						jsProposalWorkspaces
			.get(proposalId);

			return {
				id:
				proposalId,

				event_id:
				Number(
					appsmith.store.current_event_id || 0
				),

				proposal_no:
				null,

				proposal_number:
				null,

				proposal_status:
				"Draft",

				temp_proposal_no:
				workspace?.temp_proposal_no ??
				null,

				active:
				true,

				is_new:
				true,

				source_proposal_id:
				workspace
				?.source_proposal_id ??
				null,

				is_closed:
				false,

				is_editable:
				true
			};
		}

		return (
			qryGetSelectedProposal.data?.[0] ??
			{}
		);
	},

	proposalMode() {
		return this.hasSelectedProposal()
			? "proposal"
		: "event";
	},

	isEventMode() {
		return (
			this.proposalMode() === "event"
		);
	},

	referenceDisplay(row) {
		if (!row) {
			return "";
		}

		const proposalId =
					Number(
						row.id || 0
					);

		const isDirty =
					proposalId !== 0 &&
					jsProposalWorkspaces
		.isDirty(proposalId);

		let reference = "";

		if (row.is_new === true) {
			reference =
				row.temp_proposal_no != null
				? `Draft ${row.temp_proposal_no}`
			: "New Proposal";
		}
		else if (row.proposal_number) {
			reference =
				row.proposal_number;
		}
		else if (row.proposal_no != null) {
			reference =
				`Draft ${row.proposal_no}`;
		}

		return isDirty
			? `• ${reference}`
		: reference;
	},
};