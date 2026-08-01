export default {
	hasSelectedProposal() {
		const proposalId = Number(
			appsmith.store.current_proposal_id || 0
		);

		const loadedProposalId = Number(
			qryGetSelectedProposal.data?.[0]?.id || 0
		);

		return (
			proposalId > 0 &&
			loadedProposalId === proposalId
		);
	},

	proposal() {
		return qryGetSelectedProposal.data?.[0] ?? {};
	},

	event() {
		return getEvtItemById.data?.[0] ?? {};
	},

	header() {
		if (this.hasSelectedProposal()) {
			const r = this.proposal();

			return {
				name: r.event_name ?? "",
				event_ref: r.event_ref ?? "",
				event_date: r.event_date ?? null,
				event_datetime: r.event_datetime ?? null,
				event_time: r.event_time ?? null,
				format: r.event_format ?? "",
				total_guests_manual: r.total_guests ?? "",

				customer_id: r.customer_id ?? null,
				contact_id: r.contact_id ?? null,
				venue_id: r.venue_id ?? null,
				venue_contact_id: r.venue_contact_id ?? null,

				notes: r.event_notes ?? "",
				venue_notes: r.venue_notes ?? "",
				general_notes: r.general_notes ?? ""
			};
		}

		const r = this.event();

		return {
			name: r.name ?? "",
			event_ref: r.event_ref ?? "",
			event_date: r.event_date ?? null,
			event_datetime: r.event_datetime ?? null,
			event_time: r.event_time ?? null,
			format: r.format ?? "",
			total_guests_manual: r.total_guests_manual ?? "",

			customer_id: r.customer_id ?? null,
			contact_id: r.contact_id ?? null,
			venue_id: r.venue_id ?? null,
			venue_contact_id: r.venue_contact_id ?? null,

			notes: r.notes ?? "",
			venue_notes: r.venue_notes ?? "",
			general_notes: r.general_notes ?? ""
		};
	},

	eventControl() {
		const r = this.event();

		return {
			status: r.status ?? "Draft",
			active: r.active === false ? false : true
		};
	},

	proposalControl() {
		const r = this.proposal();

		return {
			id: r.id ?? null,
			status: r.proposal_status ?? null,
			active: r.active === false ? false : true,
			editable: r.is_editable === true,
			closed: r.is_closed === true,
			reference:
			r.proposal_number ||
			(r.proposal_no ? `Draft ${r.proposal_no}` : "")
		};
	}
};