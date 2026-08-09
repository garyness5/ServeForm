export default {
	async save() {
		/*
		 * Selected Proposal:
		 * Save everything currently in front of us.
		 */
		if (
			jsProposalData
			.hasSelectedProposal()
		) {
			try {
				const saved =
							await jsProposalSave
				.saveDraft();

				return saved === true;
			} catch (error) {
				showAlert(
					error?.message ||
					"Proposal could not be saved.",
					"error"
				);

				return false;
			}
		}

		/*
		 * Existing Event with no Proposal selected.
		 */
		const eventId =
					Number(
						appsmith.store
						.current_event_id ||
						0
					);

		if (eventId > 0) {
			try {
				return await jsEventSave
					.saveEvent();
			} catch (error) {
				showAlert(
					error?.message ||
					"Event could not be saved.",
					"error"
				);

				return false;
			}
		}

		/*
		 * Event creation now belongs to
		 * the Add Event flow.
		 */
		showAlert(
			"Create the Event first using Add Event.",
			"warning"
		);

		return false;
	}
};