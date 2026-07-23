export default {

	save(closeAfter = true) {
		if (!inpContactName.text?.trim()) {
			showAlert("Contact name is required.", "warning");
			return;
		}

		return saveContactMaster.run()
			.then(() => getContacts.run())
			.then(() => {
			if (closeAfter) {
				closeModal("mdlContact");
				showAlert(
					"Contact saved.",
					"success"
				);

			} else {

				storeValue("contact_form_mode", "add");
				storeValue("current_contact_id", null);
				this.resetForm();
				showAlert(
					"Contact saved. Ready for next contact.",
					"success"
				);
			}
		});
	},

	resetForm() {
		resetWidget("inpContactName", true);
		resetWidget("inpContactTitle", true);
		resetWidget("inpContactPhone", true);
		resetWidget("inpContactMobile", true);
		resetWidget("inpContactEmail", true);
		resetWidget("inpContactNotes", true);
		resetWidget("chkContactActive", true);
		resetWidget("mslContactCustomers", true);
		resetWidget("mslContactVenues", true);
	},

	async duplicateContact() {
		const sourceRow = tblContacts.selectedRow;

		if (!sourceRow?.id) {
			showAlert("Select a contact to duplicate.", "warning");
			return;
		}

		try {
			const result = await duplicateContact.run();
			const newContactId = Number(result?.[0]?.new_contact_id || 0);

			if (!newContactId) {
				throw new Error("The duplicated Contact ID was not returned.");
			}

			await getContacts.run();

			const newContact = (getContacts.data || []).find(
				row => Number(row.id) === newContactId
			);

			if (!newContact) {
				throw new Error("The duplicated Contact could not be loaded.");
			}

			await storeValue("contact_form_mode", "edit");
			await storeValue("current_contact_id", newContactId);
			await storeValue("current_contact_record", newContact);

			resetWidget("mdlContact", true);
			showModal("mdlContact");

			showAlert(`${newContact.contact_name} created.`, "success");
		} catch (error) {
			showAlert(
				error?.message || "Contact could not be duplicated.",
				"error"
			);
		}
	}

}