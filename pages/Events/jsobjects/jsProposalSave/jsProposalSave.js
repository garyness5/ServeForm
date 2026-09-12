export default {
	textClean(value) {
		const text =
					String(
						value ?? ""
					).trim();

		return text || null;
	},

	requiredMessage() {
		if (
			!jsProposalData.hasSelectedProposal()
		) {
			return "No Proposal is currently selected.";
		}

		return null;
	},

	menuPayload(rows) {
		return (rows || [])
			.filter(row =>
				jsProposalComponents
					.hasContent(row)
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
			.discard(
				proposalId
			);

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
			this.menuPayload(
				rows
			)
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
							result?.[0]
								?.proposal_id ||
							0
						);

			return savedId > 0
				? savedId
				: null;
		}
		finally {
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
						.get(
							tempProposalId
						);

		if (!workspace) {
			return null;
		}

		const request = {
			proposal_id:
			tempProposalId,

			source_proposal_id:
			Number(
				workspace
					.source_proposal_id ||
				0
			) || null,

			menus:
			this.menuPayload(
				rows
			)
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
							result?.[0]
								?.proposal_id ||
							0
						);

			return savedId > 0
				? savedId
				: null;
		}
		finally {
			await removeValue(
				"proposal_save_request"
			);
		}
	},

	async ensureParentEvent() {
		const existingEventId =
					Number(
						appsmith.store
							.current_event_id ||
						0
					);

		/*
		 * Existing Event:
		 * Proposal Save must not save unrelated
		 * Event Header changes.
		 */
		if (existingEventId > 0) {
			return existingEventId;
		}

		/*
		 * New / duplicated Event:
		 * establish only the parent Event identity
		 * before the Proposal can be persisted.
		 */
		const eventId =
					await jsEventSave
						.ensureEventSavedForProposal();

		if (eventId <= 0) {
			showAlert(
				"Proposal was not saved because the Event could not be created.",
				"error"
			);

			return 0;
		}

		/*
		 * Reload saved Proposal truth for the newly
		 * created Event.
		 *
		 * Other temporary Proposal workspaces remain
		 * untouched.
		 */
		await qryGetProposalsForEvent.run();

		return eventId;
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
		 * Capture the Proposal identity before a
		 * temporary parent Event receives its
		 * persistent identity.
		 */
		const proposalId =
					Number(
						appsmith.store
							.current_proposal_id ||
						0
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
		 * Proposal cannot exist in Supabase until
		 * its parent Event has a real identity.
		 *
		 * This creates only the parent Event when
		 * necessary. It does not perform Event Save.
		 */
		const eventId =
					await this
						.ensureParentEvent();

		if (eventId <= 0) {
			return false;
		}

		let savedId = null;

		/*
		 * Existing persisted Proposal.
		 */
		if (proposalId > 0) {
			savedId =
				await this
					.saveExistingProposal(
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

			await this
				.refreshCurrentProposal(
					savedId
				);
		}

		/*
		 * Temporary never-saved Proposal.
		 */
		else {
			savedId =
				await this
					.saveNewProposal(
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
			 * Remove only the temporary workspace
			 * that has now been persisted.
			 *
			 * Other temporary Proposals remain
			 * exactly as the user left them.
			 */
			await jsProposalWorkspaces
				.discard(
					proposalId
				);

			/*
			 * Current Proposal now uses its real
			 * persistent Supabase identity.
			 */
			await storeValue(
				"current_proposal_id",
				savedId
			);

			/*
			 * Load the saved Proposal as the new
			 * Published + Working State.
			 */
			await this
				.refreshCurrentProposal(
					savedId
				);

			/*
			 * Renumber any remaining temporary
			 * duplicated Draft labels now that this
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
	}
};