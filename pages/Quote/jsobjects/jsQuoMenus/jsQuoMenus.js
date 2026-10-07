export default {
	async loadProposal() {
		const rows = (qryQuoGetReceivedMenus.data || []).map(r => ({
			quote_menu_id: null,
			quote_id: null,
			received_menu_id: Number(r.received_menu_id || r.id),
			line_no: Number(r.line_no),

			menu_name: r.menu_name || "",
			customer_guests: Number(r.customer_guests || 0),
			diet_tag_names: r.diet_tag_names || "",

			total_production_cost:
			r.total_production_cost == null
			? null
			: Number(r.total_production_cost),

			cost_per_guest:
			Number(r.customer_guests || 0) > 0 &&
			r.total_production_cost != null
			? Number(r.total_production_cost) /
			Number(r.customer_guests)
			: null,

			price_per_guest_markup_percent: null,
			selling_price_per_guest: null,
			total_markup_percent: null,
			selling_total: null
		}));

		await storeValue("quotationMenuRows", rows);
		return rows;
	},

	async loadQuote() {
		const proposalRows = (qryQuoGetReceivedMenus.data || []).map(r => ({
			quote_menu_id: null,
			quote_id: null,
			received_menu_id: Number(r.received_menu_id || r.id),
			line_no: Number(r.line_no),

			menu_name: r.menu_name || "",
			customer_guests: Number(r.customer_guests || 0),
			diet_tag_names: r.diet_tag_names || "",

			total_production_cost:
			r.total_production_cost == null
			? null
			: Number(r.total_production_cost),

			cost_per_guest:
			Number(r.customer_guests || 0) > 0 &&
			r.total_production_cost != null
			? Number(r.total_production_cost) /
			Number(r.customer_guests)
			: null,

			price_per_guest_markup_percent: null,
			selling_price_per_guest: null,
			total_markup_percent: null,
			selling_total: null
		}));

		const quoteRows = qryQuoGetQuoteMenus.data || [];

		const rows = proposalRows.map(proposalRow => {
			const quoteRow = quoteRows.find(
				q =>
				Number(q.received_menu_id) ===
				Number(proposalRow.received_menu_id)
			);

			if (!quoteRow) {
				return proposalRow;
			}

			return {
				...proposalRow,

				quote_menu_id: Number(quoteRow.quote_menu_id),
				quote_id: Number(quoteRow.quote_id),

				price_per_guest_markup_percent:
				quoteRow.price_per_guest_markup_percent == null
				? null
				: Number(quoteRow.price_per_guest_markup_percent),

				selling_price_per_guest:
				quoteRow.selling_price_per_guest == null
				? null
				: Number(quoteRow.selling_price_per_guest),

				total_markup_percent:
				quoteRow.total_markup_percent == null
				? null
				: Number(quoteRow.total_markup_percent),

				selling_total:
				quoteRow.selling_total == null
				? null
				: Number(quoteRow.selling_total)
			};
		});

		await storeValue("quotationMenuRows", rows);
		return rows;
	},

	async clear() {
		await removeValue("quotationMenuRows");
	},

	async setPricePercent(quoteMenuId, value) {
		const pct = this.toNullableNumber(value);

		const rows = (appsmith.store.quotationMenuRows || []).map(r => {
			if (r.quote_menu_id !== Number(quoteMenuId)) return r;

			const price =
						pct == null || r.cost_per_guest == null
			? null
			: r.cost_per_guest * (1 + pct / 100);

			return {
				...r,
				price_per_guest_markup_percent: pct,
				selling_price_per_guest: price,
				total_markup_percent: null,
				selling_total:
				price == null
				? null
				: price * r.customer_guests
			};
		});

		await storeValue("quotationMenuRows", rows);
	},

	async setPricePerGuest(quoteMenuId, value) {
		const price = this.toNullableNumber(value);

		const rows = (appsmith.store.quotationMenuRows || []).map(r => {
			if (r.quote_menu_id !== Number(quoteMenuId)) return r;

			return {
				...r,
				price_per_guest_markup_percent: null,
				selling_price_per_guest: price,
				total_markup_percent: null,
				selling_total:
				price == null
				? null
				: price * r.customer_guests
			};
		});

		await storeValue("quotationMenuRows", rows);
	},

	async setTotalPercent(quoteMenuId, value) {
		const pct = this.toNullableNumber(value);

		const rows = (appsmith.store.quotationMenuRows || []).map(r => {
			if (r.quote_menu_id !== Number(quoteMenuId)) return r;

			return {
				...r,
				price_per_guest_markup_percent: null,
				selling_price_per_guest: null,
				total_markup_percent: pct,
				selling_total:
				pct == null || r.total_production_cost == null
				? null
				: r.total_production_cost * (1 + pct / 100)
			};
		});

		await storeValue("quotationMenuRows", rows);
	},

	async setSellingTotal(quoteMenuId, value) {
		const total = this.toNullableNumber(value);

		const rows = (appsmith.store.quotationMenuRows || []).map(r => {
			if (r.quote_menu_id !== Number(quoteMenuId)) return r;

			return {
				...r,
				price_per_guest_markup_percent: null,
				selling_price_per_guest: null,
				total_markup_percent: null,
				selling_total: total
			};
		});

		await storeValue("quotationMenuRows", rows);
	},

	toNullableNumber(value) {
		if (value === null || value === undefined || value === "") {
			return null;
		}

		const n = Number(String(value).replace(/,/g, ""));
		return Number.isFinite(n) ? n : null;
	}
};