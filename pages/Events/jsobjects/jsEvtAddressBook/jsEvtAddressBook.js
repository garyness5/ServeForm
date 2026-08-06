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

	async refreshContactOptions(context) {
		if (context === "venue") {
			await qryGetEvtVenueContacts.run();
			return qryGetEvtVenueContacts.data || [];
		}

		await qryGetEvtContacts.run();
		return qryGetEvtContacts.data || [];
	},

	async resetContactSelection(context) {
		if (context === "venue") {
			await resetWidget(
				"msEvtVenueContacts",
				true
			);
		} else {
			await resetWidget(
				"msEvtContacts",
				true
			);
		}

		return await this.refreshContactOptions(context);
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

		const hasSelectedContacts =
					selectedIds.length > 0;

		/*
	 * Locked Proposals may view existing Contact details,
	 * but they may not open Add mode.
	 */
		if (
			!jsProposalData.canEditDisplayedDocument() &&
			!hasSelectedContacts
		) {
			showAlert(
				"Only a Draft Proposal can add a Contact.",
				"warning"
			);

			return;
		}

		await storeValue(
			"evt_contact_context",
			isCustomer ? "customer" : "venue"
		);

		await storeValue(
			"evt_contact_modal_mode",
			hasSelectedContacts
			? "info"
			: "add"
		);

		await storeValue(
			"evt_contact_add_open",
			hasSelectedContacts
			? false
			: true
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
			.map(String)
			.filter(Boolean);
	},

	selectedContactDetails() {
		const context =
					appsmith.store.evt_contact_context;

		const selectedIds =
					this.selectedContactIds();

		const selectedSet =
					new Set(selectedIds);

		const rows =
					context === "venue"
		? (qryGetEvtVenueContacts.data || [])
		: (qryGetEvtContacts.data || []);

		return rows
			.filter(row =>
							selectedSet.has(
			String(row.value ?? row.id ?? "")
		)
						 )
			.sort((a, b) => {
			const aId =
						String(a.value ?? a.id ?? "");

			const bId =
						String(b.value ?? b.id ?? "");

			return (
				selectedIds.indexOf(aId) -
				selectedIds.indexOf(bId)
			);
		});
	},

	async captureContactSelection(context) {
		await new Promise(resolve =>
											setTimeout(resolve, 50)
										 );

		const {
			proposalId,
			workspace
		} = await this.currentWorkspace();

		const isVenue =
					context === "venue";

		const values =
					isVenue
		? msEvtVenueContacts.selectedOptionValues
		: msEvtContacts.selectedOptionValues;

		const selectedIds =
					(values || [])
		.map(Number)
		.filter(Boolean);

		const parentId = Number(
			isVenue
			? selEvtVenue.selectedOptionValue
			: selEvtCustomer.selectedOptionValue
		) || 0;

		await jsProposalWorkspaces.set(
			proposalId,
			{
				...workspace,

				header: {
					...(workspace.header || {}),

					[isVenue
					? "venue_contact_ids"
					: "contact_ids"]:
					selectedIds
				}
			}
		);

		/*
	 * Selecting a Contact permanently adds or restores
	 * the Address Book relationship.
	 *
	 * Removing it from this Proposal does not unlink it.
	 */
		if (
			parentId > 0 &&
			selectedIds.length > 0
		) {
			if (isVenue) {
				await qryLinkEvtVenueContacts.run({
					venue_id: parentId,
					contact_ids: selectedIds
				});
			} else {
				await qryLinkEvtCustomerContacts.run({
					customer_id: parentId,
					contact_ids: selectedIds
				});
			}

			await this.refreshContactOptions(context);
		}

		return selectedIds;
	},

	contactDisplayValue(value) {
		const text =
					String(value ?? "").trim();

		return text || "—";
	},

	async captureParentSelection(context) {
		await new Promise(resolve =>
											setTimeout(resolve, 50)
										 );

		const {
			proposalId,
			workspace
		} = await this.currentWorkspace();

		const isVenue =
					context === "venue";

		const selectedId = Number(
			isVenue
			? selEvtVenue.selectedOptionValue
			: selEvtCustomer.selectedOptionValue
		) || null;

		await jsProposalWorkspaces.set(
			proposalId,
			{
				...workspace,

				header: {
					...(workspace.header || {}),

					[isVenue
					? "venue_id"
					: "customer_id"]:
					selectedId,

					[isVenue
					? "venue_contact_ids"
					: "contact_ids"]:
					[]
				}
			}
		);

		await this.resetContactSelection(context);

		return selectedId;
	},

	async saveContact() {
		const contactName =
					String(
						inpEvtContactName.text || ""
					).trim();

		if (!contactName) {
			showAlert(
				"Contact Name is required.",
				"warning"
			);

			return false;
		}

		if (!jsProposalData.canEditDisplayedDocument()) {
			showAlert(
				"Only a Draft Proposal can add a Contact.",
				"warning"
			);

			return false;
		}

		const context =
					appsmith.store.evt_contact_context;

		const isVenue =
					context === "venue";

		const parentId = Number(
			isVenue
			? selEvtVenue.selectedOptionValue
			: selEvtCustomer.selectedOptionValue
		) || 0;

		if (!parentId) {
			showAlert(
				isVenue
				? "Select a Venue before adding a Venue Contact."
				: "Select a Customer before adding a Customer Contact.",
				"warning"
			);

			return false;
		}

		try {
			const duplicate =
						await qryCheckEvtContactDuplicate.run();

			if (duplicate?.length) {
				showAlert(
					`Contact "${contactName}" already exists. Select the existing Contact from the list.`,
					"warning"
				);

				return false;
			}

			const result =
						await qrySaveEvtContact.run();

			const contactId = Number(
				result?.[0]?.contact_id ??
				result?.[0]?.id ??
				0
			);

			if (!contactId) {
				throw new Error(
					"Contact was saved, but its ID was not returned."
				);
			}

			const {
				proposalId,
				workspace
			} = await this.currentWorkspace();

			const currentIds = (
				isVenue
				? msEvtVenueContacts.selectedOptionValues
				: msEvtContacts.selectedOptionValues
			)
			.map(Number)
			.filter(Boolean);

			const selectedIds = [
				...new Set([
					...currentIds,
					contactId
				])
			];

			await jsProposalWorkspaces.set(
				proposalId,
				{
					...workspace,

					header: {
						...(workspace.header || {}),

						[isVenue
						? "venue_contact_ids"
						: "contact_ids"]:
						selectedIds
					}
				}
			);

			if (isVenue) {
				await qryGetEvtVenueContacts.run();

				await resetWidget(
					"msEvtVenueContacts",
					true
				);
			} else {
				await qryGetEvtContacts.run();

				await resetWidget(
					"msEvtContacts",
					true
				);
			}

			await storeValue(
				"evt_contact_modal_mode",
				"info"
			);

			await storeValue(
				"evt_contact_add_open",
				false
			);

			await this.clearContactQuickAdd();

			showAlert(
				`${contactName} added.`,
				"success"
			);

			return true;
		} catch (error) {
			showAlert(
				error?.message ||
				"Contact could not be added.",
				"error"
			);

			return false;
		}
	},
};