export default {
	async onActiveChange() {
		const updates =
					tblPropForEvent.updatedRows || [];

		const update =
					updates[updates.length - 1];

		if (!update) {
			return false;
		}

		const proposalId =
					Number(
						update.id ||
						update.allFields?.id ||
						update.updatedFields?.id ||
						0
					);

		if (!proposalId) {
			return false;
		}

		await jsPropWorkspaces.setActive(
			proposalId,
			update.updatedFields?.active
		);

		/*
	 * Editing Proposal Active also makes
	 * that Proposal the selected workspace.
	 */
		if (
			proposalId !==
			Number(
				appsmith.store.current_proposal_id || 0
			)
		) {
			await jsPropSelector.selectProposal(
				update.allFields || update
			);
		}

		return true;
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
	 * Overlay Proposal Working State so
	 * unsaved Active changes remain visible.
	 */
		const savedRows =
					eventId > 0
		? [
			...(qryEvtGetPropsForEvent.data || [])
		].map(row => {
			const workspace =
						jsPropWorkspaces.get(
							Number(row.id || 0)
						);

			return {
				...row,

				active:
				workspace
				? workspace.active !== false
				: row.active !== false
			};
		})
		: [];

		const temporaryRows =
					Object.keys(
						jsPropWorkspaces.all()
					)
		.map(Number)
		.filter(id =>
						id < 0
					 )
		.map(id => {
			const workspace =
						jsPropWorkspaces.get(id);

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
				workspace?.active !== false,

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
					await jsPropWorkspaces
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
		if (!jsPropData.hasSelectedProposal()) {
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
					jsPropComponents
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
					await jsPropWorkspaces
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
		if (!jsPropData.hasSelectedProposal()) {
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
			await jsPropWorkspaces
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
						await qryEvtDeleteProposal.run();

			const row =
						result?.[0] || null;

			if (!row) {
				showAlert(
					"Proposal was not deleted.",
					"error"
				);

				return false;
			}

			await jsPropWorkspaces
				.discard(proposalId);

			await removeValue(
				"current_proposal_id"
			);

			await qryEvtGetPropsForEvent.run();

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
		if (!jsPropData.hasSelectedProposal()) {
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
			await jsPropWorkspaces
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
		await jsPropWorkspaces
			.discard(proposalId);

		await jsPropSelector
			.loadSelectedProposal();

		return true;
	},

	async setAccepted(accepted) {
		if (!jsPropData.hasSelectedProposal()) {
			return false;
		}

		const proposalId =
					Number(
						appsmith.store.current_proposal_id || 0
					);

		if (proposalId <= 0) {
			showAlert(
				"Save the Proposal before accepting it.",
				"warning"
			);

			return false;
		}

		await storeValue(
			"proposal_status_id",
			proposalId
		);

		await storeValue(
			"proposal_status_request",
			accepted === true
			? "Accepted"
			: "Draft"
		);

		try {
			await qryEvtSetPropStatus.run();

			await Promise.all([
				qryEvtGetPropsForEvent.run(),
				qryEvtGetSelectedProposal.run(),
				qryEvtGetItemById.run()
			]);

			await jsEvtWorkspace.resetFromSaved();

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
			jsPropWorkspaces.isDirty(
				proposalId
			)
		) {
			showAlert(
				"Save the Proposal before sending it to Order.",
				"warning"
			);

			return false;
		}

		if (jsEvtSave.isDirty()) {
			showAlert(
				"Save the Event before sending the Proposal to Order.",
				"warning"
			);

			return false;
		}


		/*
	 * Check whether Groceries already has this Event.
	 */
		await qryEvtCheckGroReplaceImpact.run();

		const impact =
					qryEvtCheckGroReplaceImpact.data?.[0] || null;


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
				mdlEvtGroReplace.name
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
					await qryEvtReplaceGroPropSource.run();

			} else {

				/*
			 * Dormant / first-time send:
			 * no downstream rebuild required.
			 */
				result =
					await qryEvtSendPropToGroceries.run();
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


			await Promise.all([
				qryEvtGetPropsForEvent.run(),
				qryEvtGetSelectedProposal.run(),
				qryEvtGetItemById.run()
			]);

			await jsEvtWorkspace.resetFromSaved();

			await removeValue(
				"evt_gro_replace_request"
			);

			await removeValue(
				"evt_gro_keep_manual"
			);

			closeModal(
				mdlEvtGroReplace.name
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
		await removeValue("evt_gro_keep_manual");

		closeModal(mdlEvtGroReplace.name);

		return true;
	},

	groReplaceEventText() {

		const request =
					appsmith.store.evt_gro_replace_request || {};

		const eventName =
					String(
						jsEvtWorkspace.current()?.name ||
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

		await qryEvtCheckGroUnorderImpact.run();

		const impact =
					qryEvtCheckGroUnorderImpact.data?.[0] || null;

		/*
	 * No Groceries source, or source has never
	 * participated in Details:
	 *
	 * remove/unorder silently.
	 */
		if (
			!impact ||
			impact.has_generated_details !== true
		) {
			return await this.confirmUnorder();
		}

		/*
	 * This source has participated in Groceries.
	 * Removing it has downstream impact, so require
	 * the same confirmation principle as
	 * Groceries -> Remove -> Update All.
	 */
		await storeValue(
			"evt_gro_unorder_request",
			{
				proposal_id: proposalId
			}
		);

		showModal(mdlEvtUnorder.name);

		return false;
	},


	async confirmUnorder() {

		const request =
					appsmith.store.evt_gro_unorder_request || {};

		try {

			const result =
						await qryEvtUnorderPropFromGroceries.run();

			const row =
						result?.[0] || null;

			if (!row?.proposal_id) {
				showAlert(
					"Proposal could not be removed from Groceries.",
					"error"
				);

				return false;
			}

			/*
		 * Proposal Inactive requested:
		 * Groceries removal succeeded, so the
		 * triggering state change may now complete.
		 */
			if (
				request.action === "inactivate_proposal"
			) {
				await storeValue(
					"proposal_active_id",
					Number(request.proposal_id || 0)
				);

				await storeValue(
					"proposal_active_request",
					false
				);

				await qryEvtSetPropActive.run();

				await removeValue(
					"proposal_active_id"
				);

				await removeValue(
					"proposal_active_request"
				);
			}

			await Promise.all([
				qryEvtGetPropsForEvent.run(),
				qryEvtGetSelectedProposal.run(),
				qryEvtGetItemById.run()
			]);

			await jsEvtWorkspace.resetFromSaved();

			await removeValue(
				"evt_gro_unorder_request"
			);

			closeModal(mdlEvtUnorder.name);

			showAlert(
				request.action === "inactivate_proposal"
				? "Proposal made Inactive and removed from Groceries."
				: "Proposal removed from Groceries.",
				"success"
			);

			return true;

		} catch (error) {

			showAlert(
				error?.message ||
				"Proposal could not be updated.",
				"error"
			);

			return false;
		}
	},

	async cancelUnorder() {

		await removeValue(
			"evt_gro_unorder_request"
		);

		closeModal(mdlEvtUnorder.name);

		return true;
	},

	currentProposal() {

		const proposalId =
					Number(appsmith.store.current_proposal_id || 0);

		if (!proposalId) {
			return null;
		}

		return (
			(qryEvtGetPropsForEvent.data || [])
			.find(
				row =>
				Number(row.id) === proposalId
			)
			||
			qryEvtGetSelectedProposal.data?.[0]
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

	async sendToQuote() {

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
				"Save the Proposal before sending it to Quote.",
				"warning"
			);

			return false;
		}

		/*
	 * Only Published State crosses to Quote.
	 */
		if (
			jsPropWorkspaces.isDirty(
				proposalId
			)
		) {
			showAlert(
				"Save the Proposal before sending it to Quote.",
				"warning"
			);

			return false;
		}

		if (jsEvtSave.isDirty()) {
			showAlert(
				"Save the Event before sending the Proposal to Quote.",
				"warning"
			);

			return false;
		}

		try {

			const result =
						await qryEvtSendPropToQuote.run();

			const row =
						result?.[0] || null;

			if (!row?.inbox_id) {
				throw new Error(
					"Proposal could not be sent to Quote."
				);
			}

			await Promise.all([
				qryEvtGetPropsForEvent.run(),
				qryEvtGetSelectedProposal.run(),
				qryEvtGetItemById.run()
			]);

			await jsEvtWorkspace.resetFromSaved();

			showAlert(
				row.resent === true
				? "Proposal resent to Quote."
				: "Proposal sent to Quote.",
				"success"
			);

			return true;

		} catch (error) {

			showAlert(
				error?.message ||
				"Proposal could not be sent to Quote.",
				"error"
			);

			return false;
		}
	},

	quoteButtonText() {
		const proposal =
					jsPropData.proposal();

		if (!proposal) {
			return "To Quote";
		}

		return (
			proposal.sent_at != null ||
			proposal.was_issued === true
		)
			? "Resend"
		: "To Quote";
	},

	async quoteButtonAction() {
		return await this.sendToQuote();
	},
};