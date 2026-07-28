export default {
	async save(closeAfter = true, bypassDuplicate = false) {
		const contactName = (inpContactName.text || "").trim();

		if (!contactName) {
			showAlert("Contact name is required.", "warning");
			return;
		}

		try {
			if (!bypassDuplicate) {
				const duplicate = await qryCheckContactDuplicate.run();

				if (duplicate?.length) {
					await storeValue("contact_duplicate_name", contactName);
					await storeValue(
						"contact_duplicate_close_after",
						closeAfter
					);

					showModal("mdlContactDuplicateWarning");
					return;
				}
			}

			await saveContactMaster.run();
			await getContacts.run();

			closeModal("mdlContactDuplicateWarning");

			if (closeAfter) {
				closeModal("mdlContact");

				await removeValue("contact_form_mode");
				await removeValue("current_contact_id");
				await removeValue("current_contact_record");

				showAlert("Contact saved.", "success");
			} else {
				await storeValue("contact_form_mode", "add");
				await removeValue("current_contact_id");
				await removeValue("current_contact_record");

				this.resetForm();

				showAlert(
					"Contact saved. Ready for next contact.",
					"success"
				);
			}
		} catch (error) {
			showAlert(
				error?.message || "Contact could not be saved.",
				"error"
			);
		}
	},

	resetForm() {
		resetWidget("inpContactName", true);
		resetWidget("inpContactTitle", true);
		resetWidget("inpContactPhone", true);
		resetWidget("inpContactMobile", true);
		resetWidget("inpContactEmail", true);
		resetWidget("inpContactNotes", true);
		resetWidget("chkContactActive", true);
	},

	async openEdit() {
		const sourceRow = tblContacts.selectedRow;

		if (!sourceRow?.id) {
			showAlert("Select a Contact to edit.", "warning");
			return;
		}

		await storeValue("contact_form_mode", "edit");
		await storeValue("current_contact_id", sourceRow.id);
		await storeValue("current_contact_record", sourceRow);

		resetWidget("mdlContact", true);
		showModal("mdlContact");
	},

	async duplicateContact() {
		const sourceRow = tblContacts.selectedRow;

		if (!sourceRow?.id) {
			showAlert("Select a Contact to duplicate.", "warning");
			return;
		}

		try {
			const result = await duplicateContact.run();
			const newContactId = Number(
				result?.[0]?.new_contact_id || 0
			);

			if (!newContactId) {
				throw new Error(
					"The duplicated Contact ID was not returned."
				);
			}

			await getContacts.run();

			const newContact = (getContacts.data || []).find(
				row => Number(row.id) === newContactId
			);

			if (!newContact) {
				throw new Error(
					"The duplicated Contact could not be loaded."
				);
			}

			await storeValue("contact_form_mode", "edit");
			await storeValue("current_contact_id", newContactId);
			await storeValue("current_contact_record", newContact);

			resetWidget("mdlContact", true);
			showModal("mdlContact");

			showAlert(
				`${newContact.contact_name} created.`,
				"success"
			);
		} catch (error) {
			showAlert(
				error?.message || "Contact could not be duplicated.",
				"error"
			);
		}
	},

	async confirmDuplicate() {
		closeModal("mdlContactDuplicateWarning");

		await this.save(
			appsmith.store.contact_duplicate_close_after !== false,
			true
		);
	},

	openDelete() {
		if (!tblContacts.selectedRow?.id) {
			showAlert("Select a Contact to delete.", "warning");
			return;
		}

		showModal("mdlContactDelConfirm");
	},

	async deleteContact() {
		const sourceRow = tblContacts.selectedRow;

		if (!sourceRow?.id) {
			showAlert("No Contact is selected.", "warning");
			closeModal("mdlContactDelConfirm");
			return;
		}

		try {
			const result = await deleteContactMaster.run();
			const deletedContact = result?.[0];

			if (!deletedContact?.id) {
				throw new Error("The Contact was not deleted.");
			}

			closeModal("mdlContactDelConfirm");

			await getContacts.run();

			await removeValue("current_contact_id");
			await removeValue("current_contact_record");
			await removeValue("contact_form_mode");

			resetWidget("tblContacts", true);

			showAlert(
				`${deletedContact.contact_name} deleted.`,
				"success"
			);
		} catch (error) {
			showAlert(
				error?.message || "Contact could not be deleted.",
				"error"
			);
		}
	},

	cancelDelete() {
		closeModal("mdlContactDelConfirm");
	}

};