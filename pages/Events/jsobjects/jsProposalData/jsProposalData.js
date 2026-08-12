export default {
	hasSelectedProposal() {
		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		const loadedProposalId =
					Number(
						qryGetSelectedProposal.data?.[0]?.id || 0
					);

		return (
			proposalId > 0 &&
			loadedProposalId === proposalId
		);
	},

	proposal() {
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

	isProposalDraft() {
		return (
			this.hasSelectedProposal() &&
			this.proposal().proposal_status === "Draft"
		);
	},

	isProposalLocked() {
		return false;
	},

	canEditDisplayedDocument() {
		return true;
	},

	proposalControl() {
		const r =
					this.proposal();

		return {
			id:
			r.id ?? null,

			status:
			r.proposal_status ?? null,

			active:
			r.active === false
			? false
			: true,

			editable:
			true,

			closed:
			r.is_closed === true,

			reference:
			r.proposal_number ||
			(
				r.proposal_no
				? `Proposal ${r.proposal_no}`
				: ""
			)
		};
	}
};