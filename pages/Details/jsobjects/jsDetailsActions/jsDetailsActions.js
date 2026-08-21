export default {

	async updateAll() {

		await qryEnsureGroQueueSources.run();

		await qryCheckGroQueueSources.run();

		const queueImpact =
					qryCheckGroQueueSources.data?.[0] || {};

		const invalidSourceCount =
					Number(queueImpact.invalid_source_count || 0);

		const invalidGeneratedCount =
					Number(queueImpact.invalid_generated_count || 0);

		const hasManualValues =
					queueImpact.has_manual_values === true;


		/*
		 * An invalid upstream source has already
		 * generated Details/Order and manual
		 * quantities exist.
		 */
		if (
			invalidGeneratedCount > 0 &&
			hasManualValues
		) {
			showAlert(
				"Update this from the Groceries page. Manual Order quantities may be affected.",
				"warning"
			);

			return false;
		}


		if (invalidSourceCount > 0) {
			await qryRemoveInvalidGroQueueSource.run();
		}


		await qryCheckGroParticipationImpact.run();

		const participationImpact =
					qryCheckGroParticipationImpact.data?.[0] || {};

		const addedCount =
					Number(participationImpact.added_count || 0);

		const removedCount =
					Number(participationImpact.removed_count || 0);

		const participationHasManualValues =
					participationImpact.has_manual_values === true;


		/*
		 * Details has no participation controls.
		 * If a Groceries participation change is
		 * waiting and manual quantities exist,
		 * resolve it from Groceries.
		 */
		if (
			(addedCount > 0 || removedCount > 0) &&
			participationHasManualValues
		) {
			showAlert(
				"Update this from the Groceries page. Manual Order quantities may be affected.",
				"warning"
			);

			return false;
		}


		return await this.runUpdateAll();
	},


	async runUpdateAll() {

		await storeValue(
			"gro_keep_manual",
			true
		);

		await qryRefreshGroDetails.run();
		await qryRefreshGroOrder.run();
		await qryClearGroPrint.run();

		await qryGetGroDetails.run();

		await resetWidget(
			"tblGroDetails",
			true
		);

		await tblGroDetails.setData(
			qryGetGroDetails.data
		);

		await removeValue(
			"gro_keep_manual"
		);

		showAlert(
			"Update complete. Order refreshed and Print cleared.",
			"success"
		);

		return true;
	}
};