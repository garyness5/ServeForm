export default {
	async select(row) {
		const quoteId = Number(row?.quote_id || 0);

		if (!quoteId) {
			await removeValue("quotationQuoteId");

			// Keep Proposal menus, but remove Quote pricing.
			await jsQuoMenus.loadProposal();

			return false;
		}

		await storeValue("quotationQuoteId", quoteId);

		await Promise.all([
			qryQuoGetQuoteHeader.run(),
			qryQuoGetQuoteMenus.run()
		]);

		await jsQuoMenus.loadQuote();

		return true;
	},

	async save() {
		const quoteId = Number(
			appsmith.store.quotationQuoteId || 0
		);

		if (!quoteId) {
			showAlert("Select a Quote before saving.", "warning");
			return false;
		}

		try {
			await qryQuoSaveMenuPricing.run();

			await Promise.all([
				qryQuoGetQuoteHeader.run(),
				qryQuoGetQuoteMenus.run(),
				qryQuoGetQuotes.run()
			]);

			await jsQuoMenus.loadQuote();

			showAlert("Quote saved.", "success");
			return true;

		} catch (error) {
			showAlert(
				error?.message || "Quote could not be saved.",
				"error"
			);
			return false;
		}
	}
};