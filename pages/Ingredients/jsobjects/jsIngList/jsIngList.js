export default {
	inlineChanges() {
		const row = tblIngList.updatedRow || {};
		const changes = {};

		if (row.purchase_qty !== undefined) {
			changes.purchase_qty = row.purchase_qty;
		}

		if (row.purchase_unit !== undefined) {
			changes.purchase_unit_id =
				row.purchase_unit || null;
		}

		if (row.wastage_percent !== undefined) {
			changes.wastage_percent = row.wastage_percent;
		}

		if (row.total_cost !== undefined) {
			changes.total_cost = row.total_cost;
		}

		if (row.category_id !== undefined) {
			changes.category_id = row.category_id;
		}

		if (row.item_code !== undefined) {
			changes.item_code =
				row.item_code?.trim() || null;
		}

		if (row.supplier_id !== undefined) {
			changes.supplier_id = row.supplier_id;
		}

		if (row.packaging_id !== undefined) {
			changes.packaging_id = row.packaging_id;
		}

		if (row.active !== undefined) {
			changes.active = row.active;
		}

		return changes;
	},

	async saveInline() {
		const row = tblIngList.updatedRow || {};

		if (!row.id) {
			showAlert(
				"Ingredient could not be identified.",
				"error"
			);

			return false;
		}

		try {
			await qryUpdateIngredientInline.run({
				ingredient_id: Number(row.id),
				changes: this.inlineChanges()
			});

			await qryGetIngredients.run();

			showAlert(
				"Ingredient updated.",
				"success"
			);

			return true;

		} catch (e) {
			await qryGetIngredients.run();

			showAlert(
				e?.message ||
				"Ingredient could not be updated.",
				"error"
			);

			return false;
		}
	},

	unitOptions(unitType) {
		return (qryGetUnits.data || [])
			.filter(u => u.unit_type === unitType)
			.map(u => ({
			label: u.abbreviation,
			value: String(u.id)
		}));
	},

	async saveUnitInline(ingredientId, newUnitId) {
		if (!ingredientId || !newUnitId) {
			showAlert(
				"Ingredient Unit could not be identified.",
				"error"
			);
			return false;
		}

		try {
			await qryUpdateIngredientInline.run({
				ingredient_id: Number(ingredientId),
				changes: {
					purchase_unit_id: Number(newUnitId)
				}
			});

			await qryGetIngredients.run();

			showAlert(
				"Ingredient updated.",
				"success"
			);

			return true;

		} catch (e) {
			await qryGetIngredients.run();

			showAlert(
				e?.message ||
				"Ingredient Unit could not be updated.",
				"error"
			);

			return false;
		}
	},

	async saveCategoryInline(ingredientId, newCategoryId) {
		if (!ingredientId || !newCategoryId) {
			showAlert(
				"Ingredient Category could not be identified.",
				"error"
			);
			return false;
		}

		try {
			await qryUpdateIngredientInline.run({
				ingredient_id: Number(ingredientId),
				changes: {
					category_id: Number(newCategoryId)
				}
			});

			await qryGetIngredients.run();

			showAlert(
				"Ingredient updated.",
				"success"
			);

			return true;

		} catch (e) {
			await qryGetIngredients.run();

			showAlert(
				e?.message ||
				"Ingredient Category could not be updated.",
				"error"
			);

			return false;
		}
	},

	async saveSupplierInline(ingredientId, newSupplierId) {
		try {
			await qryUpdateIngredientInline.run({
				ingredient_id: Number(ingredientId),
				changes: {
					supplier_id: newSupplierId
					? Number(newSupplierId)
					: null
				}
			});

			await qryGetIngredients.run();

			showAlert("Ingredient updated.", "success");
			return true;

		} catch (e) {
			await qryGetIngredients.run();

			showAlert(
				e?.message ||
				"Ingredient Supplier could not be updated.",
				"error"
			);

			return false;
		}
	},

	async savePackagingInline(ingredientId, newPackagingId) {
		try {
			await qryUpdateIngredientInline.run({
				ingredient_id: Number(ingredientId),
				changes: {
					packaging_id: newPackagingId
					? Number(newPackagingId)
					: null
				}
			});

			await qryGetIngredients.run();

			showAlert("Ingredient updated.", "success");
			return true;

		} catch (e) {
			await qryGetIngredients.run();

			showAlert(
				e?.message ||
				"Ingredient Packaging could not be updated.",
				"error"
			);

			return false;
		}
	},

	async saveYieldUnitInline(ingredientId, newYieldUnitId) {
		if (!ingredientId || !newYieldUnitId) {
			showAlert(
				"Ingredient Yield Unit could not be identified.",
				"error"
			);
			return false;
		}

		try {
			await qryUpdateIngredientInline.run({
				ingredient_id: Number(ingredientId),
				changes: {
					yield_unit_id: Number(newYieldUnitId)
				}
			});

			await qryGetIngredients.run();

			showAlert(
				"Ingredient updated.",
				"success"
			);

			return true;

		} catch (e) {
			await qryGetIngredients.run();

			showAlert(
				e?.message ||
				"Ingredient Yield Unit could not be updated.",
				"error"
			);

			return false;
		}
	},

	async openRename() {
		const row = tblIngList.selectedRow;

		if (!row?.id) {
			showAlert(
				"Select an Ingredient to rename.",
				"warning"
			);

			return false;
		}

		await storeValue(
			"IngRename_id",
			row.id
		);

		await storeValue(
			"IngRename_name",
			row.name || ""
		);

		resetWidget(
			"mdlRenameIng",
			true
		);

		showModal(
			"mdlRenameIng"
		);

		return true;
	},


	renameTitle() {
		const name =
					appsmith.store.IngRename_name || "";

		return name
			? `Rename: ${name}`
		: "Rename Ingredient";
	},


	renameDefaultName() {
		return (
			appsmith.store.IngRename_name || ""
		);
	},


	async saveRename() {
		const id =
					Number(
						appsmith.store.IngRename_id || 0
					);

		const newName =
					inpIngRenameTo.text?.trim() || "";

		if (!id) {
			showAlert(
				"Ingredient could not be identified.",
				"error"
			);

			return false;
		}

		if (!newName) {
			showAlert(
				"Ingredient Name is required.",
				"warning"
			);

			return false;
		}

		try {
			await qryRenameIngredient.run({
				ingredient_id: id,
				new_name: newName
			});

			await qryGetIngredients.run();

			closeModal(
				"mdlRenameIng"
			);

			await removeValue(
				"IngRename_id"
			);

			await removeValue(
				"IngRename_name"
			);

			showAlert(
				"Ingredient renamed.",
				"success"
			);

			return true;

		} catch (e) {
			showAlert(
				e?.message ||
				"Ingredient could not be renamed.",
				"error"
			);

			return false;
		}
	},

	cancelRename() {
		closeModal(
			"mdlRenameIng"
		);

		return true;
	},

	async saveActiveInline() {
		const row = tblIngList.updatedRow || {};

		const ingredientId =
					Number(row.id || 0);

		if (!ingredientId) {
			showAlert(
				"Ingredient could not be identified.",
				"error"
			);
			return false;
		}

		try {
			await qryUpdateIngredientInline.run({
				ingredient_id: ingredientId,
				changes: {
					active: row.active === false
					? false
					: true
				}
			});

			await qryGetIngredients.run();

			return true;

		} catch (e) {
			await qryGetIngredients.run();

			showAlert(
				e?.message ||
				"Ingredient Status could not be updated.",
				"error"
			);

			return false;
		}
	},

	filteredRows() {
		const rows = qryGetIngredients.data || [];

		const status = String(
			selIngListFilter.selectedOptionValue || "all"
		)
		.trim()
		.toLowerCase();

		const search = String(
			inpIngListSearch.text || ""
		)
		.trim()
		.toLowerCase();

		return rows.filter(row => {
			const statusOk =
						status === "all" ||
						(status === "active" && row.active === true) ||
						(status === "inactive" && row.active === false);

			if (!statusOk) {
				return false;
			}

			if (!search) {
				return true;
			}

			return [
				row.name,
				row.category_name,
				row.supplier_name,
				row.packaging_name,
				row.item_code
			]
				.filter(Boolean)
				.some(value =>
							String(value)
							.toLowerCase()
							.includes(search)
						 );
		});
	},
};