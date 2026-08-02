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

		return {
			event_name: row.event_name ?? "",
			event_ref: row.event_ref ?? "",
			event_datetime:
			row.event_datetime ?? null,
			event_format:
			row.event_format ?? "",
			total_guests:
			row.total_guests ?? null,
			event_notes:
			row.event_notes ?? ""
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

		if (existing) {
			return existing;
		}

		const header = this.headerFromQuery();
		const components = this.componentsFromQuery();

		return await this.set(proposalId, {
			header,
			components,

			saved_header:
			JSON.parse(JSON.stringify(header)),

			saved_components:
			JSON.parse(JSON.stringify(components))
		});
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

	isDirty(
		proposalId = this.currentProposalId()
	) {
		const workspace = this.get(proposalId);

		if (!workspace) return false;

		return (
			JSON.stringify(workspace.header || {}) !==
			JSON.stringify(
				workspace.saved_header || {}
			) ||
			JSON.stringify(
				workspace.components || []
			) !==
			JSON.stringify(
				workspace.saved_components || []
			)
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

		if (!workspace) return null;

		return await this.set(proposalId, {
			...workspace,

			saved_header:
			JSON.parse(
				JSON.stringify(
					workspace.header || {}
				)
			),

			saved_components:
			JSON.parse(
				JSON.stringify(
					workspace.components || []
				)
			)
		});
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