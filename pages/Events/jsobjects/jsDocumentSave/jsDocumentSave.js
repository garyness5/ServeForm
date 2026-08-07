export default {
	async save() {
		if (jsProposalData.isProposalDraft()) {
			return await jsProposalSave.saveDraft();
		}

		if (jsProposalData.isProposalLocked()) {
			try {
				await qrySavePropHeader.run();

				await qryGetSelectedProposal.run();

				await Promise.all([
					qryGetEvtContacts.run(),
					qryGetEvtVenueContacts.run()
				]);

				await Promise.all([
					resetWidget("datEvtDate", true),
					resetWidget("selEvtVenue", true),
					resetWidget("msEvtContacts", true),
					resetWidget("msEvtVenueContacts", true)
				]);

				showAlert(
					"Operational details saved.",
					"success"
				);

				return true;
			} catch (error) {
				showAlert(
					error?.message ||
					"Operational details could not be saved.",
					"error"
				);

				return false;
			}
		}

		return await jsEventSave.saveEvent();
	}
};