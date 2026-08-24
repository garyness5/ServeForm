export default {
	async initClient() {
		const rows = await qryGetCurrentUserContext.run();
		const user = rows?.[0];

		if (!user?.client_id) {
			await removeValue("current_client_id");
			await removeValue("current_operation_name");

			showAlert(
				"Your Savveyra account is not configured.",
				"error"
			);

			return false;
		}

		await storeValue(
			"current_client_id",
			user.client_id
		);

		await storeValue(
			"current_operation_name",
			user.client_name || ""
		);

		return true;
	}
}