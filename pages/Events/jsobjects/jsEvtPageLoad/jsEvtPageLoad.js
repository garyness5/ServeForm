export default {
	async load() {
		await storeValue(
			"current_client_id",
			"1315144c-801a-4371-aae4-52f2a78873d1"
		);

		const openMode =
					String(
						appsmith.store.event_open_mode || ""
					);

		/*
		 * Fresh Events-page session.
		 */
		await jsEventWorkspace.clear();

		await removeValue(
			"current_proposal_id"
		);

		await removeValue(
			"proposal_workspaces"
		);

		/*
		 * Load the selected saved source Event.
		 */
		await qryGetEvtItemById.run();

		await jsEventWorkspace.initialize();

		/*
		 * Load all supporting data required by
		 * normal Events operation and Event Duplicate.
		 */
		await Promise.all([
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

		/*
		 * ==================================================
		 * EVENTLIST DUPLICATE HANDOFF
		 *
		 * The source has just been loaded from saved truth,
		 * so there is no dirty source workspace to guard.
		 *
		 * Use the same canonical Events Duplicate engine,
		 * but call it directly.
		 * ==================================================
		 */
		if (openMode === "duplicate") {
			await removeValue(
				"event_open_mode"
			);

			const staged =
						await jsEventActions
			.stageDuplicateSnapshot();

			if (!staged) {
				showAlert(
					"Event duplicate could not be prepared.",
					"error"
				);

				return false;
			}

			return await jsEventActions
				.openStagedDuplicate();
		}

		await removeValue(
			"event_open_mode"
		);

		return true;
	}
};