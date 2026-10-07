export default {
	async select(row) {
		const proposalId = Number(row?.proposal_id || 0);
		const inboxId = Number(row?.inbox_id || 0);

		if (!proposalId || !inboxId) {
			await removeValue("quotationProposalId");
			await removeValue("quotationInboxId");
			await removeValue("quotationQuoteId");
			return false;
		}

		await storeValue("quotationProposalId", proposalId);
		await storeValue("quotationInboxId", inboxId);
		await removeValue("quotationQuoteId");

		await Promise.all([
			qryQuoGetReceivedMenus.run(),
			qryQuoGetReceivedMenuLines.run(),
			qryQuoGetQuotes.run()
		]);

		return true;
	}
};