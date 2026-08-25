export default {
	async openAdd() {
		await storeValue(
			"RecIngForm_mode",
			"add"
		);

		await storeValue(
			"RecIngForm_saved_id",
			null
		);

		await resetWidget(
			"mdlRecIngAddIng",
			true
		);

		showModal(
			"mdlRecIngAddIng"
		);

		return true;
	},

	validate() {
		const name =
					String(inpRecIngIngredient.text || "").trim();

		if (!name) {
			showAlert(
				"Ingredient Name is required.",
				"warning"
			);

			return false;
		}

		return true;
	},

	async save(closeAfterSave = true) {
		if (!this.validate()) {
			return false;
		}

		try {
			const result =
						await qryRecSaveIngredient.run();

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
				"RecIngForm_saved_id",
				savedId
			);

			await qryRecGetComponentItems.run();

			showAlert(
				"Ingredient saved.",
				"success"
			);

			if (closeAfterSave) {
				closeModal(
					"mdlRecIngAddIng"
				);

				return true;
			}

			await storeValue(
				"RecIngForm_saved_id",
				null
			);

			resetWidget(
				"mdlRecIngAddIng",
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

	cancel() {
		closeModal("mdlRecIngAddIng");
	}
}