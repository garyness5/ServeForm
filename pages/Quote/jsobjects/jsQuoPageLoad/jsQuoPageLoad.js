export default {
	async load() {
		const ready = await jsAppInit.init();

		if (!ready) {
			return false;
		}

		// Fresh Quote Event workspace.
		// Opening an Event must not auto-select a Proposal or Quote.
		await removeValue("quotationProposalId");
		await removeValue("quotationInboxId");
		await removeValue("quotationQuoteId");

		const eventId = Number(
			appsmith.store.quotationEventId || 0
		);

		if (eventId <= 0) {
			return true;
		}

		// Load Event-owned header and received Proposal inbox.
		await Promise.all([
			qryQuoGetEventHeader.run(),
			qryQuoGetReceivedMenusReceived.run()
		]);

		return true;
	}
};