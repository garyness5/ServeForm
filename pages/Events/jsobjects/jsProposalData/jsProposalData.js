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

	proposalMode() {
		if (!this.hasSelectedProposal()) {
			return "event";
		}

		return "proposal";
	},

	isEventMode() {
		return this.proposalMode() === "event";
	},

	isProposalDraft() {
		return (
			this.hasSelectedProposal() &&
			this.proposal().proposal_status === "Draft"
		);
	},

	isProposalLocked() {
		return false;
	},

	canEditDisplayedDocument() {
		return true;
	},

	header() {
		const r = this.event();

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
			name:
			r.name ?? "",

			event_ref:
			r.event_ref ?? "",

			event_date:
			r.event_date ?? null,

			event_datetime:
			r.event_datetime ?? null,

			event_time:
			r.event_time ?? null,

			format:
			r.format ?? "",

			total_guests_manual:
			r.total_guests_manual ?? "",

			customer_id:
			r.customer_id ?? null,

			contact_ids:
			toIdArray(
				r.contact_ids,
				r.contact_id
			),

			venue_id:
			r.venue_id ?? null,

			venue_contact_ids:
			toIdArray(
				r.venue_contact_ids,
				r.venue_contact_id
			),

			proposal_customer_notes:
			r.customer_notes ?? "",

			proposal_internal_notes:
			r.notes ?? ""
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

			editable: true,

			closed: r.is_closed === true,

			reference:
			r.proposal_number ||
			(r.proposal_no
			 ? `Draft ${r.proposal_no}`
			 : "")
		};
	}
};