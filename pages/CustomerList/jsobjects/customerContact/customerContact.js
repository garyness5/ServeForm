export default {
	async save(saveAndNew = false, bypassDuplicate = false) {
		const contactName = (inpContactName.text || "").trim();

		if (!contactName) {
			showAlert("Contact name is required.", "warning");
			return;
		}

		try {
			if (!bypassDuplicate) {
				const dup = await qryCheckContactDuplicate.run();

				if (dup?.length) {
					await storeValue(
						"customer_duplicate_name",
						contactName
					);

					await storeValue(
						"customer_duplicate_entity",
						"Contact"
					);

					await storeValue(
						"customer_duplicate_save_and_new",
						saveAndNew
					);

					showModal("mdlCustomerDuplicateWarning");
					return;
				}
			}

			const existingIds = [
				...(msCustomerContacts.selectedOptionValues || [])
			].map(String);

			const result = await saveContactMaster.run();

			const savedRow =
				Array.isArray(result)
					? result[0]
					: Array.isArray(saveContactMaster.data)
						? saveContactMaster.data[0]
						: result;

			const contactId = Number(
				savedRow?.contact_id ??
				savedRow?.id ??
				0
			);

			if (!contactId) {
				throw new Error(
					"Contact saved, but its ID was not returned."
				);
			}

			await getContacts.run();

			const selectedIds = [
				...new Set([
					...existingIds,
					String(contactId)
				])
			];

			await storeValue(
				"customer_contact_ids",
				selectedIds
			);

			await resetWidget(
				"msCustomerContacts",
				true
			);

			showAlert("Contact saved.", "success");

			await this.resetQuickFields();

			if (saveAndNew === false) {
				await storeValue(
					"customerAccordion",
					""
				);
			}
		} catch (error) {
			showAlert(
				error?.message ||
					"Contact could not be saved.",
				"error"
			);
		}
	},

	resetQuickFields: async () => {
		resetWidget("inpContactName", true);
		resetWidget("inpContactTitle", true);
		resetWidget("inpContactPhone", true);
		resetWidget("inpContactMobile", true);
		resetWidget("inpContactEmail", true);
		resetWidget("inpContactNotes", true);
	}
};