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
		closeModal(
			"mdlVenueDuplicateWarning"
		);

		await removeValue(
			"venue_duplicate_name"
		);
	}
};