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

    if (
      !saved ||
      saved.quote_status !== "Draft"
    ) {
      return false;
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

    return headerChanged || menusChanged;
  }
};