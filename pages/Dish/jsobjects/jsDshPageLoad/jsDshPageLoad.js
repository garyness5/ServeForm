export default {
	async loadLookups() {
		await qryGetDshCategories.run();
		await qryGetDshFormats.run();
		await qryGetDshDietTags.run();
		await qryGetDshComponentUnits.run();
		await qryGetDshComponentItems.run();

		return true;
	},

	async loadExistingDish() {
		await storeValue(
			"dsh_debug_state",
			{
				step: "loadExistingDish start"
			}
		);

		const dishRows =
					await qryGetDshItemById.run();

		if (
			!Array.isArray(dishRows) ||
			dishRows.length === 0
		) {
			await this.loadNewDish();
			return false;
		}

		const selectedDietTags =
					await qryGetSelectedDshDietTags.run();

		await storeValue(
			"dsh_debug_diet",
			{
				returned:
				selectedDietTags,

				queryData:
				qryGetSelectedDshDietTags.data,

				normalizedReturned:
				jsDshWorkspace.normalizeDietTags(
					selectedDietTags || []
				),

				normalizedQueryData:
				jsDshWorkspace.normalizeDietTags(
					qryGetSelectedDshDietTags.data || []
				)
			}
		);

		await qryGetDshComponents.run();

		await jsDshCompTable.loadFromQuery();

		const saved = {
			header:
			jsDshWorkspace.savedHeaderFromQuery(),

			diet_tags:
			jsDshWorkspace.normalizeDietTags(
				selectedDietTags || []
			),

			components:
			qryGetDshComponents.data || []
		};

		await jsDshWorkspace.setBaseline(saved);
		await jsDshWorkspace.setWorkspace(saved);

		await storeValue(
			"dsh_debug_state",
			{
				step: "loadExistingDish complete",
				queryCount:
				(qryGetDshComponents.data || []).length,
				baselineCount:
				(appsmith.store.dish_baseline?.components || []).length,
				workspaceCount:
				(appsmith.store.dish_workspace?.components || []).length
			}
		);

		return true;
	},

	async loadNewDish() {
		await storeValue(
			"current_dish_id",
			0
		);

		await removeValue(
			"dsh_components_local_rows"
		);

		await jsDshWorkspace.initializeNew();

		await jsDshCompTable.setRows([]);

		await resetWidget("inpDshName", true);
		await resetWidget("selDshCategory", true);
		await resetWidget("selDshFormat", true);
		await resetWidget("chkDshActive", true);
		await resetWidget("inpDshYieldQty", true);
		await resetWidget("selDshYieldUnit", true);
		await resetWidget("inpDshExtraPercent", true);
		await resetWidget("msDshDietTags", true);
		await resetWidget("rteDshNotes", true);
		await resetWidget("tblDshComponents", true);

		return true;
	},

	async onPageLoad() {
		const initialized =
					await jsAppInit.init();

		if (!initialized) {
			await storeValue(
				"dsh_debug_state",
				{
					step: "jsAppInit failed"
				}
			);

			return false;
		}

		await jsDshWorkspace.clear();

		await this.loadLookups();

		const dishId =
					Number(
						appsmith.store.current_dish_id || 0
					);

		await storeValue(
			"dsh_debug_state",
			{
				step: "lookups complete",
				dishId: dishId
			}
		);

		if (dishId > 0) {
			await this.loadExistingDish();
		} else {
			await this.loadNewDish();
		}

		return true;
	}
};