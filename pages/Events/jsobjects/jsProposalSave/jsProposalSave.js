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
		/*
		 * Proposal reload is deliberately sequential.
		 * One owner, one load path.
		 */
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
				showAlert(
					"Proposal was not saved.",
					"error"
				);

				return false;
			}
		} finally {
			await removeValue(
				"proposal_save_request"
			);
		}

		await this.refreshCurrentProposal(
			proposalId
		);

		showAlert(
			"Proposal saved.",
			"success"
		);

		return true;
	}
};