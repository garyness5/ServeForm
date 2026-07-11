export default {
	text(value) {
		return String(value ?? "").trim();
	},

	number(value) {
		if (value === null || value === undefined || value === "") return null;

		const n = Number(value);
		return Number.isFinite(n) ? n : null;
	},

	date(value) {
		if (!value) return null;

		const m = moment(value);
		return m.isValid() ? m.format("YYYY-MM-DD") : null;
	},

	html(value) {
		const cleaned = String(value ?? "")
		.replace(/\s+/g, " ")
		.replace(/>\s+</g, "><")
		.trim();

		return [
			"",
			"<p></p>",
			"<p><br></p>",
			"<div></div>",
			"<div><br></div>"
		].includes(cleaned)
			? ""
		: cleaned;
	},

	isDirty() {
		const saved = getSelectedQuote.data?.[0];

		const depositsChanged =
					(tblQuoFinDeposits.updatedRows || []).length > 0;

		if (!saved) {
			return depositsChanged;
		}

		// Issued/Accepted quote fields are locked,
		// but Event deposits may still be edited.
		if (saved.quote_status !== "Draft") {
			return depositsChanged;
		}

		const headerChanged =
					this.text(inpQuoteReference.text) !==
					this.text(saved.quote_reference) ||

					this.date(dateQuoteValidUntil.selectedDate) !==
					this.date(saved.valid_until) ||

					this.text(selPricingMode.selectedOptionValue || "per_menu") !==
					this.text(saved.pricing_mode || "per_menu") ||

					this.number(inpEventPriceTotal.text) !==
					this.number(saved.event_price_total) ||

					this.number(inpServiceCharge.text) !==
					this.number(saved.service_charge) ||

					(
						(selPricingMode.selectedOptionValue || "per_menu") === "per_menu" &&
						this.number(inpServiceCharge.text) !==
						this.number(saved.service_charge)
					) ||

					this.date(dateFinalDueDate.selectedDate) !==
					this.date(saved.final_due_date) ||

					this.text(inpQuoVnuInstructions.text) !==
					this.text(saved.venue_instructions) ||

					this.html(rteQuoteCustomerNotes.text || rteQuoteCustomerNotes.value) !==
					this.html(saved.customer_notes) ||

					this.html(rteQuoteInternalNotes.text || rteQuoteInternalNotes.value) !==
					this.html(saved.internal_notes) ||

					this.html(rteQuoteTerms.text || rteQuoteTerms.value) !==
					this.html(saved.terms);

		const menusChanged =
					(tblQuoteMenus.updatedRows || []).length > 0;

		return headerChanged || menusChanged || depositsChanged;
	},

	dirtyDetails() {
		const saved = getSelectedQuote.data?.[0] || {};

		return {
			quoteStatus: saved.quote_status,

			quoteReference: {
				widget: this.text(inpQuoteReference.text),
				saved: this.text(saved.quote_reference)
			},

			validUntil: {
				widget: this.date(dateQuoteValidUntil.selectedDate),
				saved: this.date(saved.valid_until)
			},

			pricingMode: {
				widget: this.text(selPricingMode.selectedOptionValue || "per_menu"),
				saved: this.text(saved.pricing_mode || "per_menu")
			},

			eventPriceTotal: {
				checked:
				(selPricingMode.selectedOptionValue || "per_menu") === "event_total",
				widget: this.number(inpEventPriceTotal.text),
				saved: this.number(saved.event_price_total)
			},

			serviceCharge: {
				widget: this.number(inpServiceCharge.text),
				saved: this.number(saved.service_charge)
			},

			finalDueDate: {
				widget: this.date(dateFinalDueDate.selectedDate),
				saved: this.date(saved.final_due_date)
			},

			venueInstructions: {
				widget: this.text(inpQuoVnuInstructions.text),
				saved: this.text(saved.venue_instructions)
			},

			customerNotes: {
				widget: this.html(
					rteQuoteCustomerNotes.text ||
					rteQuoteCustomerNotes.value
				),
				saved: this.html(saved.customer_notes)
			},

			internalNotes: {
				widget: this.html(
					rteQuoteInternalNotes.text ||
					rteQuoteInternalNotes.value
				),
				saved: this.html(saved.internal_notes)
			},

			terms: {
				widget: this.html(
					rteQuoteTerms.text ||
					rteQuoteTerms.value
				),
				saved: this.html(saved.terms)
			},

			menuUpdatedRows:
			(tblQuoteMenus.updatedRows || []).length,

			depositUpdatedRows:
			(tblQuoFinDeposits.updatedRows || []).length
		};
	},

	async saveAll() {
		try {
			const selectedQuote = getSelectedQuote.data?.[0];
			const isDraft = selectedQuote?.quote_status === "Draft";

			const menusChanged =
						(tblQuoteMenus.updatedRows || []).length > 0;

			const depositsChanged =
						(tblQuoFinDeposits.updatedRows || []).length > 0;

			const saves = [];

			// Quote-owned data can only change while Draft.
			if (isDraft) {
				saves.push(saveSelectedQuoteHeader.run());

				if (menusChanged) {
					saves.push(saveQuoteMenus.run());
				}
			}

			// Event-owned deposits can change regardless of Quote status.
			if (depositsChanged) {
				saves.push(saveEventDeposits.run());
			}

			if (!saves.length) {
				return;
			}

			await Promise.all(saves);

			await Promise.all([
				getSelectedQuote.run(),
				getQuotesForEvent.run(),
				getQuoteMenus.run(),
				getEventDeposits.run()
			]);

			resetWidget("tblQuoteMenus", true);
			resetWidget("tblQuoFinDeposits", true);

			showAlert("Quotation saved.", "success");
		} catch (error) {
			showAlert(
				error?.message || "Quotation could not be saved.",
				"error"
			);
		}
	},

	currentMenuRows() {
		const edits = tblQuoteMenus.updatedRows || [];

		return (getQuoteMenus.data || []).map(row => {
			const edit = edits.find(
				x =>
				Number(x.allFields?.quote_menu_id) ===
				Number(row.quote_menu_id)
			);

			const merged = edit
			? { ...row, ...edit.allFields, ...edit.updatedFields }
			: row;

			return {
				...merged,
				line_total:
				Number(merged.guests || 0) *
				Number(merged.price_per_guest || 0)
			};
		});
	},

	pricingSubtotal() {
		return this.currentMenuRows().reduce(
			(sum, row) =>
			sum +
			(
				Number(row.guests || 0) *
				Number(row.price_per_guest || 0)
			),
			0
		);
	},

	pricingReferenceTotal() {
		return (
			this.pricingSubtotal() +
			(this.number(inpServiceCharge.text) ?? 0)
		);
	},

	quotedTotal() {
		return (
			(this.number(inpEventPriceTotal.text) ?? 0) +
			(this.number(inpServiceCharge.text) ?? 0)
		);
	},

	currentDepositRows() {
		const edits = tblQuoFinDeposits.updatedRows || [];

		return (getEventDeposits.data || []).map(row => {
			const edit = edits.find(
				x => Number(x.allFields?.deposit_id) === Number(row.deposit_id)
			);

			return edit
				? { ...row, ...edit.allFields, ...edit.updatedFields }
			: row;
		});
	},

	totalReceived() {
		return this.currentDepositRows().reduce(
			(sum, row) => sum + Number(row.amount_received || 0),
			0
		);
	},

	balanceDue() {
		return this.quotedTotal() - this.totalReceived();
	},
}