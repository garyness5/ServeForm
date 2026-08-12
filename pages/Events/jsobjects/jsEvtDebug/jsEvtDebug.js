export default {
	headerPayload() {
		return jsEventSave
			.headerSnapshotFromPage();
	},

	fullSaveRequest() {
		const dirtyIds =
					jsProposalWorkspaces
		.dirtyProposalIds();

		return {
			event_id:
			Number(
				appsmith.store.current_event_id || 0
			),

			header:
			this.headerPayload(),

			proposals:
			dirtyIds.map(id =>
									 jsEventActionGuard
									 .proposalPayload(id)
									)
		};
	},

	async testQueryParams() {
		const request =
					this.fullSaveRequest();

		await storeValue(
			"event_document_save_request",
			request
		);

		try {
			return await qryDebugEventDocumentParams.run();
		} finally {
			await removeValue(
				"event_document_save_request"
			);
		}
	},
};