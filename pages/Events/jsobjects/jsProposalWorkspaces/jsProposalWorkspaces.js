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
		const proposalId = this.currentProposalId();
		const row = qryGetSelectedProposal.data?.[0];

		return (
			proposalId > 0 &&
			Number(row?.id || 0) === proposalId &&
			row?.proposal_status === "Draft"
		);
	},

	get(proposalId = this.currentProposalId()) {
		return this.all()[String(proposalId)] || null;
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
		const id = Number(proposalId || 0);

		if (id === 0) return null;

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

	headerFromQuery() {
		const row =
					qryGetSelectedProposal.data?.[0] || {};

		const toIdArray = (arrayValue, singleValue) => {
			if (Array.isArray(arrayValue)) {
				return arrayValue
					.map(Number)
					.filter(Boolean);
			}

			const singleId = Number(singleValue || 0);

			return singleId > 0
				? [singleId]
			: [];
		};

		return {
			proposal_id: Number(
				row.id ||
				this.currentProposalId() ||
				0
			),

			event_name:
			row.event_name ?? "",

			event_ref:
			row.event_ref ?? "",

			event_date:
			row.event_date ?? null,

			event_time:
			row.event_time ?? null,

			event_datetime:
			row.event_datetime ?? null,

			event_format:
			row.event_format ?? "",

			total_guests:
			row.total_guests ?? null,

			customer_id:
			row.customer_id ?? null,

			contact_ids:
			toIdArray(
				row.contact_ids,
				row.contact_id
			),

			venue_id:
			row.venue_id ?? null,

			venue_contact_ids:
			toIdArray(
				row.venue_contact_ids,
				row.venue_contact_id
			),

			proposal_customer_notes:
			row.proposal_customer_notes ?? "",

			proposal_internal_notes:
			row.proposal_internal_notes ??
			row.event_notes ??
			""
		};
	},

	componentsFromQuery() {
		return jsProposalComponents.normalizeRows(
			jsProposalComponents.queryRows()
		);
	},

	async initializeCurrentDraft() {
		if (!this.isCurrentLoadedDraft()) {
			return null;
		}

		const proposalId = this.currentProposalId();
		const existing = this.get(proposalId);

		const queryHeader = this.headerFromQuery();
		const queryComponents = this.componentsFromQuery();

		/*
	 * No cached workspace: build directly from Supabase.
	 */
		if (!existing) {
			return await this.set(proposalId, {
				header: queryHeader,
				components: queryComponents,

				saved_header:
				this.deepCopy(queryHeader),

				saved_components:
				this.deepCopy(queryComponents),

				saved_updated_at:
				qryGetSelectedProposal.data?.[0]?.updated_at ||
				null
			});
		}

		const queryUpdatedAt =
					qryGetSelectedProposal.data?.[0]?.updated_at ||
					null;

		const workspaceUpdatedAt =
					existing.saved_updated_at || null;

		/*
	 * Supabase has a newer saved version.
	 * Rebuild the workspace so stale cached header values
	 * cannot override the saved Proposal.
	 */
		if (
			queryUpdatedAt &&
			queryUpdatedAt !== workspaceUpdatedAt
		) {
			return await this.set(proposalId, {
				header: queryHeader,
				components: queryComponents,

				saved_header:
				this.deepCopy(queryHeader),

				saved_components:
				this.deepCopy(queryComponents),

				saved_updated_at:
				queryUpdatedAt
			});
		}

		/*
	 * Existing workspace belongs to the current saved version.
	 * Preserve any legitimate unsaved changes.
	 */
		return existing;
	},

	async captureCurrentDraft() {
		if (!this.isCurrentLoadedDraft()) {
			return null;
		}

		const proposalId = this.currentProposalId();

		const existing =
					this.get(proposalId) ||
					await this.initializeCurrentDraft();

		if (!existing) {
			return null;
		}

		const header =
					jsProposalSave.headerSnapshotFromPage();

		const components =
					jsProposalComponents.mergeUpdatedRows();

		return await this.set(proposalId, {
			...existing,
			header,
			components
		});
	},

	async setCurrentComponents(rows) {
		if (!jsProposalData.isProposalDraft()) {
			return null;
		}

		const proposalId =
					this.currentProposalId();

		const existing =
					this.get(proposalId) || {};

		return await this.set(proposalId, {
			...existing,
			components:
			jsProposalComponents.normalizeRows(rows)
		});
	},

	deepCopy(value) {
		return JSON.parse(
			JSON.stringify(value)
		);
	},

	normalizeHeader(header) {
		const source = header || {};

		const dateValue =
					source.event_date ||
					source.event_datetime ||
					null;

		const timeValue =
					source.event_time ||
					source.event_datetime ||
					null;

		const normalizeIds = value =>
		[...(Array.isArray(value) ? value : [])]
		.map(Number)
		.filter(Boolean)
		.sort((a, b) => a - b);

		return {
			event_name:
			String(
				source.event_name || ""
			).trim() || null,

			event_ref:
			String(
				source.event_ref || ""
			).trim() || null,

			event_date:
			dateValue
			? moment.utc(dateValue)
			.format("YYYY-MM-DD")
			: null,

			event_time:
			timeValue
			? moment.utc(timeValue)
			.format("HH:mm:ss")
			: null,

			event_format:
			source.event_format || null,

			total_guests:
			source.total_guests === "" ||
			source.total_guests === null ||
			source.total_guests === undefined
			? null
			: Number(source.total_guests),

			customer_id:
			Number(source.customer_id || 0) || null,

			contact_ids:
			normalizeIds(source.contact_ids),

			venue_id:
			Number(source.venue_id || 0) || null,

			venue_contact_ids:
			normalizeIds(
				source.venue_contact_ids
			),

			proposal_customer_notes:
			String(
				source.proposal_customer_notes || ""
			).trim() || null,

			proposal_internal_notes:
			String(
				source.proposal_internal_notes || ""
			).trim() || null
		};
	},

	normalizeComponents(rows) {
		return (rows || [])
			.filter(row =>
							Number(row?.menu_id || 0) > 0 ||
							String(
			row?.menu_name || ""
		).trim()
						 )
			.map((row, index) => ({
			line_no: index + 1,

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
			: Number(
				row.extra_guests
			),

			notes:
			String(
				row.notes || ""
			).trim() || null,

			active:
			row.active === false
			? false
			: true
		}));
	},

	async captureCurrentHeader() {
		if (!jsProposalData.isProposalDraft()) {
			return null;
		}

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

		/*
	 * Locked Proposals cannot have valid unsaved edits.
	 */
		if (
			isCurrentProposal &&
			!jsProposalData.isProposalDraft()
		) {
			return false;
		}

		const currentHeader =
					this.normalizeHeader(
						workspace.header
					);

		const savedHeader =
					this.normalizeHeader(
						workspace.saved_header
					);

		/*
	 * For the displayed Draft, include edits still held
	 * inside tblEvtComponents.updatedRows.
	 */
		const currentRows =
					isCurrentProposal &&
					jsProposalData.isProposalDraft()
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
			JSON.stringify(currentHeader) !==
			JSON.stringify(savedHeader) ||
			JSON.stringify(currentComponents) !==
			JSON.stringify(savedComponents)
		);
	},

	dirtyProposalIds() {
		return Object.keys(this.all())
			.map(Number)
			.filter(id => this.isDirty(id));
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
					workspace.header || {}
				),

				saved_components:
				this.deepCopy(
					workspace.components || []
				),

				saved_updated_at:
				qryGetSelectedProposal.data?.[0]?.updated_at ||
				null
			}
		);
	},

	async discard(proposalId) {
		const id = Number(proposalId || 0);
		const workspaces = {
			...this.all()
		};

		delete workspaces[String(id)];

		await this.saveAll(workspaces);
		return true;
	}
};