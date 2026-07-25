export default {
	save: async (closeAfter, bypassDuplicate = false) => {
		const customerName = (inpCustomerName.text || "").trim();
		const customerId = Number(appsmith.store.current_customer_id || 0);

		if (!customerName) {
			showAlert("Customer Name is required.", "warning");
			return;
		}

		const originalName = (
			appsmith.store.original_customer_name || ""
		).trim();

		const nameChanged =
					customerName.toLowerCase() !== originalName.toLowerCase();

		const mustCheckDuplicate =
					!bypassDuplicate &&
					(
						!customerId ||
						nameChanged
					);

		try {
			if (mustCheckDuplicate) {
				const dup = await qryCheckCustomerDuplicate.run();

				if (dup?.length) {
					await storeValue(
						"customer_duplicate_name",
						customerName
					);

					await storeValue(
						"customer_duplicate_entity",
						"Customer"
					);

					showModal("mdlCustomerDuplicateWarning");
					return;
				}
			}

			const result = await saveCustomerMaster.run();
			const savedCustomerId = Number(
				result?.[0]?.customer_id || 0
			);

			if (!savedCustomerId) {
				throw new Error("Customer was not saved.");
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
				.length
			) {
				await insertCustomerContactLinks.run();
			}

			await getCustomers.run();

			showAlert("Customer saved.", "success");

			if (closeAfter === false) {
				await customerSave.prepareNew();
			} else {
				closeModal("mdlCustomer");
			}

		} catch (error) {
			showAlert(
				error?.message ||
				"Customer could not be saved.",
				"error"
			);
		}
	},

	prepareNew: async () => {
		await storeValue("customer_form_mode", "add");
		await storeValue("current_customer_id", 0);
		await storeValue("customer_contact_ids", []);
		await removeValue("original_customer_name");

		resetWidget("mdlCustomer", true);
		resetWidget("msCustomerContacts", true);
	},

	close: () => {
		closeModal("mdlCustomer");
	},

	async openEdit() {
		const selectedCustomer = tblCustomers.selectedRow;
		const customerId = Number(selectedCustomer?.id || 0);

		if (!customerId) {
			showAlert(
				"Select a Customer first.",
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
			"original_customer_name",
			selectedCustomer.customer_name || ""
		);

		await storeValue("customerAccordion", "");

		await getCustomerContactLinks.run();

		await storeValue(
			"customer_contact_ids",
			(getCustomerContactLinks.data || []).map(
				row => String(row.contact_id)
			)
		);

		await resetWidget("mdlCustomer", true);
		await resetWidget(
			"msCustomerContacts",
			true
		);

		showModal(mdlCustomer.name);
	},

	async duplicate() {
		const sourceId = Number(
			tblCustomers.selectedRow?.id || 0
		);

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

			const newCustomer = result?.[0];

			if (!newCustomer?.customer_id) {
				throw new Error(
					"The duplicated Customer ID was not returned."
				);
			}

			const newCustomerId = Number(
				newCustomer.customer_id
			);

			await storeValue(
				"current_customer_id",
				newCustomerId
			);

			await storeValue(
				"customer_form_mode",
				"edit"
			);

			await getCustomers.run();

			const duplicatedRow = (
				getCustomers.data || []
			).find(
				row =>
				Number(row.id) === newCustomerId
			);

			await storeValue(
				"original_customer_name",
				duplicatedRow?.customer_name || ""
			);

			showModal(mdlCustomer.name);

			showAlert(
				"Customer duplicated.",
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

	async openNew() {
		await storeValue(
			"current_customer_id",
			null
		);

		await storeValue(
			"customer_form_mode",
			"add"
		);

		await removeValue(
			"original_customer_name"
		);

		await storeValue(
			"customerAccordion",
			""
		);

		await storeValue(
			"customer_contact_ids",
			[]
		);

		resetWidget("mdlCustomer", true);
		resetWidget(
			"msCustomerContacts",
			true
		);

		showModal(mdlCustomer.name);
	},

	async deleteCustomer() {
		const customerId = Number(
			appsmith.store.current_customer_id || 0
		);

		if (!customerId) {
			showAlert(
				"No Customer selected.",
				"warning"
			);
			return;
		}

		try {
			await delCustomer.run();
			await getCustomers.run();

			closeModal(mdlDelCustomer.name);
			closeModal(mdlCustomer.name);

			await removeValue(
				"current_customer_id"
			);

			await removeValue(
				"customer_form_mode"
			);

			await removeValue(
				"original_customer_name"
			);

			showAlert(
				"Customer deleted.",
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

	async openDelete() {
		const customerId = Number(
			tblCustomers.selectedRow?.id || 0
		);

		if (!customerId) {
			showAlert(
				"Select a Customer first.",
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

		showModal(mdlDelCustomer.name);
	},

	async toggleStatus() {
		try {
			await toggleCustomerActive.run();
			await getCustomers.run();

		} catch (error) {
			showAlert(
				error?.message ||
				"Customer status could not be updated.",
				"error"
			);

			await getCustomers.run();
		}
	}
};