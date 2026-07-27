export default {
	async save(closeAfter) {
		const venueName =
					(inpVenueName.text || "").trim();

		if (!venueName) {
			showAlert(
				"Venue Name is required.",
				"warning"
			);
			return;
		}

		try {
			const duplicate =
						await qryCheckVenueDuplicate.run();

			if (duplicate?.length) {
				await storeValue(
					"venue_duplicate_name",
					venueName
				);

				showModal(
					"mdlVenueDuplicateWarning"
				);

				return;
			}

			const result =
						await saveVenueMaster.run();

			const savedRow =
						Array.isArray(result)
			? result[0]
			: Array.isArray(
				saveVenueMaster.data
			)
			? saveVenueMaster.data[0]
			: result;

			const savedVenueId = Number(
				savedRow?.venue_id ??
				savedRow?.id ??
				0
			);

			if (!savedVenueId) {
				throw new Error(
					"Venue was not saved."
				);
			}

			await storeValue(
				"current_venue_id",
				savedVenueId
			);

			await storeValue(
				"original_venue_name",
				venueName
			);

			await removeValue(
				"venue_duplicate_name"
			);

			await getVenues.run();

			showAlert(
				"Venue saved.",
				"success"
			);

			if (closeAfter === false) {
				await venueSave.prepareNew();
			} else {
				closeModal("mdlVenue");
			}
		} catch (error) {
			showAlert(
				error?.message ||
				"Venue could not be saved.",
				"error"
			);
		}
	},

	async prepareNew() {
		await storeValue(
			"venue_form_mode",
			"add"
		);

		await storeValue(
			"current_venue_id",
			0
		);

		await storeValue(
			"venue_contact_ids",
			[]
		);

		await storeValue(
			"venueAccordion",
			""
		);

		await removeValue(
			"original_venue_name"
		);

		await removeValue(
			"venue_duplicate_name"
		);

		await contactSave.resetQuickFields();

		await resetWidget(
			"mdlVenue",
			true
		);

		await resetWidget(
			"msVenueContacts",
			true
		);
	},

	async openNew() {
		await venueSave.prepareNew();

		showModal(
			"mdlVenue"
		);
	},

	async openEdit() {
		const selectedVenue =
					tblVenues.selectedRow;

		const venueId = Number(
			selectedVenue?.id || 0
		);

		if (!venueId) {
			showAlert(
				"Select a Venue first.",
				"warning"
			);
			return;
		}

		await storeValue(
			"current_venue_id",
			venueId
		);

		await storeValue(
			"venue_form_mode",
			"edit"
		);

		await storeValue(
			"original_venue_name",
			selectedVenue.venue_name || ""
		);

		await storeValue(
			"venueAccordion",
			""
		);

		await removeValue(
			"venue_duplicate_name"
		);

		await contactSave.resetQuickFields();

		await getVenueContactLinks.run();

		await storeValue(
			"venue_contact_ids",
			(getVenueContactLinks.data || [])
			.map(
				row =>
				String(row.contact_id)
			)
		);

		await resetWidget(
			"mdlVenue",
			true
		);

		await resetWidget(
			"msVenueContacts",
			true
		);

		showModal(
			"mdlVenue"
		);
	},

	async duplicate() {
		const sourceId = Number(
			tblVenues.selectedRow?.id || 0
		);

		if (!sourceId) {
			showAlert(
				"Select a Venue to duplicate.",
				"warning"
			);
			return;
		}

		try {
			const result =
						await duplicateVenueMaster.run();

			const duplicatedVenueId = Number(
				result?.[0]?.venue_id || 0
			);

			if (!duplicatedVenueId) {
				throw new Error(
					"The duplicated Venue ID was not returned."
				);
			}

			await storeValue(
				"current_venue_id",
				duplicatedVenueId
			);

			await storeValue(
				"venue_form_mode",
				"edit"
			);

			await storeValue(
				"venueAccordion",
				""
			);

			await getVenues.run();

			const duplicatedRow =
						(getVenues.data || []).find(
							row =>
							Number(row.id) === duplicatedVenueId
						);

			await storeValue(
				"original_venue_name",
				duplicatedRow?.venue_name || ""
			);

			await getVenueContactLinks.run();

			await storeValue(
				"venue_contact_ids",
				(getVenueContactLinks.data || []).map(
					row => String(row.contact_id)
				)
			);

			await resetWidget(
				"mdlVenue",
				true
			);

			await resetWidget(
				"msVenueContacts",
				true
			);

			showModal("mdlVenue");

			showAlert(
				"Venue duplicated.",
				"success"
			);
		} catch (error) {
			showAlert(
				error?.message ||
				"Venue could not be duplicated.",
				"error"
			);
		}
	},

	async close() {
		await storeValue(
			"venueAccordion",
			""
		);

		await contactSave.resetQuickFields();

		closeModal(
			"mdlVenue"
		);
	},

	async closeDuplicateWarning() {
		closeModal("mdlVenueDuplicateWarning");

		await removeValue("venue_duplicate_name");

		showModal("mdlVenue");
	},

	async openDelete() {
		const venueId = Number(tblVenues.selectedRow?.id || 0);

		if (!venueId) {
			showAlert("Select a Venue to delete.", "warning");
			return;
		}

		await storeValue("current_venue_id", venueId);

		showModal("mdlVenueDelConfirm");
	},

	async deleteVenue() {
		const venueId = Number(
			appsmith.store.current_venue_id ||
			tblVenues.selectedRow?.id ||
			0
		);

		if (!venueId) {
			showAlert("No Venue is selected.", "warning");
			return;
		}

		try {
			const result = await deleteVenueMaster.run();

			if (!result?.length) {
				throw new Error("The Venue was not deleted.");
			}

			closeModal("mdlVenueDelConfirm");

			await removeValue("current_venue_id");
			await removeValue("current_venue_record");
			await removeValue("venue_contact_ids");

			await getVenues.run();

			showAlert("Venue deleted.", "success");
		} catch (error) {
			showAlert(
				error?.message || "Venue could not be deleted.",
				"error"
			);
		}
	},

	async cancelDelete() {
		closeModal("mdlVenueDelConfirm");
		await removeValue("current_venue_id");
	}
};