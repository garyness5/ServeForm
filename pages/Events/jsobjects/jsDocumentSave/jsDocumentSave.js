export default {
	async save() {
		try {
			const saved =
				await jsEventSave.saveEvent();

			return saved === true;
		} catch (error) {
			showAlert(
				error?.message ||
				"Event could not be saved.",
				"error"
			);

			return false;
		}
	}
};