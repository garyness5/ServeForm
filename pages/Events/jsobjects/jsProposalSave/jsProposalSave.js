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
		const selectedDate =
			datEvtDate.selectedDate || null;

		return {
			proposal_id: Number(
				appsmith.store.current_proposal_id || 0
			),

			event_name:
				this.textClean(inpEvtName.text),

			event_ref:
				this.textClean(inpEvtRef.text),

			event_date:
				selectedDate
					? moment
						.utc(selectedDate)
						.format("YYYY-MM-DD")
					: null,

			event_time:
				selectedDate
					? moment
						.utc(selectedDate)
						.format("HH:mm:ss")
					: null,

			event_datetime:
				selectedDate
					? moment
						.utc(selectedDate)
						.format(
							"YYYY-MM-DD HH:mm:ss"
						)
					: null,

			event_format:
				selEvtFormat.selectedOptionValue ||
				null,

			total_guests:
				inpTotalGuests.text === "" ||
				inpTotalGuests.text === null ||
				inpTotalGuests.text === undefined
					? null
					: Number(inpTotalGuests.text),

			event_notes:
				this.textClean(
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
				Number(row.menu_id || 0) > 0 ||
				String(row.menu_name || "").trim()
			)
			.map((row, index) => {
				const derived =
					jsProposalComponents
						.refreshDerivedFields(row);

				return {
					line_no: index + 1,

					menu_id:
						Number(
							derived.menu_id || 0
						) || null,

					category_id:
						Number(
							derived.category_id || 0
						) || null,

					category_name:
						this.textClean(
							derived.category_name
						),

					menu_name:
						this.textClean(
							derived.current_menu_name ||
							derived.menu_name
						),

					guests:
						derived.guests == null
							? null
							: Number(
								derived.guests
							),

					extra_guests:
						derived.extra_guests == null
							? 0
							: Number(
								derived.extra_guests
							),

					kitchen_cost:
						derived.line_cost == null
							? null
							: Number(
								derived.line_cost
							),

					allergen_names:
						this.textClean(
							derived.allergen_names
						),

					diet_tag_names:
						this.textClean(
							derived.diet_tag_names
						),

					notes:
						this.textClean(
							derived.notes
						),

					active:
						derived.active === false
							? false
							: true
				};
			});
	},

	buildRequest(
		proposalId,
		header,
		components
	) {
		return {
			proposal_id:
				Number(proposalId || 0),

			header:
				header || {},

			menus:
				this.menuPayload(
					components || []
				)
		};
	},

	async runSaveRequest(request) {
		await storeValue(
			"proposal_save_request",
			request
		);

		try {
			const result =
				await qrySaveProposalDraft.run();

			return Number(
				result?.[0]?.proposal_id || 0
			) > 0;
		} finally {
			await removeValue(
				"proposal_save_request"
			);
		}
	},

	async saveWorkspace(proposalId) {
		const id =
			Number(proposalId || 0);

		const workspace =
			jsProposalWorkspaces.get(id);

		if (!workspace) {
			return true;
		}

		if (
			!String(
				workspace.header?.event_name || ""
			).trim()
		) {
			showAlert(
				`Draft ${id} needs an Event Name.`,
				"warning"
			);

			return false;
		}

		const request =
			this.buildRequest(
				id,
				workspace.header,
				workspace.components
			);

		const saved =
			await this.runSaveRequest(request);

		if (!saved) {
			return false;
		}

		await jsProposalWorkspaces.discard(id);

		return true;
	},

	async saveAllDirty() {
		await jsProposalWorkspaces
			.captureCurrentDraft();

		const ids =
			jsProposalWorkspaces
				.dirtyProposalIds();

		for (const proposalId of ids) {
			const saved =
				await this.saveWorkspace(
					proposalId
				);

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

	async refreshCurrentDraft(proposalId) {
		await Promise.all([
			qryGetSelectedProposal.run(),
			qryGetSelectedProposalMenus.run(),
			qryGetProposalsForEvent.run()
		]);

		await jsProposalWorkspaces.discard(
			proposalId
		);

		await jsProposalWorkspaces
			.initializeCurrentDraft();

		await Promise.all([
			resetWidget("inpEvtName", true),
			resetWidget("datEvtDate", true),
			resetWidget("inpEvtRef", true),
			resetWidget("inpTotalGuests", true),
			resetWidget("selEvtFormat", true),
			resetWidget("rteEvtNotes", true)
		]);
	},

	async saveDraft() {
		const message =
			this.requiredMessage();

		if (message) {
			showAlert(
				message,
				"warning"
			);

			return false;
		}

		await jsProposalWorkspaces
			.captureCurrentDraft();

		const proposalId = Number(
			appsmith.store.current_proposal_id || 0
		);

		const request =
			this.buildRequest(
				proposalId,
				this.headerSnapshotFromPage(),
				jsProposalComponents
					.effectiveRows()
			);

		const saved =
			await this.runSaveRequest(request);

		if (!saved) {
			showAlert(
				"Proposal Draft was not saved.",
				"error"
			);

			return false;
		}

		await this.refreshCurrentDraft(
			proposalId
		);

		showAlert(
			"Proposal Draft saved.",
			"success"
		);

		return true;
	}
};