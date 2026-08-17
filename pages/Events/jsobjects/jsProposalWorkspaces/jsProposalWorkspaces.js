export default {
	all() {
		return appsmith.store.proposal_workspaces || {};
	},

	currentProposalId() {
		return Number(
			appsmith.store.current_proposal_id || 0
		);
	},

	get(
		proposalId = this.currentProposalId()
	) {
		return (
			this.all()[String(proposalId)] ||
			null
		);
	},

	async saveAll(workspaces) {
		await storeValue(
			"proposal_workspaces",
			workspaces || {}
		);

		return workspaces || {};
	},

	async set(
		proposalId,
		workspace
	) {
		const id =
					Number(proposalId || 0);

		if (!id) {
			return null;
		}

		const workspaces = {
			...this.all(),

			[String(id)]: {
				...(this.get(id) || {}),
				...workspace,
				proposal_id: id
			}
		};

		await this.saveAll(workspaces);

		return workspaces[String(id)];
	},

	deepCopy(value) {
		return JSON.parse(
			JSON.stringify(value)
		);
	},

	componentsFromQuery() {
		return jsProposalComponents
			.normalizeRows(
			jsProposalComponents.queryRows()
		);
	},

	normalizeComponents(rows) {
		return (rows || [])
			.filter(row =>
							Number(row?.menu_id || 0) > 0 ||
							String(row?.menu_name || "").trim()
						 )
			.map((row, index) => ({
			line_no:
			index + 1,

			menu_id:
			Number(
				row.menu_id || 0
			) || null,

			guests:
			row.guests === "" ||
			row.guests === null ||
			row.guests === undefined
			? null
			: Number(row.guests),

			extra_guests:
			row.extra_guests === "" ||
			row.extra_guests === null ||
			row.extra_guests === undefined
			? 0
			: Number(row.extra_guests),

			notes:
			String(
				row.notes || ""
			).trim() ||
			null,

			active:
			row.active === false
			? false
			: true
		}));
	},

	workspaceIsDirty(
		proposalId = this.currentProposalId()
	) {
		const workspace =
					this.get(proposalId);

		if (!workspace) {
			return false;
		}

		const current =
					this.normalizeComponents(
						workspace.components
					);

		const saved =
					this.normalizeComponents(
						workspace.saved_components
					);

		return (
			JSON.stringify(current) !==
			JSON.stringify(saved)
		);
	},

	async initializeCurrentDraft() {
		if (
			!jsProposalData.hasSelectedProposal()
		) {
			return null;
		}

		const proposalId =
					this.currentProposalId();

		const existing =
					this.get(proposalId);

		/*
	 * If this Proposal already has genuine
	 * unsaved work, preserve it.
	 */
		if (
			existing &&
			this.workspaceIsDirty(
				proposalId
			)
		) {
			return existing;
		}

		/*
	 * Otherwise freshly loaded database truth wins.
	 */
		const queryComponents =
					this.componentsFromQuery();

		const queryUpdatedAt =
					qryGetSelectedProposal
		.data?.[0]
		?.updated_at ||
					null;

		return await this.set(
			proposalId,
			{
				components:
				queryComponents,

				saved_components:
				this.deepCopy(
					queryComponents
				),

				saved_updated_at:
				queryUpdatedAt
			}
		);
	},

	/*
	 * Temporary caller compatibility while
	 * Proposal header ownership is being removed.
	 * This no longer initializes any header state.
	 */

	async setCurrentComponents(rows) {
		if (
			!jsProposalData.hasSelectedProposal()
		) {
			return null;
		}

		const proposalId =
					this.currentProposalId();

		const existing =
					this.get(proposalId) || {};

		return await this.set(
			proposalId,
			{
				...existing,

				components:
				jsProposalComponents
				.normalizeRows(rows)
			}
		);
	},

	/*
	 * Event header is no longer Proposal-owned.
	 * Kept only until remaining callers are removed.
	 */

	isDirty(
		proposalId = this.currentProposalId()
	) {
		const workspace =
					this.get(proposalId);

		if (!workspace) {
			return false;
		}

		const isCurrentProposal =
					Number(proposalId) ===
					this.currentProposalId();

		const currentRows =
					isCurrentProposal
		? jsProposalComponents
		.mergeUpdatedRows()
		: workspace.components;

		const currentComponents =
					this.normalizeComponents(
						currentRows
					);

		const savedComponents =
					this.normalizeComponents(
						workspace.saved_components
					);

		return (
			JSON.stringify(
				currentComponents
			) !==
			JSON.stringify(
				savedComponents
			)
		);
	},

	dirtyProposalIds() {
		return Object.keys(
			this.all()
		)
			.map(Number)
			.filter(id =>
							this.isDirty(id)
						 );
	},

	dirtyProposals() {
		const dirtyIds =
					this.dirtyProposalIds();

		return dirtyIds.map(
			proposalId => {
				const proposal =
							(
								qryGetProposalsForEvent.data ||
								[]
							).find(row =>
										 Number(row.id || 0) ===
										 Number(proposalId)
										);

				return {
					proposal_id:
					Number(proposalId),

					proposal_no:
					proposal?.proposal_no ??
					null,

					status:
					proposal?.proposal_status ||
					"Draft",

					is_dirty:
					true
				};
			}
		);
	},

	dirtyProposalText() {
		return this.dirtyProposals()
			.map(proposal =>
					 proposal.proposal_no != null
					 ? `Proposal ${proposal.proposal_no}`
					 : "Unsaved Proposal"
					)
			.join(", ");
	},

	async markCurrentSaved() {
		const proposalId =
					this.currentProposalId();

		const workspace =
					this.get(proposalId);

		if (!workspace) {
			return null;
		}

		const components =
					jsProposalComponents
		.normalizeRows(
			jsProposalComponents
			.mergeUpdatedRows()
		);

		return await this.set(
			proposalId,
			{
				...workspace,

				components,

				saved_components:
				this.deepCopy(
					components
				),

				saved_updated_at:
				qryGetSelectedProposal
				.data?.[0]
				?.updated_at ||
				null
			}
		);
	},

	async discard(proposalId) {
		const id =
					Number(proposalId || 0);

		const workspaces = {
			...this.all()
		};

		delete workspaces[
			String(id)
		];

		await this.saveAll(
			workspaces
		);

		return true;
	},

	makeTemporaryId() {
		const existingIds =
					Object.keys(
						this.all()
					)
		.map(Number)
		.filter(id => id < 0);

		let tempId =
				-Math.max(
					1,
					Date.now()
				);

		while (
			existingIds.includes(
				tempId
			)
		) {
			tempId -= 1;
		}

		return tempId;
	},

	isTemporary(
		proposalId = this.currentProposalId()
	) {
		return Number(proposalId || 0) < 0;
	},

	async createTemporary(
		components = [],
		sourceProposalId = null
	) {
		const tempId =
					this.makeTemporaryId();

		const normalized =
					jsProposalComponents
		.normalizeRows(
			this.deepCopy(
				components || []
			)
		);

		await this.set(
			tempId,
			{
				proposal_id:
				tempId,

				is_new:
				true,

				source_proposal_id:
				Number(sourceProposalId || 0) ||
				null,

				components:
				normalized,

				/*
			 * A new/duplicated Proposal has never
			 * been saved.
			 *
			 * Empty saved baseline makes meaningful
			 * copied/entered work dirty immediately.
			 */
				saved_components:
				jsProposalComponents
				.normalizeRows([]),

				saved_updated_at:
				null
			}
		);

		await storeValue(
			"current_proposal_id",
			tempId
		);

		return tempId;
	},

	async createTemporaryBatch(
		proposals = []
	) {
		const createdIds = [];

		for (const proposal of proposals) {
			const tempId =
						this.makeTemporaryId();

			const normalized =
						jsProposalComponents
			.normalizeRows(
				this.deepCopy(
					proposal.components || []
				)
			);

			await this.set(
				tempId,
				{
					proposal_id:
					tempId,

					is_new:
					true,

					source_proposal_id:
					Number(
						proposal.source_proposal_id || 0
					) || null,

					/*
				 * Used only for displaying
				 * Draft 1, Draft 2, etc.
				 * while this duplicated Event
				 * still exists only in Working State.
				 */
					temp_proposal_no:
					Number(
						proposal.temp_proposal_no || 0
					) || null,

					components:
					normalized,

					saved_components:
					jsProposalComponents
					.normalizeRows([]),

					saved_updated_at:
					null
				}
			);

			createdIds.push(
				tempId
			);
		}

		if (createdIds.length) {
			await storeValue(
				"current_proposal_id",
				createdIds[0]
			);
		}

		return createdIds;
	},

	async discardCurrent() {
		const proposalId =
					this.currentProposalId();

		if (!proposalId) {
			return true;
		}

		await this.discard(
			proposalId
		);

		return true;
	},
};