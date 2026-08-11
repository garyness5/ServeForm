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
		await Promise.all([
			qryGetSelectedProposal.run(),
			qryGetSelectedProposalMenus.run(),
			qryGetProposalsForEvent.run()
		]);

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

		/*
	 * Capture exactly what is currently visible,
	 * including tblEvtComponents.updatedRows.
	 */
		const rows =
					jsProposalComponents.effectiveRows();

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
	},

	async saveWorkspace(proposalId) {
		const id =
					Number(proposalId || 0);

		if (!id) {
			return false;
		}

		if (
			id !==
			Number(
				appsmith.store.current_proposal_id || 0
			)
		) {
			showAlert(
				"Only the currently selected Proposal can be saved.",
				"warning"
			);

			return false;
		}

		return await this.saveDraft();
	},

	async saveAllDirty() {
		if (
			!jsProposalWorkspaces.isDirty()
		) {
			return true;
		}

		return await this.saveDraft();
	}
};