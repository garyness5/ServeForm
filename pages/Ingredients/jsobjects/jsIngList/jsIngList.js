export default {

	inlineChanges() {
		const row = tblIngList.updatedRow || {};
		const changes = {};

		if (row.purchase_qty !== undefined) {
			changes.purchase_qty = row.purchase_qty;
		}

		if (row.purchase_unit_id !== undefined) {
			changes.purchase_unit_id = row.purchase_unit_id;
		}

		if (row.total_cost !== undefined) {
			changes.total_cost = row.total_cost;
		}

		if (row.category_id !== undefined) {
			changes.category_id = row.category_id;
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
	}

};