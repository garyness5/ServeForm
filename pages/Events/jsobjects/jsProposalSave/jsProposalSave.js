export default {
	isDraft() {
		return (
			jsProposalData.hasSelectedProposal() &&
			jsProposalData.proposalControl().status === "Draft"
		);
	},

	textClean(value) {
		const text = String(value ?? "").trim();
		return text || null;
	},

	headerSnapshotFromPage() {
		return {
			proposal_id: Number(
				appsmith.store.current_proposal_id || 0
			),

			event_name: this.textClean(inpEvtName.text),
			event_ref: this.textClean(inpEvtRef.text),

			event_datetime: datEvtDate.selectedDate
			? moment(datEvtDate.selectedDate)
			.format("YYYY-MM-DD HH:mm:ss")
			: null,

			event_format:
			selEvtFormat.selectedOptionValue || null,

			total_guests:
			inpTotalGuests.text !== "" &&
			inpTotalGuests.text !== null &&
			inpTotalGuests.text !== undefined
			? Number(inpTotalGuests.text)
			: null,

			event_notes: this.textClean(
				rteEvtNotes.text ||
				rteEvtNotes.value ||
				""
			)
		};
	},

	requiredMessage() {
		if (!this.isDraft()) {
			return "Only a Draft Proposal can be edited.";
		}

		if (!this.headerSnapshotFromPage().event_name) {
			return "Event Name is required.";
		}

		return null;
	},

	menuPayload(rows) {
		return (rows || [])
			.filter(row =>
							row.menu_id ||
							String(row.menu_name || "").trim()
						 )
			.map(row => {
			const item = jsProposalComponents.currentMenu(row);

			const guests =
						row.guests === "" ||
						row.guests == null
			? null
			: Number(row.guests);

			const extra =
						row.extra_guests === "" ||
						row.extra_guests == null
			? 0
			: Number(row.extra_guests);

			const menuCost = Number(
				item?.cost_per_unit ??
				item?.total_cost ??
				row.menu_cost ??
				0
			);

			const kitchenCost =
						row.active === false ||
						guests == null
			? null
			: Math.round(
				(guests + extra) *
				menuCost *
				100
			) / 100;

			return {
				event_component_id:
				row.event_component_id ?? null,

				menu_id:
				row.menu_id ?? null,

				menu_name:
				row.menu_name ?? null,

				guests,
				extra_guests: extra,
				kitchen_cost: kitchenCost,

				allergen_names:
				row.allergen_names ?? null,

				diet_tag_names:
				row.diet_tag_names ?? null,

				notes:
				row.notes ?? null,

				active:
				row.active === false
				? false
				: true
			};
		});
	},

	currentMenuPayload() {
		return this.menuPayload(
			jsProposalComponents.mergeUpdatedRows()
		);
	},

	async saveWorkspace(proposalId) {
		const workspace =
					jsProposalWorkspaces.get(proposalId);

		if (!workspace) {
			return true;
		}

		if (
			!String(
				workspace.header?.event_name || ""
			).trim()
		) {
			showAlert(
				`Draft ${proposalId} needs an Event Name.`,
				"warning"
			);
			return false;
		}

		await storeValue(
			"proposal_save_request",
			{
				proposal_id: Number(proposalId),
				header: workspace.header,
				menus: this.menuPayload(
					workspace.components || []
				)
			}
		);

		try {
			const result =
						await qrySaveProposalDraft.run();

			if (!result?.[0]?.proposal_id) {
				return false;
			}

			await jsProposalWorkspaces.discard(
				proposalId
			);

			return true;
		} finally {
			await removeValue(
				"proposal_save_request"
			);
		}
	},

	async saveAllDirty() {
		await jsProposalWorkspaces
			.captureCurrentDraft();

		const ids =
					jsProposalWorkspaces.dirtyProposalIds();

		for (const proposalId of ids) {
			const saved =
						await this.saveWorkspace(proposalId);

			if (!saved) {
				showAlert(
					`Draft ${proposalId} could not be saved.`,
					"error"
				);
				return false;
			}
		}

		return true;
	},

	async saveDraft() {
		const message = this.requiredMessage();

		if (message) {
			showAlert(message, "warning");
			return false;
		}

		await jsProposalWorkspaces.captureCurrentDraft();

		const result = await qrySaveProposalDraft.run();

		if (!result?.[0]?.proposal_id) {
			showAlert(
				"Proposal Draft was not saved.",
				"error"
			);
			return false;
		}

		await Promise.all([
			qryGetSelectedProposal.run(),
			qryGetSelectedProposalMenus.run(),
			qryGetProposalsForEvent.run()
		]);

		await jsProposalWorkspaces.discard(
			Number(appsmith.store.current_proposal_id || 0)
		);

		await jsProposalWorkspaces.initializeCurrentDraft();

		await Promise.all([
			resetWidget("inpEvtName", true),
			resetWidget("datEvtDate", true),
			resetWidget("inpEvtRef", true),
			resetWidget("inpTotalGuests", true),
			resetWidget("selEvtFormat", true),
			resetWidget("rteEvtNotes", true)
		]);

		showAlert(
			"Proposal Draft saved.",
			"success"
		);

		return true;
	}
};