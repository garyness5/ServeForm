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

}