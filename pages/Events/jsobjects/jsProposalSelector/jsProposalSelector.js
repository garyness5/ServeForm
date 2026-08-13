export default {
	async clearSelection() {
		await removeValue(
			"current_proposal_id"
		);

		await removeValue(
			"proposal_loading"
		);

		await resetWidget(
			"tblEvtComponents",
			true
		);

		return true;
	},

	async loadSelectedProposal() {
		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		if (!proposalId) {
			return null;
		}

		await storeValue(
			"proposal_loading",
			true
		);

		try {
			await qryGetSelectedProposal.run();

			const loadedId =
						Number(
							qryGetSelectedProposal
							.data?.[0]?.id || 0
						);

			if (
				loadedId !== proposalId
			) {
				throw new Error(
					"Selected Proposal could not be loaded."
				);
			}

			await qryGetSelectedProposalMenus.run();

			await jsProposalWorkspaces
				.initializeCurrentDraft();

			await resetWidget(
				"tblEvtComponents",
				true
			);

			return (
				qryGetSelectedProposal
				.data?.[0] ||
				null
			);
		} catch (error) {
			await this.clearSelection();

			showAlert(
				error?.message ||
				"Proposal could not be loaded.",
				"error"
			);

			return null;
		} finally {
			await removeValue(
				"proposal_loading"
			);
		}
	},

	async selectProposal(row) {
		const newProposalId =
					Number(
						row?.id || 0
					);

		if (!newProposalId) {
			return null;
		}

		/*
	 * Proposal Working State already owns
	 * all unsaved edits.
	 */
		await storeValue(
			"proposal_loading",
			true
		);

		await storeValue(
			"current_proposal_id",
			newProposalId
		);

		return await this
			.loadSelectedProposal();
	}
};