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
		} catch (error) {
			await qryGetSelectedProposalMenus.clear();

			showAlert(
				"Proposal header loaded, but Proposal menus failed to load.",
				"warning"
			);
		}

		await Promise.all([
			resetWidget("inpEvtName", true),
			resetWidget("datEvtDate", true),
			resetWidget("inpTotalGuests", true),
			resetWidget("inpEvtRef", true),
			resetWidget("selEvtFormat", true),
			resetWidget("rteEvtNotes", true)
		]);

		return qryGetSelectedProposal.data?.[0] ?? null;
	},

	async initialize() {
		await qryGetProposalsForEvent.run();

		const rows = qryGetProposalsForEvent.data ?? [];

		if (rows.length === 0) {
			await removeValue("current_proposal_id");
			await qryGetSelectedProposal.clear();
			await qryGetSelectedProposalMenus.clear();
			return null;
		}

		await storeValue(
			"current_proposal_id",
			Number(rows[0].id)
		);

		return await this.loadSelectedProposal();
	},

	async selectProposal(row) {
		if (!row?.id) {
			showAlert("Select a Proposal.", "warning");
			return null;
		}

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