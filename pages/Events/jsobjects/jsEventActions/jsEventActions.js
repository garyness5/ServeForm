export default {
	copyName(baseName) {
		const name =
					String(
						baseName || "Event"
					).trim();

		const existingNames =
					(
						qryGetEventNames.data ||
						[]
					)
		.map(row =>
				 String(
			row.name || ""
		).trim()
				)
		.filter(Boolean);

		const normalized =
					existingNames.map(name =>
														name.toLowerCase()
													 );

		let candidate =
				`${name} Copy`;

		let counter = 2;

		while (
			normalized.includes(
				candidate.toLowerCase()
			)
		) {
			candidate =
				`${name} Copy ${counter}`;

			counter += 1;
		}

		return candidate;
	},

	deepCopy(value) {
		return JSON.parse(
			JSON.stringify(value)
		);
	},

	meaningfulComponents(rows) {
		return (rows || [])
			.filter(row =>
							Number(
			row?.menu_id || 0
		) > 0 ||
							String(
			row?.menu_name || ""
		).trim()
						 );
	},

	async buildDuplicateSnapshot() {
		const sourceEventId =
					Number(
						appsmith.store.current_event_id || 0
					);

		if (!sourceEventId) {
			showAlert(
				"There is no saved Event to duplicate.",
				"warning"
			);

			return null;
		}

		/*
		 * Capture the LIVE Event Header.
		 */
		const liveHeader =
					jsEventWorkspace.current();

		await Promise.all([
			qryGetAllProposalMenusForEvent.run(),
			qryGetEventNames.run()
		]);

		const proposalRows =
					qryGetProposalsForEvent.data || [];

		const menuRows =
					qryGetAllProposalMenusForEvent.data || [];

		const currentProposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		/*
		 * Only persisted Proposals are candidates.
		 *
		 * Never-saved temporary Proposals are not
		 * in qryGetProposalsForEvent and therefore
		 * are intentionally excluded.
		 */
		const proposalCopies =
					proposalRows
		.map(proposal => {
			const proposalId =
						Number(
							proposal.id || 0
						);

			const workspace =
						jsProposalWorkspaces.get(
							proposalId
						);

			let components = [];

			/*
				 * Current Proposal:
				 * use exactly what is on screen.
				 */
			if (
				proposalId ===
				currentProposalId &&
				jsProposalData
				.hasSelectedProposal()
			) {
				components =
					jsProposalComponents
					.effectiveRows();
			}

			/*
				 * Previously visited Proposal:
				 * use its preserved Working State.
				 */
			else if (
				workspace &&
				Array.isArray(
					workspace.components
				)
			) {
				components =
					workspace.components;
			}

			/*
				 * Untouched Proposal:
				 * use saved database truth.
				 */
			else {
				components =
					menuRows.filter(row =>
													Number(
					row.proposal_id || 0
				) ===
													proposalId
												 );
			}

			return {
				proposalId,

				components:
				this.meaningfulComponents(
					components
				)
			};
		})

		/*
			 * A Proposal that is blank in the
			 * current live state is not copied.
			 */
		.filter(item =>
						item.components.length > 0
					 )

		.map((item, index) => ({
			temp_proposal_no:
			index + 1,

			source_proposal_id:
			null,

			components:
			this.deepCopy(
				item.components
			)
		}));

		return {
			source_event_id:
			sourceEventId,

			header: {
				...this.deepCopy(
					liveHeader
				),

				event_id:
				0,

				name:
				this.copyName(
					liveHeader.name
				),

				event_ref:
				null,

				status:
				"Draft",

				active:
				true,

				closed_at:
				null,

				closed_proposal_id:
				null
			},

			proposals:
			proposalCopies
		};
	},

	async stageDuplicateSnapshot() {
		const snapshot =
					await this.buildDuplicateSnapshot();

		if (!snapshot) {
			return false;
		}

		await storeValue(
			"event_duplicate_snapshot",
			snapshot
		);

		return true;
	},

	async openStagedDuplicate() {
		const snapshot =
					appsmith.store
		.event_duplicate_snapshot ||
					null;

		if (!snapshot) {
			showAlert(
				"Duplicate workspace could not be created.",
				"error"
			);

			return false;
		}

		/*
		 * Leave the source Event workspace.
		 */
		await removeValue(
			"current_proposal_id"
		);

		await removeValue(
			"proposal_workspaces"
		);

		/*
		 * Duplicate exists only in Appsmith
		 * until the user clicks Save.
		 */
		await storeValue(
			"current_event_id",
			0
		);

		await jsEventWorkspace.set(
			snapshot.header
		);

		const createdIds =
					await jsProposalWorkspaces
		.createTemporaryBatch(
			snapshot.proposals || []
		);

		await removeValue(
			"event_duplicate_snapshot"
		);

		await resetWidget(
			"tblEvtComponents",
			true
		);

		showAlert(
			"Event duplicated. Save to create it.",
			"success"
		);

		return {
			proposal_ids:
			createdIds
		};
	},

	async duplicateWorkingCopy() {
		const staged =
					await this.stageDuplicateSnapshot();

		if (!staged) {
			return false;
		}

		return await this
			.openStagedDuplicate();
	},

	async addNewEvent() {
		await storeValue(
			"event_name_mode",
			"add"
		);

		await resetWidget(
			"inpEvtRenameName",
			true
		);

		showModal(
			"mdlEvtRename"
		);

		return true;
	},

	async cancelEventName() {
		await resetWidget(
			"inpEvtRenameName",
			true
		);

		await removeValue(
			"event_name_mode"
		);

		closeModal(
			"mdlEvtRename"
		);

		return true;
	},
};