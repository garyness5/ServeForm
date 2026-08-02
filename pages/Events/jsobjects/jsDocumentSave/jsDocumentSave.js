export default {
	async save() {
		if (jsProposalData.isProposalLocked()) {
			showAlert(
				"This Proposal is locked. Duplicate it to make changes.",
				"warning"
			);
			return false;
		}

		if (jsProposalData.isProposalDraft()) {
			return await jsProposalSave.saveDraft();
		}

		return await evtSave.saveEvent();
	}
};