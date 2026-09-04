export default {
	pendingAction: null,

	async safeReset(widgetName) {
		try {
			await resetWidget(widgetName, true);
		} catch (e) {
			return null;
		}
	},

	saveSnapshot() {
		return (
			appsmith.store.dish_save_snapshot ||
			jsDshWorkspace.current()
		);
	},

	headerPayload() {
		return {
			...this.saveSnapshot().header
		};
	},

	dietTagsPayload() {
		return (
			this.saveSnapshot().diet_tags || []
		).map(id => ({
			tag_id: Number(id)
		}));
	},

	componentsPayload() {
		return (
			this.saveSnapshot().components || []
		).map(row => ({
			item_type:
			row.item_type || null,

			ingredient_id:
			row.item_type === "ingredient"
			? Number(row.ingredient_id) || null
			: null,

			child_recipe_id:
			row.item_type === "recipe"
			? Number(row.child_recipe_id) || null
			: null,

			qty:
			row.qty == null
			? null
			: Number(row.qty),

			unit_id:
			row.unit_id == null
			? null
			: Number(row.unit_id),

			apply_wastage:
			row.apply_wastage !== false,

			active:
			row.active !== false
		}));
	},

	requiredSaveMessage(snapshot) {
		const name =
					String(
						snapshot?.header?.name || ""
					).trim();

		return name
			? null
		: "Dish Name is required before you can save.";
	},

	validateBeforeSave(snapshot) {
		const message =
					this.requiredSaveMessage(snapshot);

		if (message) {
			showAlert(
				message,
				"warning"
			);

			return false;
		}

		return true;
	},

	isDirty() {
		return jsDshWorkspace.isDirty();
	},

	impactCount() {
		const impact =
					qryGetDshImpactCount.data?.[0] || {};

		return Number(
			impact.menu_count || 0
		);
	},

	async saveDish() {
		try {
			await jsDshCompTable.syncFromTable();

			const snapshot =
						jsDshWorkspace.current();

			if (!this.validateBeforeSave(snapshot)) {
				return false;
			}

			await storeValue(
				"dish_save_snapshot",
				snapshot
			);

			const result =
						await qrySaveDish.run();

			const savedId =
						Number(
							result?.[0]?.dish_id || 0
						);

			if (!savedId) {
				showAlert(
					"Dish was not saved.",
					"error"
				);

				return false;
			}

			await storeValue(
				"current_dish_id",
				savedId
			);

			await Promise.all([
				qryGetDshItemById.run(),
				qryGetSelectedDshDietTags.run(),
				qryGetDshComponents.run()
			]);

			await jsDshCompTable.loadFromQuery();

			await jsDshWorkspace.initializeFromSaved();

			await removeValue(
				"dish_save_snapshot"
			);

			await storeValue(
				"Dish_mode",
				"edit"
			);

			await removeValue(
				"Dish_open_mode"
			);

			showAlert(
				"Dish saved.",
				"success"
			);

			return true;

		} catch (error) {
			await removeValue(
				"dish_save_snapshot"
			);

			showAlert(
				error?.message || "Dish was not saved.",
				"error"
			);

			return false;
		}
	},

	async closeDish() {
		await jsDshWorkspace.capture();

		if (this.isDirty()) {
			this.pendingAction = "close";

			showModal(
				mdlDshUnsavedChanges.name
			);

			return false;
		}

		navigateTo(
			"DishList"
		);

		return true;
	},

	async saveAndCloseDish() {
		const saved =
					await this.saveDish();

		if (!saved) {
			return false;
		}

		closeModal(
			mdlDshUnsavedChanges
		);

		navigateTo(
			"DishList"
		);

		return true;
	},

	async closeWithoutSaving() {
		closeModal(
			mdlDshUnsavedChanges
		);

		navigateTo(
			"DishList"
		);

		return true;
	},

	async startNewDish() {
		await storeValue(
			"current_dish_id",
			0
		);

		await storeValue(
			"Dish_mode",
			"add"
		);

		await removeValue(
			"Dish_open_mode"
		);

		await jsDshCompTable.clearRows();

		await jsDshWorkspace.initializeNew();

		await this.safeReset("inpDshName");
		await this.safeReset("selDshCategory");
		await this.safeReset("selDshFormat");
		await this.safeReset("chkDshActive");
		await this.safeReset("inpDshServes");
		await this.safeReset("inpDshExtraPercent");
		await this.safeReset("msDshDietTags");
		await this.safeReset("rteDshNotes");
		await this.safeReset("tblDshComponents");

		return true;
	},

	async addDish() {
		await jsDshWorkspace.capture();

		if (this.isDirty()) {
			this.pendingAction = "add";

			showModal(
				mdlDshUnsavedChanges.name
			);

			return false;
		}

		return await this.startNewDish();
	},

	async saveAndNew() {
		const saved =
					await this.saveDish();

		if (!saved) {
			return false;
		}

		closeModal(
			mdlDshUnsavedChanges
		);

		return await this.startNewDish();
	},

	async addWithoutSaving() {
		closeModal(
			mdlDshUnsavedChanges
		);

		return await this.startNewDish();
	},

	async duplicateDish() {
		const sourceId =
					Number(
						appsmith.store.current_dish_id || 0
					);

		if (!sourceId) {
			showAlert(
				"This Dish has not been saved yet.",
				"warning"
			);

			return false;
		}

		const source =
					await jsDshWorkspace.capture();

		const currentName =
					String(
						source.header.name || ""
					).trim();

		const duplicate = {
			header: {
				...source.header,
				name: `${currentName} - Copy`
			},

			diet_tags: [
				...(source.diet_tags || [])
			],

			components:
			(source.components || [])
			.map(row => ({
				...row,
				id: null,
				dish_id: 0,
				draft_row_id:
				jsDshCompTable.makeDraftId()
			}))
		};

		await storeValue(
			"current_dish_id",
			0
		);

		await storeValue(
			"Dish_mode",
			"duplicate"
		);

		await removeValue(
			"Dish_open_mode"
		);

		await jsDshWorkspace.initializeDuplicate(
			duplicate
		);

		await jsDshCompTable.setRows(
			duplicate.components
		);

		await this.safeReset("inpDshName");
		await this.safeReset("selDshCategory");
		await this.safeReset("selDshFormat");
		await this.safeReset("chkDshActive");
		await this.safeReset("inpDshServes");
		await this.safeReset("inpDshExtraPercent");
		await this.safeReset("msDshDietTags");
		await this.safeReset("rteDshNotes");
		await this.safeReset("tblDshComponents");

		showAlert(
			"Dish duplicated. Save it before making changes to enable all Dish features.",
			"success"
		);

		return true;
	},

	async deleteDishStart() {
		await jsDshWorkspace.capture();

		await qryGetDshImpactCount.run();

		const impact =
					this.impactCount();

		if (impact === 0) {
			return await this.deleteDishConfirm();
		}

		showModal(
			mdlDshDeleteConfirm.name
		);

		return true;
	},

	async deleteDishConfirm() {
		try {
			const result =
						await qryDeleteDish.run();

			const deletedId =
						Number(
							result?.[0]?.id || 0
						);

			const currentId =
						Number(
							appsmith.store.current_dish_id || 0
						);

			if (
				!deletedId ||
				deletedId !== currentId
			) {
				showAlert(
					"Dish was not deleted.",
					"error"
				);

				return false;
			}

			closeModal(
				mdlDshDeleteConfirm
			);

			await storeValue(
				"current_dish_id",
				0
			);

			await jsDshCompTable.clearRows();
			await jsDshWorkspace.clear();

			showAlert(
				"Dish deleted.",
				"success"
			);

			navigateTo(
				"DishList"
			);

			return true;

		} catch (error) {
			showAlert(
				error?.message || "Dish was not deleted.",
				"error"
			);

			return false;
		}
	},

	async unsavedYes() {
		switch (this.pendingAction) {
			case "close":
				return await this.saveAndCloseDish();

			case "add":
				return await this.saveAndNew();

			default:
				return false;
		}
	},

	async unsavedNo() {
		switch (this.pendingAction) {
			case "close":
				return await this.closeWithoutSaving();

			case "add":
				return await this.addWithoutSaving();

			default:
				return false;
		}
	}
};