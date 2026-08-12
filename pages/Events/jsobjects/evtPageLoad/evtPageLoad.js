export default {
	async load() {
		await storeValue(
			"current_client_id",
			"1315144c-801a-4371-aae4-52f2a78873d1"
		);

		/*
		 * Fresh page load = saved Event truth.
		 * Remove temporary unsaved Event selections.
		 */
		await removeValue(
			"evt_working_customer_id"
		);

		await removeValue(
			"evt_working_contact_ids"
		);

		await removeValue(
			"evt_working_venue_id"
		);

		await removeValue(
			"evt_working_venue_contact_ids"
		);

		/*
		 * No Proposal opens automatically.
		 */
		await removeValue(
			"current_proposal_id"
		);

		await removeValue(
			"proposal_workspaces"
		);

		await removeValue(
			"evt_components_local_rows"
		);

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