export default {
	CONTEXT_ADD_INGREDIENTS: "addFromIngredients",
	CONTEXT_EDIT_INGREDIENTS: "editFromIngredients",

	async openAddFromIngredients() {
		await storeValue("IngForm_context", this.CONTEXT_ADD_INGREDIENTS);
		await storeValue("IngForm_mode", "add");
		await storeValue("IngForm_edit_id", null);
		await storeValue("IngForm_edit_row", null);

		resetWidget("mdlAddIng", true);
		showModal("mdlAddIng");
	},

	async openEditFromIngredients() {
		const row = tblIngList.selectedRow;

		if (!row || !row.id) {
			showAlert("Select an ingredient to edit.", "warning");
			return;
		}

		await storeValue("IngForm_context", this.CONTEXT_EDIT_INGREDIENTS);
		await storeValue("IngForm_mode", "edit");
		await storeValue("IngForm_edit_id", row.id);
		await storeValue("IngForm_edit_row", row);

		await qryGetIngAllergenIds.run();
		await qryGetIngDietTagIds.run();
		await qryGetIngredientImpactCount.run();

		resetWidget("mdlAddIng", true);
		showModal("mdlAddIng");
	},

	isEdit() {
		return appsmith.store.IngForm_mode === "edit" || appsmith.store.IngForm_mode === "duplicate";
	},

	editRow() {
		return appsmith.store.IngForm_edit_row || {};
	},

	async save(closeAfterSave = true) {
		const name =
					inpIngIngredient.text
		? inpIngIngredient.text.trim()
		: "";

		const categoryId =
					selIngCategory.selectedOptionValue;

		if (!name) {
			showAlert(
				"Ingredient Name is required.",
				"warning"
			);
			return false;
		}

		if (!categoryId) {
			showAlert(
				"Category is required.",
				"warning"
			);
			return false;
		}

		try {
			const result =
						await qrySaveIngredient.run();

			const savedId =
						Number(result?.[0]?.ingredient_id || 0);

			if (!savedId) {
				showAlert(
					"Ingredient was not saved.",
					"error"
				);
				return false;
			}

			await storeValue(
				"IngForm_saved_id",
				savedId
			);

			await qryGetIngredients.run();

			showAlert(
				"Ingredient saved.",
				"success"
			);

			if (closeAfterSave) {
				closeModal("mdlAddIng");
				return true;
			}

			await storeValue(
				"IngForm_context",
				this.CONTEXT_ADD_INGREDIENTS
			);

			await storeValue(
				"IngForm_mode",
				"add"
			);

			await storeValue(
				"IngForm_edit_id",
				null
			);

			await storeValue(
				"IngForm_edit_row",
				null
			);

			await storeValue(
				"IngForm_saved_id",
				null
			);

			resetWidget(
				"mdlAddIng",
				true
			);

			return true;

		} catch (error) {
			showAlert(
				error?.message ||
				"Ingredient could not be saved.",
				"error"
			);

			return false;
		}
	},

	async openDeleteConfirm() {
		const id =
					Number(appsmith.store.IngForm_edit_id || 0);

		const row =
					appsmith.store.IngForm_edit_row || {};

		if (!id) {
			showAlert(
				"This Ingredient has not been saved yet.",
				"warning"
			);
			return false;
		}

		await qryGetIngredientImpactCount.run();

		showModal("mdlDelConfirmIng");

		return true;
	},

	async confirmDelete() {
		const row = tblIngList.selectedRow;

		if (!row || !row.id) {
			showAlert("No ingredient selected.", "warning");
			return;
		}

		await delIng.run();
		await qryGetIngredients.run();

		closeModal("mdlDelConfirmIng");
		showAlert("Ingredient deleted.", "success");
	},

	cancelDelete() {
		closeModal("mdlDelConfirmIng");
	},

	async openDuplicateFromIngredients() {
		const row =
					appsmith.store.IngForm_edit_row || {};

		const sourceId =
					Number(appsmith.store.IngForm_edit_id || 0);

		if (!sourceId || !row?.name) {
			showAlert(
				"This Ingredient has not been saved yet.",
				"warning"
			);
			return false;
		}

		const allergenRows =
					await qryGetIngAllergenIds.run();

		const dietTagRows =
					await qryGetIngDietTagIds.run();

		const duplicateAllergens =
					(allergenRows || [])
		.map(r => String(r.helper_list_item_id));

		const duplicateDietTags =
					(dietTagRows || [])
		.map(r => String(r.helper_list_item_id));

		const allNames =
					(qryGetIngredients.data || [])
		.map(r => String(r.name || ""));

		const escapedName =
					String(row.name || "")
		.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

		const copyRegex =
					new RegExp(
						`^${escapedName} - Copy(?: (\\d+))?$`
					);

		const usedNumbers =
					allNames
		.map(name => {
			const match = name.match(copyRegex);

			if (!match) {
				return 0;
			}

			return match[1]
				? Number(match[1])
			: 1;
		})
		.filter(n => n > 0);

		const nextNumber =
					usedNumbers.length === 0
		? 1
		: Math.max(...usedNumbers) + 1;

		const copyName =
					nextNumber === 1
		? `${row.name} - Copy`
		: `${row.name} - Copy ${nextNumber}`;

		await storeValue(
			"IngForm_context",
			this.CONTEXT_ADD_INGREDIENTS
		);

		await storeValue(
			"IngForm_mode",
			"duplicate"
		);

		await storeValue(
			"IngForm_edit_id",
			null
		);

		await storeValue(
			"IngForm_edit_row",
			{
				...row,
				id: null,
				name: copyName
			}
		);

		await storeValue(
			"IngForm_duplicate_allergens",
			duplicateAllergens
		);

		await storeValue(
			"IngForm_duplicate_diet_tags",
			duplicateDietTags
		);

		resetWidget(
			"mdlAddIng",
			true
		);

		return true;
	},

	allergenDefaultValues() {
		if (appsmith.store.IngForm_mode === "duplicate") {
			return appsmith.store.IngForm_duplicate_allergens || [];
		}

		if (appsmith.store.IngForm_mode === "edit") {
			return (qryGetIngAllergenIds.data || [])
				.map(r => String(r.helper_list_item_id));
		}

		return [];
	},

	dietTagDefaultValues() {
		if (appsmith.store.IngForm_mode === "duplicate") {
			return appsmith.store.IngForm_duplicate_diet_tags || [];
		}

		if (appsmith.store.IngForm_mode === "edit") {
			return (qryGetIngDietTagIds.data || [])
				.map(r => String(r.helper_list_item_id));
		}

		return [];
	},

	yieldUnitText() {
		return selIngPurchaseUnit.selectedOptionLabel || "";
	},

	netYieldText() {
		const qty = Number(inpIngQuantity.text || 0);
		const wastage = Number(inpIngWastage.text || 0);

		if (!qty) {
			return "Net yield: ";
		}

		const netYield =
					qty * (1 - wastage / 100);

		const value =
					jsFmt.number(netYield);

		const unit =
					this.yieldUnitText();

		return unit
			? `Net yield:    ${value} ${unit}`
		: `Net yield:    ${value}`;
	},

	pricePerUnitText() {
		const qty =
					Number(inpIngQuantity.text || 0);

		const cost =
					Number(inpIngPurchaseCost.text || 0);

		const wastage =
					Number(inpIngWastage.text || 0);

		if (!qty || !cost) {
			return "Cost / unit ";
		}

		const netYield =
					qty * (1 - wastage / 100);

		if (!netYield || netYield <= 0) {
			return "Cost / unit ";
		}

		const price =
					cost / netYield;

		const formattedPrice =
					jsFmt.currency(price);

		const unit =
					this.yieldUnitText();

		return unit
			? `Cost/unit:    $${formattedPrice} / ${unit}`
		: `Cost/unit   $${formattedPrice}`;
	},

	purchaseUnitOptions() {
		return (qryGetUnits.data || [])
			.map(u => ({
			label: u.abbreviation,
			value: String(u.id)
		}));
	},

	cancel() {
		closeModal("mdlAddIng");
		return true;
	},

	async duplicateFromList() {
		const row = tblIngList.selectedRow;

		if (!row?.id) {
			showAlert(
				"Select an ingredient to duplicate.",
				"warning"
			);
			return false;
		}

		await storeValue(
			"IngForm_context",
			this.CONTEXT_EDIT_INGREDIENTS
		);

		await storeValue(
			"IngForm_mode",
			"edit"
		);

		await storeValue(
			"IngForm_edit_id",
			row.id
		);

		await storeValue(
			"IngForm_edit_row",
			row
		);

		await qryGetIngAllergenIds.run();
		await qryGetIngDietTagIds.run();

		const ok =
					await this.openDuplicateFromIngredients();

		if (ok) {
			resetWidget(
				"mdlAddIng",
				true
			);

			showModal(
				"mdlAddIng"
			);
		}

		return ok;
	},
}