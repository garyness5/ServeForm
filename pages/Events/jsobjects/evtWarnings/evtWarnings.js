export default {
	rows() {
		return (getEvtComponents.data || []).filter(r =>
																								r.menu_id ||
																								r.guests != null ||
																								r.extra_percent != null
																							 );
	},

	list() {
		const warnings = [];

		const header = jsProposalData.header();

		if (!header.customer_id) {
			warnings.push("No Customer selected.");
		}

		if (!(header.contact_ids || []).length) {
			warnings.push("No Customer Contact selected.");
		}

		if (!header.venue_id) {
			warnings.push("No Venue selected.");
		}

		if (
			header.venue_id &&
			!(header.venue_contact_ids || []).length
		) {
			warnings.push("No Venue Contact selected.");
		}

		this.rows().forEach((r, i) => {
			const line = r.line_no || i + 1;
			const name = r.menu_name || "Menu";

			if (r.menu_id && r.child_deleted === true) {
				warnings.push(`Line ${line}: ${name} not found.`);
				return;
			}

			if (r.menu_id && r.child_active === false) {
				warnings.push(`Line ${line}: ${name} is inactive.`);
			}

			if (r.menu_id && (r.guests === null || r.guests === "" || Number(r.guests) <= 0)) {
				warnings.push(`Line ${line}: guests missing.`);
			}

			if (r.menu_id && r.child_active !== false && (r.line_cost === null || r.line_cost === "")) {
				warnings.push(`Line ${line}: line cost missing.`);
			}
		});

		return warnings;
	},

	text() {
		return this.list().join("<br>&nbsp;&nbsp;");
	}
}