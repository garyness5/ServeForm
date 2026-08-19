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

			active: true,

			status: "Draft",
			closed_at: null,
			closed_proposal_id: null
		};
	},

	textClean(value) {
		const text =
					String(value || "").trim();

		return text || null;
	},

	numberOrNull(value) {
		if (
			value === "" ||
			value === null ||
			value === undefined
		) {
			return null;
		}

		const number =
					Number(value);

		return Number.isFinite(number)
			? number
		: null;
	},

	normalizeIds(values) {
		return (values || [])
			.map(Number)
			.filter(Boolean);
	},

	savedEventDateTime(row) {
		if (!row) {
			return null;
		}

		if (
			row.event_date &&
			row.event_time
		) {
			const date =
						String(row.event_date)
			.substring(0, 10);

			const time =
						String(row.event_time)
			.substring(0, 8);

			return `${date} ${time}`;
		}

		if (row.event_datetime) {
			/*
		 * Fallback only.
		 *
		 * Database value is a wall-clock
		 * timestamp, so preserve its clock
		 * digits without timezone conversion.
		 */
			return moment
				.utc(row.event_datetime)
				.format(
				"YYYY-MM-DD HH:mm:ss"
			);
		}

		return null;
	},

	normalizeWorkspace(data = {}) {
		return {
			event_id:
			Number(
				data.event_id || 0
			),

			name:
			this.textClean(
				data.name
			),

			event_ref:
			this.textClean(
				data.event_ref
			),

			event_datetime:
			data.event_datetime
			? moment(
				data.event_datetime
			).format(
				"YYYY-MM-DD HH:mm:ss"
			)
			: null,

			customer_id:
			this.numberOrNull(
				data.customer_id
			),

			contact_ids:
			this.normalizeIds(
				data.contact_ids
			),

			venue_id:
			this.numberOrNull(
				data.venue_id
			),

			venue_contact_ids:
			this.normalizeIds(
				data.venue_contact_ids
			),

			total_guests_manual:
			this.numberOrNull(
				data.total_guests_manual
			),

			format:
			this.textClean(
				data.format
			),

			customer_notes:
			this.textClean(
				data.customer_notes
			),

			internal_notes:
			this.textClean(
				data.internal_notes
			),

			active:
			data.active === false
			? false
			: true,

			status:
			String(
				data.status || "Draft"
			).trim() || "Draft",

			closed_at:
			data.closed_at || null,

			closed_proposal_id:
			Number(
				data.closed_proposal_id || 0
			) || null
		};
	},

	savedEvent() {
		const currentEventId =
					Number(
						appsmith.store.current_event_id || 0
					);

		/*
	 * Unsaved Event / Duplicate:
	 * there is no persisted Event baseline.
	 */
		if (currentEventId <= 0) {
			return this.emptyWorkspace();
		}

		const row =
					Array.isArray(
						qryGetEvtItemById.data
					)
		? qryGetEvtItemById.data[0]
		: qryGetEvtItemById.data;

		/*
	 * Never allow stale query data from another
	 * Event identity to become saved truth.
	 */
		if (
			!row ||
			Number(row.id || 0) !== currentEventId
		) {
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
			this.savedEventDateTime(row),

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
			row.active,

			status:
			row.status || "Draft",

			closed_at:
			row.closed_at || null,

			closed_proposal_id:
			Number(
				row.closed_proposal_id || 0
			) || null
		});
	},

	/*
 * Stored Event Working State.
 *
 * This is the last captured complete
 * Header state, not necessarily every
 * character currently being typed.
 */
	get() {
		const workspace =
					appsmith.store.event_workspace;

		if (
			workspace &&
			Number(
				workspace.event_id || 0
			) ===
			Number(
				appsmith.store.current_event_id || 0
			)
		) {
			return this.normalizeWorkspace(
				workspace
			);
		}

		return this.savedEvent();
	},

	/*
 * Current visible Header Working State.
 *
 * Text widgets are read directly here
 * instead of writing to appsmith.store
 * on every keystroke.
 *
 * Therefore rapid typing cannot race
 * against a workspace rerender.
 */
	current() {
		const base =
					this.get();

		return this.normalizeWorkspace({
			...base,

			event_ref:
			inpEvtRef.text,

			total_guests_manual:
			inpTotalGuests.text,

			event_datetime:
			datEvtDate.selectedDate === "" ||
			datEvtDate.selectedDate === null
			? null
			: (
				datEvtDate.selectedDate ??
				base.event_datetime
			),

			customer_id:
			selEvtCustomer
			.selectedOptionValue,

			contact_ids:
			msEvtContacts
			.selectedOptionValues ||
			[],

			venue_id:
			selEvtVenue
			.selectedOptionValue,

			venue_contact_ids:
			msEvtVenueContacts
			.selectedOptionValues ||
			[],

			format:
			selEvtFormat
			.selectedOptionValue,

			customer_notes:
			rteEvtCustomerNotes.text,

			internal_notes:
			rteEvtInternalNotes.text,

			active:
			chkEvtActive.isChecked
		});
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
							appsmith.store
							.current_event_id ||
							0
						)
					});

		await storeValue(
			"event_workspace",
			normalized
		);

		return normalized;
	},

	/*
	 * Capture EVERYTHING currently visible
	 * before applying a field-specific change.
	 *
	 * This is the key rule:
	 * changing one Header field can never
	 * overwrite unsaved work in another.
	 */
	async capture(patch = {}) {
		return await this.set({
			...this.current(),
			...patch
		});
	},

	async setCustomer(value) {
		return await this.capture({
			customer_id:
			this.numberOrNull(value),

			contact_ids: []
		});
	},

	async setCustomerContacts(values) {
		return await this.capture({
			contact_ids:
			this.normalizeIds(
				values
			)
		});
	},

	async setVenue(value) {
		return await this.capture({
			venue_id:
			this.numberOrNull(value),

			venue_contact_ids: []
		});
	},

	async setVenueContacts(values) {
		return await this.capture({
			venue_contact_ids:
			this.normalizeIds(
				values
			)
		});
	},

	async setFormat(value) {
		return await this.capture({
			format: value
		});
	},

	async setActive(value) {
		return await this.capture({
			active:
			value === false
			? false
			: true
		});
	},

	async setClosed(value) {
		return await this.capture({
			status:
			value === true
			? "Closed"
			: "Open"
		});
	},

	displayStatus() {
		const workspace =
					this.current();

		if (
			workspace.status ===
			"Closed"
		) {
			return "Closed";
		}

		const rows =
					qryGetProposalsForEvent.data ||
					[];

		if (
			rows.some(row =>
								row.proposal_status ===
								"Ordered"
							 )
		) {
			return "Ordered";
		}

		if (
			rows.some(row =>
								row.proposal_status ===
								"Accepted"
							 )
		) {
			return "Accepted";
		}

		if (
			rows.some(row =>
								row.proposal_status ===
								"Issued"
							 )
		) {
			return "Sent";
		}

		return "Draft";
	},

	canShowClosed() {
		const workspace =
					this.current();

		/*
	 * Already Closed:
	 * keep the checkbox visible so the user can
	 * uncheck / recheck it during the reopen session.
	 */
		if (workspace.status === "Closed") {
			return true;
		}

		/*
	 * A reopened saved Closed Event must also keep
	 * Closed available until the next Save.
	 */
		const saved =
					this.savedEvent();

		if (saved.status === "Closed") {
			return true;
		}

		/*
	 * Otherwise Closed is available only when the
	 * Event has a saved Active Ordered Proposal.
	 *
	 * Do not depend on which Proposal happens
	 * to be selected in the selector.
	 */
		return (
			qryGetProposalsForEvent.data || []
		).some(row =>
					 row.proposal_status === "Ordered" &&
					 row.active !== false
					);
	},

	isClosedLocked() {
		return (
			this.savedEvent().status === "Closed" &&
			this.current().status === "Closed"
		);
	},
};