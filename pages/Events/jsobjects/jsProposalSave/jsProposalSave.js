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
			.initializeCurrentWorkspace();

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

	async saveProposal() {
		const message =
					this.requiredMessage();

		if (message) {
			showAlert(
				message,
				"warning"
			);

			return false;
		}

		/*
	 * Capture the Proposal identity before
	 * the parent Event changes from temporary
	 * to persisted.
	 */
		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		if (!proposalId) {
			showAlert(
				"Proposal was not saved.",
				"error"
			);

			return false;
		}

		const rows =
					jsProposalComponents
		.effectiveRows();

		/*
	 * A Proposal cannot exist in Supabase
	 * until its parent Event has a real ID.
	 *
	 * For a new / duplicated Event:
	 * save only the Event Header/Notes first.
	 *
	 * Other temporary Proposals remain
	 * untouched in proposal_workspaces.
	 */
		if (
			Number(
				appsmith.store.current_event_id || 0
			) <= 0
		) {
			const eventSaved =
						await jsEventSave.saveEvent();

			if (!eventSaved) {
				showAlert(
					"Proposal was not saved because the Event could not be created.",
					"error"
				);

				return false;
			}

			/*
		 * current_event_id now belongs to the
		 * newly created Event.
		 *
		 * Replace stale saved Proposal rows from
		 * the source Event with saved truth for
		 * the new Event.
		 *
		 * Negative temporary Proposal workspaces
		 * remain untouched and continue to appear
		 * through filteredProposals().
		 */
			await qryGetProposalsForEvent.run();
		}

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
	 * Temporary unsaved Proposal.
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
		 * Remove ONLY the temporary workspace
		 * that has just been persisted.
		 *
		 * Every other temporary Proposal remains
		 * exactly as the user left it.
		 */
			await jsProposalWorkspaces
				.discard(
				proposalId
			);

			/*
		 * Current Proposal now uses its real
		 * Supabase identity.
		 */
			await storeValue(
				"current_proposal_id",
				savedId
			);

			/*
		 * Load the newly saved Proposal as its
		 * new Published + Working State.
		 */
			await this.refreshCurrentProposal(
				savedId
			);

			/*
 * Renumber any remaining duplicated
 * temporary Draft labels after this
 * Proposal received its real number.
 */
			await jsProposalWorkspaces
				.renumberTemporaryDrafts();
		}

		showAlert(
			"Proposal saved.",
			"success"
		);

		return true;
	},
};