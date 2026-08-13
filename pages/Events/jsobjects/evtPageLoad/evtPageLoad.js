export default {
	async load() {
		await storeValue(
			"current_client_id",
			"1315144c-801a-4371-aae4-52f2a78873d1"
		);

		/*
		 * New Event page session.
		 * Clear stale Event and Proposal Working State first.
		 */
		await jsEventWorkspace.clear();

		await removeValue("current_proposal_id");
		await removeValue("proposal_workspaces");
		await removeValue("evt_components_local_rows");

		/*
		 * Load saved Event truth explicitly.
		 */
		await getEvtItemById.run();

		/*
		 * Establish Event Working State from saved truth.
		 */
		await jsEventWorkspace.initialize();

		/*
		 * Load supporting page data.
		 * No Proposal is selected automatically.
		 */
		await Promise.all([
			qryGetEvtCategories.run(),
			qryGetEvtComponentItems.run(),
			qryGetEvtCustomers.run(),
			qryGetEvtContacts.run(),
			qryGetEvtVenues.run(),
			qryGetEvtVenueContacts.run(),
			qryGetProposalsForEvent.run()
		]);

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