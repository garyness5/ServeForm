export default {
	async save(closeAfter = true, bypassDuplicate = false) {
		const customerName = (inpCustomerName.text || "").trim();
		const customerId = Number(
			appsmith.store.current_customer_id || 0
		);

		if (!customerName) {
			showAlert("Customer name is required.", "warning");
			return;
		}

		const originalName = (
			appsmith.store.original_customer_name || ""
		).trim();

		const nameChanged =
					customerName.toLowerCase() !==
					originalName.toLowerCase();

		const mustCheckDuplicate =
					!bypassDuplicate &&
					(!customerId || nameChanged);

		try {
			if (mustCheckDuplicate) {
				const duplicate =
							await qryCheckCustomerDuplicate.run();

				if (duplicate?.length) {
					await storeValue(
						"customer_duplicate_name",
						customerName
					);

					await storeValue(
						"customer_duplicate_entity",
						"Customer"
					);

					await storeValue(
						"customer_duplicate_close_after",
						closeAfter
					);

					showModal("mdlCustomerDuplicateWarning");
					return;
				}
			}

			const result = await saveCustomerMaster.run();

			const savedCustomerId = Number(
				result?.[0]?.customer_id ??
				result?.[0]?.id ??
				0
			);

			if (!savedCustomerId) {
				throw new Error(
					"Customer was saved, but its ID was not returned."
				);
			}

			await storeValue(
				"current_customer_id",
				savedCustomerId
			);

			await storeValue(
				"original_customer_name",
				customerName
			);

			await deleteCustomerContactLinks.run();

			if (
				(msCustomerContacts.selectedOptionValues || [])
				.length > 0
			) {
				await insertCustomerContactLinks.run();
			}

			await getCustomers.run();

			closeModal("mdlCustomerDuplicateWarning");

			if (closeAfter) {
				closeModal("mdlCustomer");

				await this.clearState();

				showAlert("Customer saved.", "success");
			} else {
				await this.prepareNew();

				showAlert(
					"Customer saved. Ready for next Customer.",
					"success"
				);
			}
		} catch (error) {
			showAlert(
				error?.message ||
				"Customer could not be saved.",
				"error"
			);
		}
	},

	async confirmDuplicate() {
		closeModal("mdlCustomerDuplicateWarning");

		await this.save(
			appsmith.store.customer_duplicate_close_after !== false,
			true
		);
	},

	async prepareNew() {
		await storeValue("customer_form_mode", "add");

		await removeValue("current_customer_id");
		await removeValue("current_customer_record");
		await removeValue("original_customer_name");

		await storeValue("customer_contact_ids", []);
		await storeValue("customerAccordion", "");

		resetWidget("mdlCustomer", true);
		resetWidget("msCustomerContacts", true);
	},

	async clearState() {
		await removeValue("current_customer_id");
		await removeValue("current_customer_record");
		await removeValue("customer_form_mode");
		await removeValue("original_customer_name");

		await removeValue("customer_duplicate_name");
		await removeValue("customer_duplicate_entity");
		await removeValue("customer_duplicate_close_after");
		await removeValue("customer_duplicate_save_and_new");

		await storeValue("customer_contact_ids", []);
		await storeValue("customerAccordion", "");
	},

	async close() {
		closeModal("mdlCustomer");
		await this.clearState();
	},

	async openNew() {
		await this.prepareNew();
		showModal("mdlCustomer");
	},

	async openEdit() {
		const selectedCustomer = tblCustomers.selectedRow;
		const customerId = Number(selectedCustomer?.id || 0);

		if (!customerId) {
			showAlert(
				"Select a Customer to edit.",
				"warning"
			);
			return;
		}

		await storeValue(
			"current_customer_id",
			customerId
		);

		await storeValue(
			"customer_form_mode",
			"edit"
		);

		await storeValue(
			"current_customer_record",
			selectedCustomer
		);

		await storeValue(
			"original_customer_name",
			selectedCustomer.customer_name || ""
		);

		await storeValue("customerAccordion", "");

		await getCustomerContactLinks.run();

		const contactIds = (
			getCustomerContactLinks.data || []
		).map(row => String(row.contact_id));

		await storeValue(
			"customer_contact_ids",
			contactIds
		);

		resetWidget("mdlCustomer", true);
		resetWidget("msCustomerContacts", true);

		showModal("mdlCustomer");
	},

	async duplicate() {
		const sourceCustomer = tblCustomers.selectedRow;
		const sourceId = Number(sourceCustomer?.id || 0);

		if (!sourceId) {
			showAlert(
				"Select a Customer to duplicate.",
				"warning"
			);
			return;
		}

		try {
			const result =
						await duplicateCustomerMaster.run();

			const newCustomerId = Number(
				result?.[0]?.customer_id ??
				result?.[0]?.new_customer_id ??
				result?.[0]?.id ??
				0
			);

			if (!newCustomerId) {
				throw new Error(
					"The duplicated Customer ID was not returned."
				);
			}

			await getCustomers.run();

			const duplicatedCustomer = (
				getCustomers.data || []
			).find(
				row => Number(row.id) === newCustomerId
			);

			if (!duplicatedCustomer) {
				throw new Error(
					"The duplicated Customer could not be loaded."
				);
			}

			await storeValue(
				"current_customer_id",
				newCustomerId
			);

			await storeValue(
				"customer_form_mode",
				"edit"
			);

			await storeValue(
				"current_customer_record",
				duplicatedCustomer
			);

			await storeValue(
				"original_customer_name",
				duplicatedCustomer.customer_name || ""
			);

			await storeValue("customerAccordion", "");

			await getCustomerContactLinks.run();

			const contactIds = (
				getCustomerContactLinks.data || []
			).map(row => String(row.contact_id));

			await storeValue(
				"customer_contact_ids",
				contactIds
			);

			resetWidget("mdlCustomer", true);
			resetWidget("msCustomerContacts", true);

			showModal("mdlCustomer");

			showAlert(
				`${duplicatedCustomer.customer_name} created.`,
				"success"
			);
		} catch (error) {
			showAlert(
				error?.message ||
				"Customer could not be duplicated.",
				"error"
			);
		}
	},

	async openDelete() {
		const selectedCustomer = tblCustomers.selectedRow;
		const customerId = Number(selectedCustomer?.id || 0);

		if (!customerId) {
			showAlert(
				"Select a Customer to delete.",
				"warning"
			);
			return;
		}

		await storeValue(
			"current_customer_id",
			customerId
		);

		await storeValue(
			"current_customer_record",
			selectedCustomer
		);

		showModal("mdlCustomerDeleteConfirm");
	},

	async deleteCustomer() {
		const customerId = Number(
			appsmith.store.current_customer_id || 0
		);

		if (!customerId) {
			showAlert(
				"No Customer is selected.",
				"warning"
			);

			closeModal("mdlCustomerDeleteConfirm");
			return;
		}

		const customerName =
					appsmith.store.current_customer_record
		?.customer_name ||
					tblCustomers.selectedRow?.customer_name ||
					"Customer";

		try {
			const result = await delCustomer.run();

			const deletedRow = Array.isArray(result)
			? result[0]
			: Array.isArray(delCustomer.data)
			? delCustomer.data[0]
			: result;

			const deletedCustomerId = Number(
				deletedRow?.customer_id || 0
			);

			if (
				!deletedCustomerId ||
				deletedRow?.deleted !== true
			) {
				throw new Error(
					"The Customer was not deleted."
				);
			}

			closeModal("mdlCustomerDeleteConfirm");
			closeModal("mdlCustomer");

			await getCustomers.run();
			await this.clearState();

			resetWidget("tblCustomers", true);

			showAlert(
				`${customerName} deleted.`,
				"success"
			);
		} catch (error) {
			showAlert(
				error?.message ||
				"Customer could not be deleted.",
				"error"
			);
		}
	},

	async cancelDelete() {
		closeModal("mdlCustomerDeleteConfirm");

		await removeValue("current_customer_id");
		await removeValue("current_customer_record");
	}

};