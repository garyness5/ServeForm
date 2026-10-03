export default {
	async load() {
		const ready = await jsAppInit.init();

		if (!ready) {
			return false;
		}

		/*
		 * Fresh Quote-page session.
		 * Opening an Event must not automatically
		 * select a Proposal or Quote.
		 */
		await removeValue("quotationProposalId");
		await removeValue("quotationQuoteId");

		const eventId = Number(
			appsmith.store.quotationEventId || 0
		);

		if (eventId <= 0) {
			return true;
		}

		/*
		 * Load Event header only.
		 */
		await qryQuoGetEventHeader.run();

		return true;
	}
};