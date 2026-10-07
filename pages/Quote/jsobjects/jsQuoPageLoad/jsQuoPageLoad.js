export default {
	async load() {
		const ready = await jsAppInit.init();
		if (!ready) return false;

		await removeValue("quotationProposalId");
		await removeValue("quotationInboxId");
		await removeValue("quotationQuoteId");
		await jsQuoMenus.clear();

		const eventId = Number(
			appsmith.store.quotationEventId || 0
		);

		if (eventId <= 0) return true;

		await Promise.all([
			qryQuoGetEventHeader.run(),
			qryQuoGetEventProposals.run()
		]);

		const proposals = qryQuoGetEventProposals.data || [];

		if (proposals.length > 0) {
			await jsQuoProposals.select(proposals[0]);
		}

		return true;
	}
};
