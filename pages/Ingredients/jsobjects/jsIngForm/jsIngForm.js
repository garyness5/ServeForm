export default {
	CONTEXT_ADD_INGREDIENTS: "addFromIngredients",
	CONTEXT_EDIT_INGREDIENTS: "editFromIngredients",


	// ============================================================
	// OPEN ADD
	// ============================================================

	async openAddFromIngredients() {
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

		await removeValue(
			"IngForm_duplicate_allergens"
		);

		await removeValue(
			"IngForm_duplicate_diet_tags"
		);

		await removeValue(
			"IngForm_duplicate_row"
		);

		await resetWidget(
			"mdlAddIng",
			true
		);

		showModal(
			"mdlAddIng"
		);

		await this.captureBaseline();

		return true;
	},


	// ============================================================
	// OPEN EDIT
	// ============================================================

	async openEditFromIngredients() {
		const row =
					tblIngList.selectedRow;

		if (!row?.id) {
			showAlert(
				"Select an ingredient to edit.",
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
		await qryGetIngredientImpactCount.run();

		await resetWidget(
			"mdlAddIng",
			true
		);

		showModal(
			"mdlAddIng"
		);

		await this.captureBaseline();

		return true;
	},


	// ============================================================
	// MODE / ROW
	// ============================================================

	isEdit() {
		return (
			appsmith.store.IngForm_mode === "edit" ||
			appsmith.store.IngForm_mode === "duplicate"
		);
	},

	editRow() {
		if (
			appsmith.store.IngForm_mode === "duplicate"
		) {
			return (
				appsmith.store.IngForm_duplicate_row || {}
			);
		}

		return (
			appsmith.store.IngForm_edit_row || {}
		);
	},


	// ============================================================
	// CURRENT WORKING STATE
	// ============================================================

	currentState() {
		const allergens =
					(msIngAllergens.selectedOptionValues || [])
		.map(String)
		.sort();

		const dietTags =
					(msIngDietTags.selectedOptionValues || [])
		.map(String)
		.sort();

		return {
			name:
			inpIngIngredient.text?.trim() || "",

			category_id:
			selIngCategory.selectedOptionValue
			? String(selIngCategory.selectedOptionValue)
			: null,

			purchase_qty:
			inpIngQuantity.text || "",

			purchase_unit_id:
			selIngPurchaseUnit.selectedOptionValue
			? String(selIngPurchaseUnit.selectedOptionValue)
			: null,

			total_cost:
			inpIngPurchaseCost.text || "",

			wastage_percent:
			inpIngWastage.text || "",

			supplier_id:
			selIngSupplier.selectedOptionValue
			? String(selIngSupplier.selectedOptionValue)
			: null,

			packaging_id:
			selIngPackaging.selectedOptionValue
			? String(selIngPackaging.selectedOptionValue)
			: null,

			item_code:
			inpIngSupplierCode.text?.trim() || "",

			notes:
			rteIngNotes.text || "",

			active:
			chkIngActive.isChecked !== false,

			allergens,

			diet_tags: dietTags
		};
	},


	async captureBaseline() {
		await storeValue(
			"IngForm_baseline",
			JSON.stringify(
				this.currentState()
			)
		);

		return true;
	},


	isDirty() {
		// A duplicate is a new unsaved Ingredient.
		if (
			appsmith.store.IngForm_mode ===
			"duplicate"
		) {
			return true;
		}

		const baseline =
					appsmith.store.IngForm_baseline;

		if (!baseline) {
			return false;
		}

		return (
			JSON.stringify(
				this.currentState()
			) !== baseline
		);
	},


	canSave() {
		const name =
					inpIngIngredient.text?.trim() || "";

		return (
			!!name &&
			this.isDirty()
		);
	},


	// ============================================================
	// SAVE
	// Name is the only required field.
	// ============================================================

	async save(closeAfterSave = true) {
		const name =
					inpIngIngredient.text
		? inpIngIngredient.text.trim()
		: "";

		if (!name) {
			showAlert(
				"Ingredient Name is required.",
				"warning"
			);

			return false;
		}

		try {
			const result =
						await qrySaveIngredient.run();

			const savedId =
						Number(
							result?.[0]?.ingredient_id || 0
						);

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
				closeModal(
					"mdlIngUnsaved"
				);

				closeModal(
					"mdlAddIng"
				);

				return true;
			}

			await this.captureBaseline();

			return true;

		} catch (error) {
			jsUserErrors.show(
				error,
				"Ingredient could not be saved."
			);

			return false;
		}
	},


	// ============================================================
	// CLOSE / UNSAVED GUARD
	// ============================================================

	async cancel() {
		if (this.isDirty()) {
			await storeValue(
				"IngForm_pending_action",
				"close"
			);

			showModal("mdlIngUnsaved");
			return false;
		}

		closeModal("mdlAddIng");
		return true;
	},


	async requestAdd() {
		if (this.isDirty()) {
			await storeValue(
				"IngForm_pending_action",
				"add"
			);

			showModal("mdlIngUnsaved");
			return false;
		}

		await this.openAddFromIngredients();
		return true;
	},


	async saveFromUnsaved() {
		const action =
					appsmith.store.IngForm_pending_action || "close";

		const saved =
					await this.save(false);

		if (!saved) {
			return false;
		}

		closeModal("mdlIngUnsaved");

		if (action === "add") {
			await this.openAddFromIngredients();
		} else {
			closeModal("mdlAddIng");
		}

		await removeValue(
			"IngForm_pending_action"
		);

		return true;
	},


	async discardChanges() {
		const action =
					appsmith.store.IngForm_pending_action || "close";

		closeModal("mdlIngUnsaved");

		if (action === "add") {
			await this.openAddFromIngredients();
		} else {
			closeModal("mdlAddIng");
		}

		await removeValue(
			"IngForm_pending_action"
		);

		return true;
	},


	async cancelDiscard() {
		closeModal("mdlIngUnsaved");

		await removeValue(
			"IngForm_pending_action"
		);

		return true;
	},

	// ============================================================
	// DELETE
	// ============================================================

	async openDeleteConfirm() {
		const id =
					Number(
						appsmith.store.IngForm_edit_id || 0
					);

		if (!id) {
			showAlert(
				"This Ingredient has not been saved yet.",
				"warning"
			);

			return false;
		}

		await qryGetIngredientImpactCount.run();

		showModal(
			"mdlDelConfirmIng"
		);

		return true;
	},


	async confirmDelete() {
		const id =
					Number(
						appsmith.store.IngForm_edit_id || 0
					);

		if (!id) {
			showAlert(
				"No Ingredient selected.",
				"warning"
			);
			return false;
		}

		try {
			const result =
						await qryDelIng.run({
							ingredient_id: id
						});

			const deletedId =
						Number(result?.[0]?.id || 0);

			if (!deletedId) {
				showAlert(
					"Ingredient was not deleted.",
					"error"
				);
				return false;
			}

			await qryGetIngredients.run();

			closeModal(
				"mdlDelConfirmIng"
			);

			closeModal(
				"mdlAddIng"
			);

			showAlert(
				"Ingredient deleted.",
				"success"
			);

			return true;

		} catch (error) {
			jsUserErrors.show(
				error,
				"Ingredient could not be deleted."
			);

			return false;
		}
	},


	cancelDelete() {
		closeModal(
			"mdlDelConfirmIng"
		);

		return true;
	},

	async deleteFromList() {
		const row = tblIngList.selectedRow;

		if (!row?.id) {
			showAlert(
				"Select an ingredient to delete.",
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

		await qryGetIngredientImpactCount.run();

		showModal("mdlDelConfirmIng");

		return true;
	},

	// ============================================================
	// DUPLICATE FROM OPEN MODAL
	// Carries current unsaved working state into new Ingredient.
	// Source Ingredient itself is NOT saved.
	// ============================================================

	async openDuplicateFromIngredients() {
		const sourceRow =
					appsmith.store.IngForm_edit_row || {};

		const sourceId =
					Number(
						appsmith.store.IngForm_edit_id || 0
					);

		if (!sourceId || !sourceRow?.name) {
			showAlert(
				"This Ingredient has not been saved yet.",
				"warning"
			);

			return false;
		}

		const current =
					this.currentState();

		const allNames =
					(qryGetIngredients.data || [])
		.map(r => String(r.name || ""));

		const escapedName =
					String(sourceRow.name || "")
		.replace(
			/[.*+?^${}()|[\]\\]/g,
			"\\$&"
		);

		const copyRegex =
					new RegExp(
						`^${escapedName} - Copy(?: (\\d+))?$`
					);

		const usedNumbers =
					allNames
		.map(name => {
			const match =
						name.match(copyRegex);

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

		const savedName =
					String(sourceRow.name || "").trim();

		const currentName =
					String(current.name || "").trim();

		const nameChanged =
					currentName !== savedName;

		let copyName = currentName || savedName;

		if (!nameChanged) {
			const allNames =
						(qryGetIngredients.data || [])
			.map(r => String(r.name || ""));

			const escapedName =
						savedName.replace(
							/[.*+?^${}()|[\]\\]/g,
							"\\$&"
						);

			const copyRegex =
						new RegExp(
							`^${escapedName} - Copy(?: (\\d+))?$`
						);

			const usedNumbers =
						allNames
			.map(name => {
				const match =
							name.match(copyRegex);

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

			copyName =
				nextNumber === 1
				? `${savedName} - Copy`
			: `${savedName} - Copy ${nextNumber}`;
		}


		const duplicateRow = {
			...sourceRow,
			...current,

			id: null,
			name: copyName,

			// Preserve the saved Yield Unit preference.
			yield_unit_id:
			sourceRow.yield_unit_id || null
		};


		await storeValue(
			"IngForm_duplicate_allergens",
			current.allergens
		);

		await storeValue(
			"IngForm_duplicate_diet_tags",
			current.diet_tags
		);

		await storeValue(
			"IngForm_duplicate_row",
			duplicateRow
		);

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
			duplicateRow
		);

		await resetWidget(
			"mdlAddIng",
			true
		);

		return true;
	},

	// ============================================================
	// DUPLICATE FROM LIST
	// ============================================================

	async duplicateFromList() {
		const row =
					tblIngList.selectedRow;

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

		const allergenRows =
					await qryGetIngAllergenIds.run();

		const dietTagRows =
					await qryGetIngDietTagIds.run();

		const allergens =
					(allergenRows || [])
		.map(
			r =>
			String(
				r.helper_list_item_id
			)
		);

		const dietTags =
					(dietTagRows || [])
		.map(
			r =>
			String(
				r.helper_list_item_id
			)
		);

		const allNames =
					(qryGetIngredients.data || [])
		.map(
			r => String(r.name || "")
		);

		const escapedName =
					String(row.name || "")
		.replace(
			/[.*+?^${}()|[\]\\]/g,
			"\\$&"
		);

		const copyRegex =
					new RegExp(
						`^${escapedName} - Copy(?: (\\d+))?$`
					);

		const usedNumbers =
					allNames
		.map(name => {
			const match =
						name.match(copyRegex);

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
			"IngForm_duplicate_allergens",
			allergens
		);

		await storeValue(
			"IngForm_duplicate_diet_tags",
			dietTags
		);

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

		await resetWidget(
			"mdlAddIng",
			true
		);

		showModal(
			"mdlAddIng"
		);

		return true;
	},


	// ============================================================
	// ALLERGEN / DIET TAG DEFAULTS
	// ============================================================

	allergenDefaultValues() {
		if (
			appsmith.store.IngForm_mode ===
			"duplicate"
		) {
			return (
				appsmith.store
				.IngForm_duplicate_allergens ||
				[]
			);
		}

		if (
			appsmith.store.IngForm_mode ===
			"edit"
		) {
			return (
				qryGetIngAllergenIds.data || []
			).map(
				r =>
				String(
					r.helper_list_item_id
				)
			);
		}

		return [];
	},


	dietTagDefaultValues() {
		if (
			appsmith.store.IngForm_mode ===
			"duplicate"
		) {
			return (
				appsmith.store
				.IngForm_duplicate_diet_tags ||
				[]
			);
		}

		if (
			appsmith.store.IngForm_mode ===
			"edit"
		) {
			return (
				qryGetIngDietTagIds.data || []
			).map(
				r =>
				String(
					r.helper_list_item_id
				)
			);
		}

		return [];
	},


	// ============================================================
	// DISPLAY / CALCULATION
	// ============================================================

	yieldUnitText() {
		return (
			selIngPurchaseUnit
			.selectedOptionLabel || ""
		);
	},


	netYieldText() {
		const qty =
					Number(
						inpIngQuantity.text || 0
					);

		const wastage =
					Number(
						inpIngWastage.text || 0
					);

		if (!qty) {
			return "Net yield: ";
		}

		const netYield =
					qty *
					(1 - wastage / 100);

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
					Number(
						inpIngQuantity.text || 0
					);

		const cost =
					Number(
						inpIngPurchaseCost.text || 0
					);

		const wastage =
					Number(
						inpIngWastage.text || 0
					);

		if (!qty || !cost) {
			return "Cost / unit ";
		}

		const netYield =
					qty *
					(1 - wastage / 100);

		if (
			!netYield ||
			netYield <= 0
		) {
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
		: `Cost/unit:    $${formattedPrice}`;
	},


	purchaseUnitOptions() {
		return (
			qryGetUnits.data || []
		).map(u => ({
			label:
			u.abbreviation,

			value:
			String(u.id)
		}));
	},

	unsavedTitle() {
		switch (appsmith.store.IngForm_mode) {
			case "add":
				return "Unsaved Ingredient";

			case "duplicate":
				return "Unsaved Duplicate";

			default:
				return "Unsaved Changes";
		}
	},

	unsavedWarning() {
		switch (appsmith.store.IngForm_mode) {
			case "add":
				return "This new Ingredient has not been saved. Save it before closing?";

			case "duplicate":
				return "This duplicated Ingredient has not been saved. Save it before closing?";

			default:
				return "This Ingredient has unsaved changes. Save them before closing?";
		}
	},
};