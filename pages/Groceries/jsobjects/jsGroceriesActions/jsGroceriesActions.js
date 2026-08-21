export default {
	async updateToOrder(row) {

		const groEventId =
					Number(row?.gro_event_id || 0);

		if (!groEventId) {
			showAlert(
				"Could not identify the Groceries row.",
				"error"
			);

			return false;
		}

		await storeValue(
			"gro_queue_row_id",
			groEventId
		);

		await storeValue(
			"gro_queue_to_order",
			row?.to_order === true
		);

		await qryUpdateGroQueueToOrder.run();

		await qryGetGroQueue.run();

		await removeValue(
			"gro_queue_row_id"
		);

		await removeValue(
			"gro_queue_to_order"
		);

		return true;
	},

	async updateAll() {
		/*
         * Safety net:
         * ensure every currently eligible
         * Event + Ordered Proposal exists
         * in the Groceries queue.
         */
		await qryEnsureGroQueueSources.run();


		/*
         * Check whether an existing queue source
         * has become invalid upstream.
         */
		await qryCheckGroQueueSources.run();

		const queueImpact =
					qryCheckGroQueueSources.data?.[0] || {};

		const invalidSourceCount =
					Number(
						queueImpact.invalid_source_count || 0
					);

		const invalidGeneratedCount =
					Number(
						queueImpact.invalid_generated_count || 0
					);

		const hasManualValues =
					queueImpact.has_manual_values === true;


		/*
         * If an invalid source has already generated
         * Groceries work and Order contains manual values,
         * let the user decide whether those manual values
         * should be kept where possible or removed.
         */
		if (
			invalidGeneratedCount > 0 &&
			hasManualValues
		) {
			await storeValue(
				"gro_pending_update_reason",
				"invalid_source"
			);

			showModal(
				"mdlGroToOrderRemove"
			);

			return false;
		}


		/*
         * Invalid sources with no destructive manual
         * impact can be removed safely.
         */
		if (invalidSourceCount > 0) {
			await qryRemoveInvalidGroQueueSource.run();
		}


		/*
         * Check whether the user changed Groceries
         * ToOrder participation since the last rebuild.
         */
		await qryCheckGroParticipationImpact.run();

		const participationImpact =
					qryCheckGroParticipationImpact
		.data?.[0] || {};

		const addedCount =
					Number(
						participationImpact.added_count || 0
					);

		const removedCount =
					Number(
						participationImpact.removed_count || 0
					);

		const participationHasManualValues =
					participationImpact
		.has_manual_values === true;


		/*
         * Adding or removing participating sources
         * rebuilds Order.
         *
         * If manual values exist, ask first.
         */
		if (
			(addedCount > 0 || removedCount > 0) &&
			participationHasManualValues
		) {
			const affectedEvents =
						(qryGetGroQueue.data || [])
			.filter(row => row.to_order === false)
			.map(row => row.event_name)
			.filter(Boolean);

			await storeValue(
				"gro_affected_event_names",
				affectedEvents
			);

			await storeValue(
				"gro_pending_update_reason",
				"participation"
			);

			showModal("mdlGroToOrderRemove");

			return false;
		}


		return await this.runUpdateAll(true);
	},


	async runUpdateAll(keepManual = true) {

		/*
         * Any invalid upstream source may now
         * be removed before rebuilding.
         */
		await qryRemoveInvalidGroQueueSource.run();

		await storeValue(
			"gro_keep_manual",
			keepManual === true
		);

		await qryRefreshGroDetails.run();
		await qryRefreshGroOrder.run();

		/*
         * Update All always invalidates Print.
         * Print is rebuilt only when the user
         * explicitly sends Order to Print.
         */
		await qryClearGroPrint.run();


		await qryGetGroQueue.run();

		await resetWidget(
			"tblGroEvents",
			true
		);

		await tblGroEvents.setData(
			qryGetGroQueue.data
		);

		await removeValue("gro_affected_event_names");

		await removeValue(
			"gro_pending_update_reason"
		);

		await removeValue(
			"gro_keep_manual"
		);

		closeModal(
			"mdlGroToOrderRemove"
		);


		showAlert(
			keepManual
			? "Update complete. Quantities kept where possible. Print list cleared."
			: "Update complete. Quantities removed. Print list cleared.",
			"success"
		);

		return true;
	},


	async confirmUpdate(keepManual = true) {

		return await this.runUpdateAll(
			keepManual
		);
	},


	async cancelUpdate() {

		const reason =
					appsmith.store
		.gro_pending_update_reason;


		/*
         * If the user changed ToOrder selections
         * and then cancels, restore those selections
         * to the state represented by current Details.
         */
		if (reason === "participation") {
			await qryRestoreGroParticipation.run();
		}


		await qryGetGroQueue.run();

		await resetWidget(
			"tblGroEvents",
			true
		);

		await tblGroEvents.setData(
			qryGetGroQueue.data
		);

		await removeValue("gro_affected_event_names");

		await removeValue(
			"gro_pending_update_reason"
		);

		closeModal(
			"mdlGroToOrderRemove"
		);

		return true;
	},

	removeEventsText() {

		const names =
					appsmith.store.gro_affected_event_names || [];

		const list =
					names.length
		? names.map(name => "• " + name).join("\n")
		: "• Selected Event(s)";

		return (
			"The following Event(s) will be removed from the Order:\n\n" +
			list
		);
	},
};