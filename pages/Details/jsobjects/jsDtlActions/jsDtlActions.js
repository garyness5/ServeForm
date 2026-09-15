export default {

	async updateAll() {

		await qryDtlCheckQSources.run();

		const queueImpact =
					qryDtlCheckQSources.data?.[0] || {};

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
	 * Details does not own destructive
	 * Groceries participation decisions.
	 *
	 * If an invalid source has already
	 * generated Details / Order and manual
	 * purchasing values may be affected,
	 * resolve it from Groceries.
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


		/*
	 * Invalid queue-only sources can be
	 * removed without a destructive decision.
	 */
		if (invalidSourceCount > 0) {
			await qryDtlRemoveInvalidQSources.run();
		}


		await qryDtlCheckImpact.run();

		const participationImpact =
					qryDtlCheckImpact.data?.[0] || {};

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
	 * Details has no participation controls.
	 *
	 * If Groceries To Order participation changed
	 * and manual purchasing values may be affected,
	 * resolve that decision from Groceries.
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

		await qryDtlRefreshDetails.run();
		await qryDtlRefreshOrder.run();
		await qryDtlClearPrint.run();

		await qryDtlGetDetails.run();

		await resetWidget(
			"tblGroDetails",
			true
		);

		await tblGroDetails.setData(
			qryDtlGetDetails.data
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