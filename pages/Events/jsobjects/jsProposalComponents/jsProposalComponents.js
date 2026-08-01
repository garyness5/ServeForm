export default {
	isProposalMode() {
		return jsProposalData.hasSelectedProposal();
	},

	rows() {
		if (!this.isProposalMode()) {
			return evtCompTable.getRows();
		}

		return (qryGetSelectedProposalMenus.data ?? []).map((r, index) => ({
			draft_row_id: `proposal_${r.proposal_id}_${r.id}`,

			source_type: "proposal",
			id: r.id,
			proposal_id: r.proposal_id,
			event_id: r.event_id,
			event_component_id: r.event_component_id,

			line_no: r.line_no ?? index + 1,

			category_id: null,
			category_name: null,

			menu_id: r.menu_id,
			menu_name: r.menu_name,

			guests: r.guests,
			extra_guests: r.extra_guests,
			production_guests:
			r.production_guests ??
			(Number(r.guests || 0) + Number(r.extra_guests || 0)),

			menu_cost: null,
			line_cost: r.kitchen_cost,

			allergen_names: r.allergen_names,
			diet_tag_names: r.diet_tag_names,
			notes: r.notes,

			active: r.active === false ? false : true,
			component_status: r.component_status
		}));
	},

	totalGuests() {
		return this.rows().reduce((sum, row) => {
			if (row.active === false) return sum;
			return sum + Number(row.guests || 0);
		}, 0);
	},

	toProduce() {
		return this.rows().reduce((sum, row) => {
			if (row.active === false) return sum;

			return sum + Number(
				row.production_guests ??
				(Number(row.guests || 0) + Number(row.extra_guests || 0))
			);
		}, 0);
	},

	totalCost() {
		const total = this.rows().reduce((sum, row) => {
			if (row.active === false) return sum;

			const value =
						row.source_type === "proposal"
			? Number(row.line_cost || 0)
			: Number(evtCompTable.lineCost(row) || 0);

			return sum + value;
		}, 0);

		return Math.round(total * 100) / 100;
	},

	uniqueTextList(value) {
		if (!value) return [];

		return String(value)
			.split(",")
			.map(x => x.trim())
			.filter(Boolean);
	},

	allergenSummary() {
		const items = this.rows()
		.filter(row => row.active !== false)
		.flatMap(row => this.uniqueTextList(row.allergen_names));

		return [...new Set(items)].sort().join(", ");
	},

	dietTagSummary() {
		const items = this.rows()
		.filter(row => row.active !== false)
		.flatMap(row => this.uniqueTextList(row.diet_tag_names));

		return [...new Set(items)].sort().join(", ");
	}
};