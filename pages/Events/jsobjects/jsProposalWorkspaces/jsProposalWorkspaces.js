export default {
	all() {
		return appsmith.store.proposal_workspaces || {};
	},

	currentProposalId() {
		return Number(
			appsmith.store.current_proposal_id || 0
		);
	},

	isCurrentLoadedDraft() {
		const proposalId =
					this.currentProposalId();

		const row =
					qryGetSelectedProposal.data?.[0];

		return (
			proposalId > 0 &&
			Number(row?.id || 0) === proposalId &&
			row?.proposal_status === "Draft"
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

		if (id === 0) {
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

		await this.saveAll(
			workspaces
		);

		return workspaces[
			String(id)
		];
	},

	async renameEventInWorkspaces(
		eventId,
		newName
	) {
		const name =
					String(newName || "").trim();

		if (!name) {
			return false;
		}

		/*
	 * qryGetProposalsForEvent already contains
	 * every Proposal belonging to the current Event.
	 */
		const proposalIds =
					new Set(
						(qryGetProposalsForEvent.data || [])
						.map(row =>
								 Number(row.id || 0)
								)
						.filter(Boolean)
					);

		const workspaces =
					this.all();

		const updated = {};

		Object.entries(workspaces)
			.forEach(
			([proposalId, workspace]) => {

				const belongsToEvent =
							proposalIds.has(
								Number(proposalId)
							);

				updated[proposalId] =
					belongsToEvent
					? {
					...workspace,

					header: {
						...(workspace.header || {}),
						event_name: name
					},

					saved_header: {
						...(workspace.saved_header || {}),
						event_name: name
					}
				}
				: workspace;
			}
		);

		await this.saveAll(updated);

		return true;
	},

	async initializeCurrentHeader() {
		const proposalId =
					this.currentProposalId();

		if (
			proposalId === 0 ||
			!jsProposalData.hasSelectedProposal()
		) {
			return null;
		}

		const existing =
					this.get(proposalId);

		const queryHeader =
					this.headerFromQuery();

		const queryComponents =
					this.componentsFromQuery();

		/*
	 * Existing workspace already has the full
	 * editable Proposal state.
	 */
		if (
			existing?.header &&
			Array.isArray(existing?.components) &&
			Array.isArray(existing?.saved_components)
		) {
			return existing;
		}

		/*
	 * Old locked-Proposal workspaces may contain
	 * only a header. Complete them now.
	 */
		return await this.set(
			proposalId,
			{
				...(existing || {}),

				header:
				existing?.header ||
				queryHeader,

				components:
				Array.isArray(existing?.components)
				? existing.components
				: queryComponents,

				saved_header:
				existing?.saved_header ||
				this.deepCopy(
					queryHeader
				),

				saved_components:
				Array.isArray(
					existing?.saved_components
				)
				? existing.saved_components
				: this.deepCopy(
					queryComponents
				),

				saved_updated_at:
				existing?.saved_updated_at ||
				qryGetSelectedProposal
				.data?.[0]
				?.updated_at ||
				null
			}
		);
	},

	componentsFromQuery() {
		return jsProposalComponents
			.normalizeRows(
			jsProposalComponents
			.queryRows()
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

		const queryHeader =
					this.headerFromQuery();

		const queryComponents =
					this.componentsFromQuery();

		if (!existing) {
			return await this.set(
				proposalId,
				{
					header:
					queryHeader,

					components:
					queryComponents,

					saved_header:
					this.deepCopy(
						queryHeader
					),

					saved_components:
					this.deepCopy(
						queryComponents
					),

					saved_updated_at:
					qryGetSelectedProposal
					.data?.[0]
					?.updated_at ||
					null
				}
			);
		}

		const queryUpdatedAt =
					qryGetSelectedProposal
		.data?.[0]
		?.updated_at ||
					null;

		const workspaceUpdatedAt =
					existing.saved_updated_at ||
					null;

		if (
			queryUpdatedAt &&
			queryUpdatedAt !==
			workspaceUpdatedAt
		) {
			return await this.set(
				proposalId,
				{
					header:
					queryHeader,

					components:
					queryComponents,

					saved_header:
					this.deepCopy(
						queryHeader
					),

					saved_components:
					this.deepCopy(
						queryComponents
					),

					saved_updated_at:
					queryUpdatedAt
				}
			);
		}

		return existing;
	},

	async captureCurrentDraft() {
		if (!jsProposalData.hasSelectedProposal()) {
			return null;
		}

		const proposalId =
					this.currentProposalId();

		let existing =
				this.get(proposalId);

		if (!existing?.header) {
			existing =
				await this.initializeCurrentDraft();
		}

		if (!existing) {
			return null;
		}

		const header =
					jsProposalSave.headerSnapshotFromPage();

		const components =
					jsProposalComponents.mergeUpdatedRows();

		return await this.set(
			proposalId,
			{
				...existing,
				header,
				components
			}
		);
	},

	async setCurrentComponents(rows) {
		if (!jsProposalData.hasSelectedProposal()) {
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

	async captureCurrentComponents() {
		if (!jsProposalData.hasSelectedProposal()) {
			return null;
		}

		const proposalId =
					this.currentProposalId();

		let workspace =
				this.get(proposalId);

		if (!workspace?.header) {
			workspace =
				await this.initializeCurrentDraft();
		}

		if (!workspace) {
			return null;
		}

		const components =
					jsProposalComponents.mergeUpdatedRows();

		return await this.set(
			proposalId,
			{
				...workspace,
				components
			}
		);
	},

	deepCopy(value) {
		return JSON.parse(
			JSON.stringify(value)
		);
	},

	normalizeHeader(header) {
		const source =
					header || {};

		const dateValue =
					source.event_date ||
					source.event_datetime ||
					null;

		const timeValue =
					source.event_time ||
					source.event_datetime ||
					null;

		const normalizeIds =
					value =>
		[
			...(
				Array.isArray(value)
				? value
				: []
			)
		]
		.map(Number)
		.filter(Boolean)
		.sort(
			(a, b) =>
			a - b
		);

		return {
			event_name:
			String(
				source.event_name ||
				""
			).trim() ||
			null,

			event_ref:
			String(
				source.event_ref ||
				""
			).trim() ||
			null,

			/*
			 * Event Date/Time is wall-clock time.
			 * Do not convert to UTC.
			 */
			event_date:
			dateValue
			? moment(
				dateValue
			).format(
				"YYYY-MM-DD"
			)
			: null,

			event_time:
			timeValue
			? moment(
				timeValue
			).format(
				"HH:mm:ss"
			)
			: null,

			event_format:
			source.event_format ||
			null,

			total_guests:
			source.total_guests === "" ||
			source.total_guests === null ||
			source.total_guests === undefined
			? null
			: Number(
				source.total_guests
			),

			customer_id:
			Number(
				source.customer_id ||
				0
			) || null,

			contact_ids:
			normalizeIds(
				source.contact_ids
			),

			venue_id:
			Number(
				source.venue_id ||
				0
			) || null,

			venue_contact_ids:
			normalizeIds(
				source
				.venue_contact_ids
			),

			event_id:
			Number(
				source.event_id || 0
			) || null,

			proposal_customer_notes:
			String(
				source
				.proposal_customer_notes ||
				""
			).trim() ||
			null,

			proposal_internal_notes:
			String(
				source
				.proposal_internal_notes ||
				""
			).trim() ||
			null
		};
	},

	normalizeComponents(rows) {
		return (rows || [])
			.filter(row =>
							Number(
			row?.menu_id || 0
		) > 0 ||
							String(
			row?.menu_name || ""
		).trim()
						 )
			.map(
			(row, index) => ({
				line_no:
				index + 1,

				menu_id:
				Number(
					row.menu_id ||
					0
				) ||
				null,

				guests:
				row.guests === "" ||
				row.guests === null ||
				row.guests === undefined
				? null
				: Number(
					row.guests
				),

				extra_guests:
				row.extra_guests === "" ||
				row.extra_guests === null ||
				row.extra_guests === undefined
				? 0
				: Number(
					row.extra_guests
				),

				notes:
				String(
					row.notes ||
					""
				).trim() ||
				null,

				active:
				row.active === false
				? false
				: true
			})
		);
	},

	/*
	 * Drafts and locked Proposals both use this.
	 * Locked Proposals only expose the permitted
	 * operational header fields in the UI.
	 */
	async captureCurrentHeader() {
		if (
			!jsProposalData
			.hasSelectedProposal()
		) {
			return null;
		}

		const proposalId =
					this.currentProposalId();

		let workspace =
				this.get(proposalId);

		if (!workspace?.header) {
			workspace =
				await this.initializeCurrentDraft();
		}

		if (!workspace?.header) {
			return null;
		}

		return await this.set(
			proposalId,
			{
				...workspace,

				header:
				jsProposalSave
				.headerSnapshotFromPage()
			}
		);
	},

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

		const currentHeader =
					this.normalizeHeader(
						workspace.header
					);

		const savedHeader =
					this.normalizeHeader(
						workspace.saved_header
					);

		const currentRows =
					isCurrentProposal
		? jsProposalComponents.mergeUpdatedRows()
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
			JSON.stringify(currentHeader) !==
			JSON.stringify(savedHeader) ||
			JSON.stringify(currentComponents) !==
			JSON.stringify(savedComponents)
		);
	},

	dirtyProposalIds() {
		return Object.keys(
			this.all()
		)
			.map(Number)
			.filter(
			id =>
			this.isDirty(id)
		);
	},

	async markCurrentSaved() {
		const proposalId =
					this.currentProposalId();

		const workspace =
					this.get(proposalId);

		if (!workspace) {
			return null;
		}

		return await this.set(
			proposalId,
			{
				...workspace,

				saved_header:
				this.deepCopy(
					workspace.header ||
					{}
				),

				saved_components:
				this.deepCopy(
					workspace.components ||
					[]
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
					Number(
						proposalId || 0
					);

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
	}
};