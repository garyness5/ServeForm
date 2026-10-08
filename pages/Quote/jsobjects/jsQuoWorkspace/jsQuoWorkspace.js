export default {
	clone(value) {
		return JSON.parse(JSON.stringify(value));
	},

	getAll() {
		return appsmith.store.quotationWorkspaces || {};
	},

	getActiveKey() {
		return appsmith.store.quotationActiveWorkspaceKey || null;
	},

	getActive() {
		return this.getAll()[this.getActiveKey()] || null;
	},

	hasActive() {
		return !!this.getActive();
	},

	isDirty() {
		const ws = this.getActive();
		if (!ws) return false;
		if (ws.isTemporary) return true;

		return JSON.stringify(ws.current) !==
			JSON.stringify(ws.saved);
	},

	async select(key) {
		if (!this.getAll()[key]) return false;

		await storeValue("quotationActiveWorkspaceKey", key);
		return true;
	},

	async putSaved(quoteId, data) {
		const key = `quote:${Number(quoteId)}`;
		const all = this.clone(this.getAll());

		if (!all[key]) {
			all[key] = {
				key,
				quoteId: Number(quoteId),
				isTemporary: false,
				saved: this.clone(data),
				current: this.clone(data)
			};

			await storeValue("quotationWorkspaces", all);
		}

		return key;
	},

	async addTemporary(data) {
		const nextId = Number(
			appsmith.store.quotationNextTemporaryId || 1
		);

		const key = `temp:${nextId}`;
		const all = this.clone(this.getAll());

		all[key] = {
			key,
			quoteId: null,
			isTemporary: true,
			saved: null,
			current: this.clone(data)
		};

		await storeValue("quotationWorkspaces", all);
		await storeValue("quotationNextTemporaryId", nextId + 1);
		await storeValue("quotationActiveWorkspaceKey", key);

		return key;
	},

	canSave() {
		return this.hasActive()
		&& this.isDirty()
		&& !qryQuoSaveMenuPricing.isLoading
		&& !qryQuoCreateQuoteFromWorkspace.isLoading
		&& !qryQuoSaveWorkspacePricing.isLoading;
	},

	async duplicateActive() {
		const source = this.getActive();
		if (!source) return null;

		const data = this.clone(source.current);

		data.quoteId = null;
		data.quoteStatus = "Draft";
		data.issuedAt = null;
		data.acceptedAt = null;

		return await this.addTemporary(data);
	},

	async updateMenus(rows) {
		const key = this.getActiveKey();
		const all = this.clone(this.getAll());

		if (!key || !all[key]) return false;

		all[key].current.menus = this.clone(rows);

		await storeValue("quotationWorkspaces", all);
		return true;
	},

	async updateCurrent(data) {
		const key = this.getActiveKey();
		const all = this.clone(this.getAll());

		if (!all[key]) return false;

		all[key].current = this.clone(data);
		await storeValue("quotationWorkspaces", all);

		return true;
	},

	async markSaved(quoteId, data) {
		const oldKey = this.getActiveKey();
		const all = this.clone(this.getAll());

		if (!all[oldKey]) return false;

		const newKey = `quote:${Number(quoteId)}`;

		delete all[oldKey];

		all[newKey] = {
			key: newKey,
			quoteId: Number(quoteId),
			isTemporary: false,
			saved: this.clone(data),
			current: this.clone(data)
		};

		await storeValue("quotationWorkspaces", all);
		await storeValue("quotationActiveWorkspaceKey", newKey);

		return true;
	},

	getSelectorRows() {
		const inboxId = Number(appsmith.store.quotationInboxId || 0);
		if (!inboxId) return [];

		const saved = (qryQuoGetQuotes.data || []).map(r => ({
			...r,
			workspace_key: `quote:${Number(r.quote_id)}`,
			is_temporary: false
		}));

		const temporary = Object.values(this.getAll())
		.filter(ws =>
						ws.isTemporary &&
						Number(ws.current?.header?.inbox_id || 0) === inboxId
					 )
		.map(ws => ({
			quote_id: null,
			workspace_key: ws.key,
			is_temporary: true,
			quote_status: "Draft",
			quote_title: ws.current?.header?.quote_title || "New Quote"
		}));

		return [...temporary, ...saved];
	},

	async reset() {
		await removeValue("quotationWorkspaces");
		await removeValue("quotationActiveWorkspaceKey");
		await removeValue("quotationNextTemporaryId");
		return true;
	}
};
