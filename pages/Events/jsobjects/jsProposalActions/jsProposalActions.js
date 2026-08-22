export default {
	async setActive(row, active) {
		const proposalId =
					Number(
						row?.id ||
						row?.allFields?.id ||
						row?.updatedFields?.id ||
						0
					);

		if (!proposalId) {
			showAlert(
				"Proposal could not be identified.",
				"warning"
			);

			return false;
		}

		await storeValue(
			"proposal_active_request",
			active === true
		);

		await storeValue(
			"proposal_active_id",
			proposalId
		);

		try {
			await qrySetEvtProposalActive.run();

			await qryGetProposalsForEvent.run();

			if (
				proposalId ===
				Number(
					appsmith.store.current_proposal_id || 0
				)
			) {
				await qryGetSelectedProposal.run();
			}

			return true;

		} finally {
			await removeValue(
				"proposal_active_request"
			);

			await removeValue(
				"proposal_active_id"
			);
		}
	},

	async onActiveChange() {
		const updates =
					tblPropForEvent.updatedRows || [];

		const update =
					updates[updates.length - 1];

		if (!update) {
			return false;
		}

		return await this.setActive(
			update,
			update.updatedFields?.active
		);
	},

	filteredProposals() {
		const filter =
					selPropActiveFilter.selectedOptionValue ||
					"All";

		const eventId =
					Number(
						appsmith.store.current_event_id || 0
					);

		/*
	 * Saved Proposal rows belong only to
	 * a persisted Event.
	 *
	 * When eventId = 0, this is a new/duplicated
	 * Event existing only in Working State.
	 * Never expose stale query rows from the
	 * source Event.
	 */
		const savedRows =
					eventId > 0
		? [
			...(qryGetProposalsForEvent.data || [])
		]
		: [];

		const temporaryRows =
					Object.keys(
						jsProposalWorkspaces.all()
					)
		.map(Number)
		.filter(id =>
						id < 0
					 )
		.map(id => {
			const workspace =
						jsProposalWorkspaces.get(id);

			return {
				id:
				id,

				event_id:
				eventId,

				proposal_no:
				null,

				temp_proposal_no:
				workspace?.temp_proposal_no ??
				null,

				proposal_number:
				null,

				proposal_status:
				"Draft",

				active:
				true,

				updated_at:
				null,

				sent_at:
				null,

				closed_at:
				null,

				was_issued:
				false,

				is_closed:
				false,

				is_editable:
				true,

				is_new:
				true,

				source_proposal_id:
				workspace?.source_proposal_id ??
				null,

				proposal_title:
				workspace?.temp_proposal_no != null
				? `Draft ${workspace.temp_proposal_no}`
				: "New Proposal"
			};
		});

		let rows = [
			...savedRows,
			...temporaryRows
		];

		if (filter === "Active") {
			return rows.filter(row =>
												 row.active !== false
												);
		}

		if (filter === "Inactive") {
			return rows.filter(row =>
												 row.active === false
												);
		}

		return rows;
	},

	async addNew() {
		const tempId =
					await jsProposalWorkspaces
		.createTemporary(
			[],
			null
		);

		await resetWidget(
			"tblEvtComponents",
			true
		);

		return tempId;
	},

	async duplicateCurrent() {
		if (!jsProposalData.hasSelectedProposal()) {
			showAlert(
				"Select a Proposal first.",
				"warning"
			);

			return false;
		}

		const sourceProposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		const currentRows =
					jsProposalComponents
		.effectiveRows();

		/*
	 * Duplicate creates a new unsaved workspace
	 * from exactly what is currently in front
	 * of the user.
	 *
	 * The source workspace is preserved unchanged,
	 * including any unsaved work.
	 */
		const tempId =
					await jsProposalWorkspaces
		.createTemporary(
			currentRows,
			sourceProposalId > 0
			? sourceProposalId
			: null
		);

		await resetWidget(
			"tblEvtComponents",
			true
		);

		return tempId;
	},

	async deleteCurrent() {
		if (!jsProposalData.hasSelectedProposal()) {
			showAlert(
				"Select a Proposal first.",
				"warning"
			);

			return false;
		}

		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		/*
	 * Unsaved temporary Proposal.
	 * Nothing exists in Supabase.
	 */
		if (proposalId < 0) {
			await jsProposalWorkspaces
				.discard(proposalId);

			await removeValue(
				"current_proposal_id"
			);

			await resetWidget(
				"tblEvtComponents",
				true
			);

			return true;
		}

		await storeValue(
			"proposal_delete_id",
			proposalId
		);

		try {
			const result =
						await qryDeleteEventProposal.run();

			const row =
						result?.[0] || null;

			if (!row) {
				showAlert(
					"Proposal was not deleted.",
					"error"
				);

				return false;
			}

			await jsProposalWorkspaces
				.discard(proposalId);

			await removeValue(
				"current_proposal_id"
			);

			await qryGetProposalsForEvent.run();

			await resetWidget(
				"tblEvtComponents",
				true
			);

			return true;

		} finally {
			await removeValue(
				"proposal_delete_id"
			);
		}
	},

	selectedProposalIndex() {
		const currentId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		if (!currentId) {
			return -1;
		}

		const rows =
					this.filteredProposals();

		return rows.findIndex(row =>
													Number(row.id || 0) === currentId
												 );
	},

	async discardCurrent() {
		if (!jsProposalData.hasSelectedProposal()) {
			return false;
		}

		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		/*
	 * Unsaved temporary Proposal:
	 * remove the workspace completely.
	 */
		if (proposalId < 0) {
			await jsProposalWorkspaces
				.discard(proposalId);

			await removeValue(
				"current_proposal_id"
			);

			await resetWidget(
				"tblEvtComponents",
				true
			);

			return true;
		}

		/*
	 * Saved Proposal:
	 * discard dirty Working State and
	 * rebuild it from Published State.
	 */
		await jsProposalWorkspaces
			.discard(proposalId);

		await jsProposalSelector
			.loadSelectedProposal();

		return true;
	},

	async setAccepted(accepted) {
		if (!jsProposalData.hasSelectedProposal()) {
			return false;
		}

		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		/*
	 * Workflow status requires a real,
	 * persisted Proposal.
	 */
		if (proposalId <= 0) {
			showAlert(
				"Save the Proposal before accepting it.",
				"warning"
			);

			return false;
		}

		const proposal =
					jsProposalData.proposal();

		const newStatus =
					accepted === true
		? "Accepted"
		: proposal.was_issued === true ||
					proposal.sent_at != null
		? "Issued"
		: "Draft";

		await storeValue(
			"proposal_status_id",
			proposalId
		);

		await storeValue(
			"proposal_status_request",
			newStatus
		);

		try {
			await qrySetEvtProposalStatus.run();

			await qryGetProposalsForEvent.run();
			await qryGetSelectedProposal.run();

			return true;

		} finally {
			await removeValue(
				"proposal_status_id"
			);

			await removeValue(
				"proposal_status_request"
			);
		}
	},

	async sendToOrder() {

		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		if (!proposalId) {
			showAlert(
				"Select a Proposal first.",
				"warning"
			);

			return false;
		}

		if (proposalId < 0) {
			showAlert(
				"Save the Proposal before sending it to Order.",
				"warning"
			);

			return false;
		}

		if (
			jsProposalWorkspaces.isDirty(
				proposalId
			)
		) {
			showAlert(
				"Save the Proposal before sending it to Order.",
				"warning"
			);

			return false;
		}

		if (jsEventSave.isDirty()) {
			showAlert(
				"Save the Event before sending the Proposal to Order.",
				"warning"
			);

			return false;
		}


		/*
	 * Check whether Groceries already has this Event.
	 */
		await qryCheckEvtGroReplaceImpact.run();

		const impact =
					qryCheckEvtGroReplaceImpact.data?.[0] || null;


		/*
	 * Same Proposal already owns the Groceries row.
	 * Sending again is harmless/idempotent.
	 */
		if (
			impact &&
			Number(impact.current_proposal_id || 0) === proposalId
		) {
			return await this.confirmSendToOrder(true);
		}


		/*
	 * Different Proposal, but the current Groceries source
	 * has already generated Details.
	 *
	 * Ask before replacing it.
	 */
		if (
			impact &&
			impact.has_generated_details === true
		) {
			await storeValue(
				"evt_gro_replace_request",
				{
					proposal_id: proposalId,
					event_id:
					Number(
						appsmith.store.current_event_id || 0
					),

					current_proposal_id:
					Number(
						impact.current_proposal_id || 0
					),

					current_proposal_number:
					impact.current_proposal_number || "",

					has_manual_values:
					impact.has_manual_values === true
				}
			);

			showModal(
				"mdlEvtGroReplace"
			);

			return false;
		}


		/*
	 * Dormant / never-generated Groceries source:
	 * replace silently.
	 */
		return await this.confirmSendToOrder(true);
	},

	async confirmSendToOrder(keepManual = true) {

		try {

			const request =
						appsmith.store.evt_gro_replace_request || null;

			let result = null;

			/*
		 * Exploded replacement:
		 * remove old Event Details,
		 * rebuild Order from remaining Details,
		 * clear Print,
		 * replace Proposal source,
		 * leave replacement dormant.
		 */
			if (request) {

				await storeValue(
					"evt_gro_keep_manual",
					keepManual === true
				);

				result =
					await qryReplaceGroProposalSource.run();

			} else {

				/*
			 * Dormant / first-time send:
			 * no downstream rebuild required.
			 */
				result =
					await qrySendProposalToGroceries.run();
			}


			const row =
						result?.[0] || null;

			if (!row?.gro_event_id) {
				showAlert(
					"Proposal could not be sent to Groceries.",
					"error"
				);

				return false;
			}


			await qryGetProposalsForEvent.run();
			await qryGetSelectedProposal.run();

			await removeValue(
				"evt_gro_replace_request"
			);

			await removeValue(
				"evt_gro_keep_manual"
			);

			closeModal(
				"mdlEvtGroReplace"
			);

			showAlert(
				"Proposal sent to Groceries.",
				"success"
			);

			return true;

		} catch (error) {

			await removeValue(
				"evt_gro_keep_manual"
			);

			showAlert(
				error?.message ||
				"Proposal could not be sent to Groceries.",
				"error"
			);

			return false;
		}
	},

	async cancelGroReplace() {

		await removeValue("evt_gro_replace_request");
		await removeValue("evt_gro_unorder_request");
		await removeValue("evt_gro_keep_manual");

		closeModal("mdlEvtGroReplace");

		return true;
	},

	groReplaceEventText() {

		const request =
					appsmith.store.evt_gro_replace_request || {};

		const eventName =
					String(
						jsEventWorkspace.current()?.name ||
						"This Event"
					).trim();

		const proposalRef =
					String(
						request.current_proposal_number ||
						"the current Proposal"
					).trim();

		return (
			eventName +
			" is already represented in the Order using " +
			proposalRef +
			"."
		);
	},

	async unorder() {

		const proposalId =
					Number(appsmith.store.current_proposal_id || 0);

		if (!proposalId) {
			showAlert(
				"Select a Proposal first.",
				"warning"
			);
			return false;
		}

		await qryCheckEvtGroReplaceImpact.run();

		const impact =
					qryCheckEvtGroReplaceImpact.data?.[0] || null;

		if (
			impact &&
			impact.has_generated_details === true &&
			impact.has_manual_values === true
		) {
			await storeValue(
				"evt_gro_unorder_request",
				{ proposal_id: proposalId }
			);

			showModal("mdlEvtGroReplace");

			return false;
		}

		return await this.confirmUnorder(true);
	},


	async confirmUnorder(keepManual = true) {

		try {

			await storeValue(
				"evt_gro_keep_manual",
				keepManual === true
			);

			const result =
						await qryUnorderPropFromGroceries.run();

			const row =
						result?.[0] || null;

			if (!row?.proposal_id) {
				showAlert(
					"Proposal could not be Unordered.",
					"error"
				);
				return false;
			}

			await qryGetProposalsForEvent.run();
			await qryGetSelectedProposal.run();

			await removeValue("evt_gro_unorder_request");
			await removeValue("evt_gro_keep_manual");

			closeModal("mdlEvtGroReplace");

			showAlert(
				"Proposal removed from Groceries.",
				"success"
			);

			return true;

		} catch (error) {

			await removeValue("evt_gro_keep_manual");

			showAlert(
				error?.message ||
				"Proposal could not be Unordered.",
				"error"
			);

			return false;
		}
	},

	currentProposal() {

		const proposalId =
					Number(appsmith.store.current_proposal_id || 0);

		if (!proposalId) {
			return null;
		}

		return (
			(qryGetProposalsForEvent.data || [])
			.find(
				row =>
				Number(row.id) === proposalId
			)
			||
			qryGetSelectedProposal.data?.[0]
			||
			null
		);
	},


	isOrdered() {

		return (
			this.currentProposal()?.proposal_status === "Ordered"
		);
	},


	orderButtonText() {

		return this.isOrdered()
			? "Unorder"
		: "To Order";
	},


	async orderButtonAction() {

		return this.isOrdered()
			? await this.unorder()
		: await this.sendToOrder();
	},

	async updateOrder() {

		const proposalId =
					Number(appsmith.store.current_proposal_id || 0);

		if (!proposalId || proposalId < 0) {

			showAlert(
				"Select a saved Proposal first.",
				"warning"
			);

			return false;
		}


		if (!this.isOrdered()) {

			showAlert(
				"Only an Ordered Proposal can update the Order.",
				"warning"
			);

			return false;
		}


		/*
	 * Groceries must receive saved truth only.
	 */
		if (
			jsProposalWorkspaces.isDirty(
				proposalId
			)
		) {

			showAlert(
				"Save the Proposal before updating the Order.",
				"warning"
			);

			return false;
		}


		if (jsEventSave.isDirty()) {

			showAlert(
				"Save the Event before updating the Order.",
				"warning"
			);

			return false;
		}


		try {

			const result =
						await qrySendProposalToGroceries.run();

			const row =
						result?.[0] || null;

			if (!row?.gro_event_id) {

				showAlert(
					"Order could not be updated.",
					"error"
				);

				return false;
			}


			await qryGetProposalsForEvent.run();
			await qryGetSelectedProposal.run();


			showAlert(
				"Order updated. Click Update All in Groceries to apply the changes.",
				"success"
			);

			return true;

		} catch (error) {

			showAlert(
				error?.message ||
				"Order could not be updated.",
				"error"
			);

			return false;
		}
	},
};