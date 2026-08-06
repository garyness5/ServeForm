export default {
	async clearCustomerQuickAdd() {
		await resetWidget(
			"inpEvtCustomerName",
			true
		);

		await resetWidget(
			"inpEvtCustomerPhone",
			true
		);

		await resetWidget(
			"inpEvtCustomerMobile",
			true
		);

		await resetWidget(
			"inpEvtCustomerEmail",
			true
		);

		await resetWidget(
			"inpEvtCustomerAddress",
			true
		);

		await resetWidget(
			"inpEvtCustomerNotes",
			true
		);
	},

	async clearVenueQuickAdd() {
		await resetWidget(
			"inpEvtVenueName",
			true
		);

		await resetWidget(
			"inpEvtVenuePhone",
			true
		);

		await resetWidget(
			"inpEvtVenueMobile",
			true
		);

		await resetWidget(
			"inpEvtVenueEmail",
			true
		);

		await resetWidget(
			"inpEvtVenueAddress",
			true
		);

		await resetWidget(
			"inpEvtVenueNotes",
			true
		);
	},

	async openCustomerAdd() {
		if (!jsProposalData.canEditDisplayedDocument()) {
			showAlert(
				"Only a Draft Proposal can be changed.",
				"warning"
			);

			return;
		}

		await this.clearCustomerQuickAdd();

		showModal("mdlEvtCustomer");
	},

	async closeCustomerAdd() {
		closeModal("mdlEvtCustomer");

		await this.clearCustomerQuickAdd();
	},

	async openVenueAdd() {
		if (!jsProposalData.canEditDisplayedDocument()) {
			showAlert(
				"Only a Draft Proposal can be changed.",
				"warning"
			);

			return;
		}

		await this.clearVenueQuickAdd();

		showModal("mdlEvtVenue");
	},

	async closeVenueAdd() {
		closeModal("mdlEvtVenue");

		await this.clearVenueQuickAdd();
	},

	async currentWorkspace() {
		const proposalId = Number(
			appsmith.store.current_proposal_id || 0
		);

		const workspace =
					jsProposalWorkspaces.get(proposalId);

		if (!proposalId || !workspace) {
			throw new Error(
				"The current Proposal workspace could not be loaded."
			);
		}

		return {
			proposalId,
			workspace
		};
	},

	async saveCustomer() {
		const customerName =
					String(
						inpEvtCustomerName.text || ""
					).trim();

		if (!customerName) {
			showAlert(
				"Customer Name is required.",
				"warning"
			);

			return false;
		}

		try {
			const duplicate =
						await qryCheckEvtCustomerDuplicate.run();

			if (duplicate?.length) {
				showAlert(
					`Customer "${customerName}" already exists. Select the existing Customer from the list.`,
					"warning"
				);

				return false;
			}

			const result =
						await qrySaveEvtCustomer.run();

			const customerId = Number(
				result?.[0]?.customer_id ??
				result?.[0]?.id ??
				0
			);

			if (!customerId) {
				throw new Error(
					"Customer was saved, but its ID was not returned."
				);
			}

			await qryGetEvtCustomers.run();

			const {
				proposalId,
				workspace
			} = await this.currentWorkspace();

			await jsProposalWorkspaces.set(
				proposalId,
				{
					...workspace,

					header: {
						...(workspace.header || {}),

						customer_id:
						customerId,

						contact_ids:
						[]
					}
				}
			);

			await resetWidget(
				"selEvtCustomer",
				true
			);

			await resetWidget(
				"msEvtContacts",
				true
			);

			await qryGetEvtContacts.run();

			closeModal("mdlEvtCustomer");

			await this.clearCustomerQuickAdd();

			showAlert(
				`${customerName} added.`,
				"success"
			);

			return true;
		} catch (error) {
			showAlert(
				error?.message ||
				"Customer could not be added.",
				"error"
			);

			return false;
		}
	},

	async saveVenue() {
		const venueName =
					String(
						inpEvtVenueName.text || ""
					).trim();

		if (!venueName) {
			showAlert(
				"Venue Name is required.",
				"warning"
			);

			return false;
		}

		try {
			const duplicate =
						await qryCheckEvtVenueDuplicate.run();

			if (duplicate?.length) {
				showAlert(
					`Venue "${venueName}" already exists. Select the existing Venue from the list.`,
					"warning"
				);

				return false;
			}

			const result =
						await qrySaveEvtVenue.run();

			const venueId = Number(
				result?.[0]?.venue_id ??
				result?.[0]?.id ??
				0
			);

			if (!venueId) {
				throw new Error(
					"Venue was saved, but its ID was not returned."
				);
			}

			await qryGetEvtVenues.run();

			const {
				proposalId,
				workspace
			} = await this.currentWorkspace();

			await jsProposalWorkspaces.set(
				proposalId,
				{
					...workspace,

					header: {
						...(workspace.header || {}),

						venue_id:
						venueId,

						venue_contact_ids:
						[]
					}
				}
			);

			await resetWidget(
				"selEvtVenue",
				true
			);

			await resetWidget(
				"msEvtVenueContacts",
				true
			);

			await qryGetEvtVenueContacts.run();

			closeModal("mdlEvtVenue");

			await this.clearVenueQuickAdd();

			showAlert(
				`${venueName} added.`,
				"success"
			);

			return true;
		} catch (error) {
			showAlert(
				error?.message ||
				"Venue could not be added.",
				"error"
			);

			return false;
		}
	},

	async openContactModal(context) {
		if (!jsProposalData.canEditDisplayedDocument()) {
			showAlert(
				"Only a Draft Proposal can be changed.",
				"warning"
			);

			return;
		}

		const isCustomer =
					context === "customer";

		const selectedIds =
					isCustomer
		? (
			msEvtContacts.selectedOptionValues || []
		)
		: (
			msEvtVenueContacts.selectedOptionValues || []
		);

		await storeValue(
			"evt_contact_context",
			isCustomer ? "customer" : "venue"
		);

		await storeValue(
			"evt_contact_modal_mode",
			selectedIds.length > 0
			? "info"
			: "add"
		);

		await storeValue(
			"evt_contact_add_open",
			selectedIds.length === 0
		);

		await this.clearContactQuickAdd();

		showModal("mdlEvtContact");
	},

	async closeContactModal() {
		closeModal("mdlEvtContact");

		await removeValue(
			"evt_contact_context"
		);

		await removeValue(
			"evt_contact_modal_mode"
		);

		await removeValue(
			"evt_contact_add_open"
		);

		await this.clearContactQuickAdd();
	},

	async toggleContactAdd() {
		const isOpen =
					appsmith.store.evt_contact_add_open === true;

		if (isOpen) {
			await this.clearContactQuickAdd();
		}

		await storeValue(
			"evt_contact_add_open",
			!isOpen
		);
	},

	async clearContactQuickAdd() {
		await resetWidget(
			"inpEvtContactName",
			true
		);

		await resetWidget(
			"inpEvtContactTitle",
			true
		);

		await resetWidget(
			"inpEvtContactPhone",
			true
		);

		await resetWidget(
			"inpEvtContactMobile",
			true
		);

		await resetWidget(
			"inpEvtContactEmail",
			true
		);

		await resetWidget(
			"inpEvtContactNotes",
			true
		);
	},

	contactModalTitle() {
		const context =
					appsmith.store.evt_contact_context;

		const mode =
					appsmith.store.evt_contact_modal_mode;

		if (mode === "add") {
			return context === "venue"
				? "Add Venue Contact"
			: "Add Customer Contact";
		}

		return context === "venue"
			? "Venue Contacts"
		: "Customer Contacts";
	},

	selectedContactIds() {
		const context =
					appsmith.store.evt_contact_context;

		const values =
					context === "venue"
		? msEvtVenueContacts.selectedOptionValues
		: msEvtContacts.selectedOptionValues;

		return (values || [])
			.map(Number)
			.filter(Boolean);
	},

	selectedContactDetails() {
		const context =
					appsmith.store.evt_contact_context;

		const selectedIds =
					new Set(
						this.selectedContactIds()
						.map(String)
					);

		const rows =
					context === "venue"
		? (qryGetEvtVenueContacts.data || [])
		: (qryGetEvtContacts.data || []);

		return rows
			.filter(row =>
							selectedIds.has(String(row.id))
						 )
			.sort((a, b) => {
			const ids =
						this.selectedContactIds();

			return (
				ids.indexOf(Number(a.id)) -
				ids.indexOf(Number(b.id))
			);
		});
	},

	contactDisplayValue(value) {
		const text =
					String(value ?? "").trim();

		return text || "—";
	},
};