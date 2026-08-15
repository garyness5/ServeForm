export default {
	textClean(value) {
		const text = String(value ?? "").trim();
		return text || null;
	},

	requiredMessage() {
		if (!jsProposalData.hasSelectedProposal()) {
			return "No Proposal is currently selected.";
		}

		return null;
	},

	menuPayload(rows) {
		return (rows || [])
			.filter(row =>
							jsProposalComponents.hasContent(row)
						 )
			.map((row, index) => {
			const derived =
						jsProposalComponents
			.refreshDerivedFields(row);

			return {
				line_no:
				index + 1,

				menu_id:
				Number(
					derived.menu_id || 0
				) || null,

				category_id:
				Number(
					derived.category_id || 0
				) || null,

				category_name:
				this.textClean(
					derived.category_name
				),

				menu_name:
				this.textClean(
					derived.current_menu_name ||
					derived.menu_name
				),

				guests:
				derived.guests == null
				? null
				: Number(
					derived.guests
				),

				extra_guests:
				derived.extra_guests == null
				? 0
				: Number(
					derived.extra_guests
				),

				allergen_names:
				this.textClean(
					derived.allergen_names
				),

				diet_tag_names:
				this.textClean(
					derived.diet_tag_names
				),

				notes:
				this.textClean(
					derived.notes
				),

				active:
				derived.active === false
				? false
				: true
			};
		});
	},

	async refreshCurrentProposal(
		proposalId
	) {
		await qryGetSelectedProposal.run();

		await qryGetSelectedProposalMenus.run();

		await qryGetProposalsForEvent.run();

		await jsProposalWorkspaces
			.discard(proposalId);

		await jsProposalWorkspaces
			.initializeCurrentDraft();

		await resetWidget(
			"tblEvtComponents",
			true
		);

		return true;
	},

	async saveExistingProposal(
		proposalId,
		rows
	) {
		const request = {
			proposal_id:
			proposalId,

			menus:
			this.menuPayload(rows)
		};

		await storeValue(
			"proposal_save_request",
			request
		);

		try {
			const result =
						await qrySaveEventProposal.run();

			const savedId =
						Number(
							result?.[0]?.proposal_id || 0
						);

			if (!savedId) {
				return null;
			}

			return savedId;

		} finally {
			await removeValue(
				"proposal_save_request"
			);
		}
	},

	async saveNewProposal(
		tempProposalId,
		rows
	) {
		const workspace =
					jsProposalWorkspaces
		.get(tempProposalId);

		if (!workspace) {
			return null;
		}

		const request = {
			proposal_id:
			tempProposalId,

			source_proposal_id:
			Number(
				workspace.source_proposal_id || 0
			) || null,

			menus:
			this.menuPayload(rows)
		};

		await storeValue(
			"proposal_save_request",
			request
		);

		try {
			const result =
						await qrySaveNewEventProposal.run();

			const savedId =
						Number(
							result?.[0]?.proposal_id || 0
						);

			if (!savedId) {
				return null;
			}

			return savedId;

		} finally {
			await removeValue(
				"proposal_save_request"
			);
		}
	},

	async saveDraft() {
		const message =
					this.requiredMessage();

		if (message) {
			showAlert(
				message,
				"warning"
			);

			return false;
		}

		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		const rows =
					jsProposalComponents
		.effectiveRows();

		let savedId = null;

		/*
		 * Existing persisted Proposal.
		 */
		if (proposalId > 0) {
			savedId =
				await this.saveExistingProposal(
				proposalId,
				rows
			);

			if (!savedId) {
				showAlert(
					"Proposal was not saved.",
					"error"
				);

				return false;
			}

			await this.refreshCurrentProposal(
				savedId
			);
		}

		/*
		 * New unsaved Proposal workspace.
		 */
		else if (proposalId < 0) {
			savedId =
				await this.saveNewProposal(
				proposalId,
				rows
			);

			if (!savedId) {
				showAlert(
					"Proposal was not saved.",
					"error"
				);

				return false;
			}

			/*
			 * Remove the temporary workspace.
			 */
			await jsProposalWorkspaces
				.discard(
				proposalId
			);

			/*
			 * Replace temporary identity with the
			 * new real Supabase Proposal ID.
			 */
			await storeValue(
				"current_proposal_id",
				savedId
			);

			/*
			 * Load the newly saved Proposal as the
			 * new Published State + Working State.
			 */
			await this.refreshCurrentProposal(
				savedId
			);
		}

		else {
			showAlert(
				"Proposal was not saved.",
				"error"
			);

			return false;
		}

		showAlert(
			"Proposal saved.",
			"success"
		);

		return true;
	}
};