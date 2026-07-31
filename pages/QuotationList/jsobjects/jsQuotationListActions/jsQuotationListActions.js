export default {
	async openEvent(row) {
		if (!row?.event_id || !row?.latest_proposal_id) {
			showAlert("No Proposal is available for this Event.", "warning");
			return;
		}

		await qryMarkQuotationProposalRead.run({
			proposalId: row.latest_proposal_id
		});

		await storeValue("quotationEventId", row.event_id);
		await storeValue("quotationProposalId", row.latest_proposal_id);

		navigateTo("Quotation");
	},

	async setActive(row, isActive) {
		if (!row?.event_id) {
			showAlert("No Event was selected.", "warning");
			return;
		}

		await qrySetQuotationEventActive.run({
			eventId: row.event_id,
			isActive
		});

		await qryGetQuotationList.run();
	}
};