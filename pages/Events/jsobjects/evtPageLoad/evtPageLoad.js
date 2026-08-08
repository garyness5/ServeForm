export default {
	async load() {
		await storeValue(
			"current_client_id",
			"1315144c-801a-4371-aae4-52f2a78873d1"
		);

		await Promise.all([
			qryGetEvtCategories.run(),
			qryGetEvtComponentItems.run(),
			qryGetEvtCustomers.run(),
			qryGetEvtContacts.run(),
			qryGetEvtVenues.run(),
			qryGetEvtVenueContacts.run()
		]);

		await qryGetProposalsForEvent.run();

		await jsProposalSelector
			.initialize(true);

		await storeValue(
			"accEvtCustomerNotes",
			false
		);

		await storeValue(
			"accEvtInternalNotes",
			false
		);

		return true;
	}
};