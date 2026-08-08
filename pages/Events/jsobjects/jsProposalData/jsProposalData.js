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

		return this.proposal().proposal_status === "Draft"
			? "proposal_draft"
		: "proposal_locked";
	},

	isEventMode() {
		return this.proposalMode() === "event";
	},

	isProposalDraft() {
		return this.proposalMode() === "proposal_draft";
	},

	isProposalLocked() {
		return this.proposalMode() === "proposal_locked";
	},

	canEditDisplayedDocument() {
		return (
			this.isEventMode() ||
			this.isProposalDraft()
		);
	},

	header() {
		const toIdArray = (
			arrayValue,
			singleValue
		) => {
			if (Array.isArray(arrayValue)) {
				return arrayValue
					.map(Number)
					.filter(Boolean);
			}

			const singleId =
						Number(singleValue || 0);

			return singleId > 0
				? [singleId]
			: [];
		};

		/*
	 * Editable Draft:
	 * use its current workspace.
	 */
		if (this.isProposalDraft()) {
			const workspace =
						jsProposalWorkspaces.get();

			if (workspace?.header) {
				const r =
							workspace.header;

				const eventDate =
							r.event_date
				? moment(r.event_date)
				.format("YYYY-MM-DD")
				: null;

				const eventTime =
							r.event_time
				? String(r.event_time)
				.slice(0, 8)
				: null;

				const eventDateTime =
							eventDate
				? `${eventDate}T${eventTime || "00:00:00"}`
				: null;

				return {
					name:
					r.event_name ?? "",

					event_ref:
					r.event_ref ?? "",

					event_date:
					eventDate,

					event_time:
					eventTime,

					event_datetime:
					eventDateTime,

					format:
					r.event_format ?? "",

					total_guests_manual:
					r.total_guests ?? "",

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
					r.proposal_customer_notes ?? "",

					proposal_internal_notes:
					r.proposal_internal_notes ?? ""
				};
			}
		}

		/*
	 * Saved Proposal:
	 * workspace first, query fallback.
	 */
		if (this.hasSelectedProposal()) {
			const workspace =
						jsProposalWorkspaces.get();

			const r =
						workspace?.header ||
						this.proposal();

			return {
				name:
				r.event_name ?? "",

				event_ref:
				r.event_ref ?? "",

				event_date:
				r.event_date ?? null,

				event_datetime:
				r.event_datetime ?? null,

				event_time:
				r.event_time ?? null,

				format:
				r.event_format ?? "",

				total_guests_manual:
				r.total_guests ?? "",

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
				r.proposal_customer_notes ?? "",

				proposal_internal_notes:
				r.proposal_internal_notes ?? ""
			};
		}

		/*
	 * Event mode / brand-new unsaved Event.
	 */
		const r =
					this.event();

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
			r.proposal_customer_notes ?? "",

			proposal_internal_notes:
			r.proposal_internal_notes ??
			r.notes ??
			""
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
			editable: this.isProposalDraft(),
			closed: r.is_closed === true,
			reference:
			r.proposal_number ||
			(r.proposal_no ? `Draft ${r.proposal_no}` : "")
		};
	}
};