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

		const savedRows =
					[
						...(qryGetProposalsForEvent.data || [])
					];

		const temporaryRows =
					Object.keys(
						jsProposalWorkspaces.all()
					)
		.map(Number)
		.filter(id =>
						id < 0
					 )
		.map(id => {
			const workspace =
						jsProposalWorkspaces.get(id);

			return {
				id:
				id,

				event_id:
				Number(
					appsmith.store.current_event_id || 0
				),

				proposal_no:
				null,

				proposal_number:
				null,

				proposal_status:
				null,

				active:
				true,

				is_new:
				true,

				source_proposal_id:
				workspace?.source_proposal_id ??
				null,

				proposal_title:
				"New Proposal"
			};
		});

		let rows = [
			...savedRows,
			...temporaryRows
		];

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


	selectedRowIndex() {
		const currentId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		const rows =
					this.filteredProposals();

		const index =
					rows.findIndex(row =>
												 Number(row.id || 0) === currentId
												);

		return Math.max(
			0,
			index
		);
	},

	async addNew() {
		const tempId =
					await jsProposalWorkspaces
		.createTemporary(
			[],
			null
		);

		await resetWidget(
			"tblEvtComponents",
			true
		);

		return tempId;
	},

	async duplicateCurrent() {
		if (!jsProposalData.hasSelectedProposal()) {
			showAlert(
				"Select a Proposal first.",
				"warning"
			);

			return false;
		}

		const sourceProposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		const currentRows =
					jsProposalComponents
		.effectiveRows();

		/*
	 * Duplicate creates a new unsaved workspace
	 * from exactly what is currently in front
	 * of the user.
	 *
	 * The source workspace is preserved unchanged,
	 * including any unsaved work.
	 */
		const tempId =
					await jsProposalWorkspaces
		.createTemporary(
			currentRows,
			sourceProposalId > 0
			? sourceProposalId
			: null
		);

		await resetWidget(
			"tblEvtComponents",
			true
		);

		return tempId;
	},

	async deleteCurrent() {
		if (!jsProposalData.hasSelectedProposal()) {
			showAlert(
				"Select a Proposal first.",
				"warning"
			);

			return false;
		}

		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		/*
	 * Unsaved temporary Proposal.
	 * Nothing exists in Supabase.
	 */
		if (proposalId < 0) {
			await jsProposalWorkspaces
				.discard(proposalId);

			await removeValue(
				"current_proposal_id"
			);

			await resetWidget(
				"tblEvtComponents",
				true
			);

			return true;
		}

		await storeValue(
			"proposal_delete_id",
			proposalId
		);

		try {
			const result =
						await qryDeleteEventProposal.run();

			const row =
						result?.[0] || null;

			if (!row) {
				showAlert(
					"Proposal was not deleted.",
					"error"
				);

				return false;
			}

			await jsProposalWorkspaces
				.discard(proposalId);

			await removeValue(
				"current_proposal_id"
			);

			await qryGetProposalsForEvent.run();

			await resetWidget(
				"tblEvtComponents",
				true
			);

			return true;

		} finally {
			await removeValue(
				"proposal_delete_id"
			);
		}
	},

	selectedProposalIndex() {
		const currentId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		const rows =
					this.filteredProposals();

		return Math.max(
			0,
			rows.findIndex(row =>
										 Number(row.id || 0) === currentId
										)
		);
	},

	async discardCurrent() {
		if (!jsProposalData.hasSelectedProposal()) {
			return false;
		}

		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		/*
	 * Unsaved temporary Proposal:
	 * remove the workspace completely.
	 */
		if (proposalId < 0) {
			await jsProposalWorkspaces
				.discard(proposalId);

			await removeValue(
				"current_proposal_id"
			);

			await resetWidget(
				"tblEvtComponents",
				true
			);

			return true;
		}

		/*
	 * Saved Proposal:
	 * discard dirty Working State and
	 * rebuild it from Published State.
	 */
		await jsProposalWorkspaces
			.discard(proposalId);

		await jsProposalSelector
			.loadSelectedProposal();

		return true;
	},

	async setAccepted(accepted) {
		if (!jsProposalData.hasSelectedProposal()) {
			return false;
		}

		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		/*
	 * Workflow status requires a real,
	 * persisted Proposal.
	 */
		if (proposalId <= 0) {
			showAlert(
				"Save the Proposal before accepting it.",
				"warning"
			);

			return false;
		}

		const proposal =
					jsProposalData.proposal();

		const newStatus =
					accepted === true
		? "Accepted"
		: proposal.was_issued === true ||
					proposal.sent_at != null
		? "Issued"
		: "Draft";

		await storeValue(
			"proposal_status_id",
			proposalId
		);

		await storeValue(
			"proposal_status_request",
			newStatus
		);

		try {
			await qrySetEvtProposalStatus.run();

			await qryGetProposalsForEvent.run();
			await qryGetSelectedProposal.run();

			return true;

		} finally {
			await removeValue(
				"proposal_status_id"
			);

			await removeValue(
				"proposal_status_request"
			);
		}
	},
};