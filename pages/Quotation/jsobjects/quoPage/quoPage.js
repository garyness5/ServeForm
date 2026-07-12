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

	contactIsDirty() {
		const saved =
					appsmith.store.quo_contact_mode === "edit"
		? this.selectedContact()
		: {};

		const text = value => String(value ?? "").trim();

		if (appsmith.store.quo_contact_mode !== "edit") {
			return Boolean(text(inpQuoContactName.text));
		}

		return (
			text(inpQuoContactName.text) !== text(saved.contact_name) ||
			text(inpQuoContactTitle.text) !== text(saved.title) ||
			text(inpQuoContactPhone.text) !== text(saved.phone) ||
			text(inpQuoContactMobile.text) !== text(saved.mobile) ||
			text(inpQuoContactEmail.text) !== text(saved.email) ||
			text(inpQuoContactNotes.text) !== text(saved.notes) ||
			Number(selQuoContactCustomer.selectedOptionValue || 0) !==
			Number(saved.customer_id || 0) ||
			Boolean(chkQuoContactActive.isChecked) !==
			Boolean(saved.active)
		);
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
		const saved = getSelectedQuote.data?.[0];

		// Issued and Accepted quotes use their frozen saved total.
		if (saved && saved.quote_status !== "Draft") {
			return this.number(saved.quote_total) ?? 0;
		}

		// Draft Per Menu uses live menu pricing.
		if (selPricingMode.selectedOptionValue === "per_menu") {
			return (
				this.pricingSubtotal() +
				(this.number(inpServiceCharge.text) ?? 0)
			);
		}

		// Draft Per Event uses the manually entered final Event Price.
		return this.number(inpEventPriceTotal.text) ?? 0;
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

	selectedCustomer() {
		return (
			getQuoCustomers.data?.find(
				x => Number(x.id) === Number(appsmith.store.quo_customer_id)
			) || {}
		);
	},

	async saveCustomer(saveAndNew = false) {
		if (!inpQuoCustomerName.text?.trim()) {
			showAlert("Customer name is required.", "warning");
			return;
		}

		const result =
					appsmith.store.quo_customer_mode === "edit"
		? await updateQuoCustomer.run()
		: await saveQuoCustomer.run();

		const row = result?.[0] || {};
		const customerId =
					appsmith.store.quo_customer_mode === "edit"
		? Number(appsmith.store.quo_customer_id || 0)
		: Number(row.id || 0);

		if (!customerId) {
			showAlert("Customer was not saved correctly.", "error");
			return;
		}

		await storeValue("quo_customer_id", customerId);
		await updateQuoCustomerAssignment.run();

		await getQuoCustomers.run();
		await getSelectedQuote.run();

		if (saveAndNew) {
			await storeValue("quo_customer_mode", "add");
			await storeValue("quo_customer_id", null);
			await resetWidget("selQuoCustomer", true);
			await resetWidget("mdlQuoCustomer", true);

			showAlert("Customer saved. Ready for next customer.", "success");
			return;
		}

		closeModal("mdlQuoCustomer");
		showAlert("Customer saved.", "success");
	},

	selectedContact() {
		return (
			getQuoContacts.data?.find(
				x => Number(x.id) === Number(appsmith.store.quo_contact_id)
			) || {}
		);
	},

	async saveContact(saveAndNew = false) {
		if (!inpQuoContactName.text?.trim()) {
			showAlert("Contact name is required.", "warning");
			return;
		}

		const result = await saveQuoContact.run();
		const row = result?.[0] || {};

		const customerId = Number(row.customer_id || 0);
		const contactId = Number(row.contact_id || 0);

		if (!customerId || !contactId) {
			showAlert("Contact saved, but no Contact ID was returned.", "error");
			return;
		}

		await storeValue("quo_contact_customer_id", customerId);
		await storeValue("quo_contact_id", contactId);

		await updateQuoContactAssignment.run();

		await getQuoCustomers.run();
		await getQuoContacts.run();
		await getSelectedQuote.run();

		if (saveAndNew) {
			await storeValue("quo_contact_mode", "add");
			await storeValue("quo_contact_id", null);
			await resetWidget("mdlQuoContact", true);

			showAlert(
				"Contact saved. Ready for next contact.",
				"success"
			);
			return;
		}

		closeModal("mdlQuoContact");
		showAlert("Contact saved.", "success");
	},
}