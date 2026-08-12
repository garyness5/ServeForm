export default {
	event() {
		return Array.isArray(getEvtItemById.data)
			? (getEvtItemById.data[0] || {})
		: (getEvtItemById.data || {});
	},

	header() {
		const r = this.event();

		return {
			id:
			Number(r.id || 0) || null,

			name:
			r.name || null,

			event_ref:
			r.event_ref || null,

			event_datetime:
			r.event_datetime || null,

			customer_id:
			r.customer_id == null
			? null
			: Number(r.customer_id),

			contact_ids:
			(r.contact_ids || [])
			.map(Number)
			.filter(Boolean),

			venue_id:
			r.venue_id == null
			? null
			: Number(r.venue_id),

			venue_contact_ids:
			(r.venue_contact_ids || [])
			.map(Number)
			.filter(Boolean),

			total_guests_manual:
			r.total_guests_manual == null
			? null
			: Number(r.total_guests_manual),

			format:
			r.format || null,

			customer_notes:
			r.customer_notes || null,

			internal_notes:
			r.notes || null,

			active:
			r.active === false
			? false
			: true,

			status:
			r.status || "Draft"
		};
	},

	isClosed() {
		return this.header().status === "Closed";
	}
};