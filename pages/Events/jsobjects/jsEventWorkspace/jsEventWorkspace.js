export default {
	emptyWorkspace() {
		return {
			event_id: 0,

			name: null,
			event_ref: null,
			event_datetime: null,

			customer_id: null,
			contact_ids: [],

			venue_id: null,
			venue_contact_ids: [],

			total_guests_manual: null,
			format: null,

			customer_notes: null,
			internal_notes: null,

			active: true
		};
	},

	textClean(value) {
		const text = String(value || "").trim();
		return text || null;
	},

	normalizeIds(values) {
		return (values || [])
			.map(Number)
			.filter(Boolean);
	},

	normalizeWorkspace(data = {}) {
		return {
			event_id:
			Number(data.event_id || 0),

			name:
			this.textClean(data.name),

			event_ref:
			this.textClean(data.event_ref),

			event_datetime:
			data.event_datetime
			? moment.utc(data.event_datetime)
			.format("YYYY-MM-DD HH:mm:ss")
			: null,

			customer_id:
			data.customer_id == null
			? null
			: Number(data.customer_id),

			contact_ids:
			this.normalizeIds(data.contact_ids),

			venue_id:
			data.venue_id == null
			? null
			: Number(data.venue_id),

			venue_contact_ids:
			this.normalizeIds(data.venue_contact_ids),

			total_guests_manual:
			data.total_guests_manual === "" ||
			data.total_guests_manual === null ||
			data.total_guests_manual === undefined
			? null
			: Number(data.total_guests_manual),

			format:
			this.textClean(data.format),

			customer_notes:
			this.textClean(data.customer_notes),

			internal_notes:
			this.textClean(data.internal_notes),

			active:
			data.active === false
			? false
			: true
		};
	},

	savedEvent() {
		const row =
					Array.isArray(getEvtItemById.data)
		? getEvtItemById.data[0]
		: getEvtItemById.data;

		if (!row) {
			return this.emptyWorkspace();
		}

		return this.normalizeWorkspace({
			event_id:
			Number(row.id || 0),

			name:
			row.name,

			event_ref:
			row.event_ref,

			event_datetime:
			row.event_datetime,

			customer_id:
			row.customer_id,

			contact_ids:
			row.contact_ids || [],

			venue_id:
			row.venue_id,

			venue_contact_ids:
			row.venue_contact_ids || [],

			total_guests_manual:
			row.total_guests_manual,

			format:
			row.format,

			customer_notes:
			row.customer_notes,

			internal_notes:
			row.notes,

			active:
			row.active
		});
	},

	get() {
		const workspace =
					appsmith.store.event_workspace;

		if (
			workspace &&
			Number(workspace.event_id || 0) ===
			Number(appsmith.store.current_event_id || 0)
		) {
			return this.normalizeWorkspace(workspace);
		}

		return this.savedEvent();
	},

	async initialize() {
		const saved =
					this.savedEvent();

		await storeValue(
			"event_workspace",
			saved
		);

		return saved;
	},

	async clear() {
		await removeValue(
			"event_workspace"
		);

		return true;
	},

	async resetFromSaved() {
		await this.clear();
		return await this.initialize();
	},

	async set(workspace) {
		const normalized =
					this.normalizeWorkspace({
						...workspace,
						event_id:
						Number(
							appsmith.store.current_event_id || 0
						)
					});

		await storeValue(
			"event_workspace",
			normalized
		);

		return normalized;
	},

	async patch(patch = {}) {
		return await this.set({
			...this.get(),
			...patch
		});
	},

	async setName(value) {
		return await this.patch({
			name: value
		});
	},

	async setEventRef(value) {
		return await this.patch({
			event_ref: value
		});
	},

	async setEventDateTime(value) {
		const workspace =
					this.get();

		return await this.set({
			...workspace,

			event_datetime:
			value
			? moment(value)
			.format("YYYY-MM-DD HH:mm:ss")
			: null
		});
	},

	async setCustomer(value) {
		return await this.patch({
			customer_id:
			value == null || value === ""
			? null
			: Number(value),

			contact_ids: []
		});
	},

	async setCustomerContacts(values) {
		return await this.patch({
			contact_ids:
			this.normalizeIds(values)
		});
	},

	async setVenue(value) {
		return await this.patch({
			venue_id:
			value == null || value === ""
			? null
			: Number(value),

			venue_contact_ids: []
		});
	},

	async setVenueContacts(values) {
		return await this.patch({
			venue_contact_ids:
			this.normalizeIds(values)
		});
	},

	async setTotalGuests(value) {
		return await this.patch({
			total_guests_manual:
			value === "" ||
			value === null ||
			value === undefined
			? null
			: Number(value)
		});
	},

	async setFormat(value) {
		return await this.patch({
			format: value
		});
	},

	async setCustomerNotes(value) {
		return await this.patch({
			customer_notes: value
		});
	},

	async setInternalNotes(value) {
		return await this.patch({
			internal_notes: value
		});
	},

	async setActive(value) {
		return await this.patch({
			active:
			value === false
			? false
			: true
		});
	},

	isDirty() {
		return (
			JSON.stringify(this.get()) !==
			JSON.stringify(this.savedEvent())
		);
	},

	dirtyDifferences() {
		const working =
					this.get();

		const saved =
					this.savedEvent();

		return Object.keys(working)
			.filter(key =>
							JSON.stringify(working[key]) !==
							JSON.stringify(saved[key])
						 )
			.map(key => ({
			field: key,
			working: working[key],
			saved: saved[key]
		}));
	}
};