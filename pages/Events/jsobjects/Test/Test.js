export default {
	debugTableState() {
		return {
			updatedRows:
				tblEvtComponents.updatedRows || [],

			isDirty:
				jsProposalWorkspaces.isDirty(),

			proposalMode:
				jsProposalData.proposalMode()
		};
	}
};