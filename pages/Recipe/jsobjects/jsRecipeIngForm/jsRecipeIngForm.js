export default {
	async openAdd() {
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
					String(
						inpRecIngIngredient.text || ""
					).trim();

		if (!name) {
			showAlert(
				"Ingredient Name is required.",
				"warning"
			);

			return false;
		}

		return true;
	},

	async save(closeAfter = true) {
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

			await qryRecGetComponentItems.run();

			if (closeAfter) {
				closeModal(
					"mdlRecIngAddIng"
				);
			} else {
				await resetWidget(
					"mdlRecIngAddIng",
					true
				);
			}

			showAlert(
				"Ingredient saved.",
				"success"
			);

			return true;

		} catch (error) {
			showAlert(
				jsUserErrors.friendly(error),
				"error"
			);

			return false;
		}
	},

	cancel() {
		closeModal(
			"mdlRecIngAddIng"
		);

		return true;
	}
};