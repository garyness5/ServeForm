export default {
	minRows: 10,

	isProposalMode() {
		return jsProposalData.hasSelectedProposal();
	},

	isDraftMode() {
		return jsProposalData.isProposalDraft();
	},

	isLockedMode() {
		return jsProposalData.isProposalLocked();
	},

	makeDraftId() {
		return (
			"pr_" +
			Date.now().toString(36) +
			"_" +
			Math.random().toString(36).slice(2, 8)
		);
	},

	blankRow(lineNo) {
		return {
			draft_row_id: this.makeDraftId(),
			source_type: "proposal",

			id: null,
			proposal_id: Number(
				appsmith.store.current_proposal_id || 0
			),
			event_id: Number(
				appsmith.store.current_event_id || 0
			),
			event_component_id: null,

			line_no: lineNo,

			category_id: null,
			category_name: null,

			menu_id: null,
			menu_name: null,

			guests: null,
			extra_guests: null,
			production_guests: null,

			menu_cost: null,
			line_cost: null,

			allergen_names: null,
			diet_tag_names: null,
			notes: null,

			active: true,
			component_status: "Active"
		};
	},

	hasContent(row) {
		return !!(
			row &&
			(
				row.id ||
				row.menu_id ||
				row.menu_name ||
				row.category_id ||
				row.category_name ||
				row.guests !== null &&
				row.guests !== undefined &&
				row.guests !== "" ||
				row.extra_guests !== null &&
				row.extra_guests !== undefined &&
				row.extra_guests !== ""
			)
		);
	},

	currentMenu(row) {
		return (getEvtComponentItems.data || []).find(item =>
																									Number(item.id) === Number(row?.menu_id || 0) ||
																									item.name === row?.menu_name
																								 );
	},

	prepareRow(row, lineNo) {
		const item = this.currentMenu(row);

		const guests =
					row?.guests === "" ||
					row?.guests === null ||
					row?.guests === undefined
		? null
		: Number(row.guests);

		const extras =
					row?.extra_guests === "" ||
					row?.extra_guests === null ||
					row?.extra_guests === undefined
		? null
		: Number(row.extra_guests);

		return {
			...this.blankRow(lineNo),
			...row,

			draft_row_id:
			row?.draft_row_id || this.makeDraftId(),

			source_type: "proposal",

			proposal_id: Number(
				appsmith.store.current_proposal_id || 0
			),

			event_id: Number(
				appsmith.store.current_event_id || 0
			),

			line_no: lineNo,

			category_id:
			row?.category_id ??
			item?.category_id ??
			null,

			category_name:
			row?.category_name ??
			item?.category_name ??
			null,

			menu_id: row?.menu_id ?? null,
			menu_name: row?.menu_name ?? null,

			guests,
			extra_guests: extras,

			production_guests:
			guests == null
			? null
			: guests + Number(extras || 0),

			menu_cost:
			item?.cost_per_unit ??
			item?.total_cost ??
			row?.menu_cost ??
			null,

			line_cost: row?.line_cost ?? null,

			allergen_names:
			item?.allergen_names ??
			row?.allergen_names ??
			null,

			diet_tag_names:
			item?.diet_tag_names ??
			row?.diet_tag_names ??
			null,

			notes: row?.notes ?? null,

			active: row?.active === false ? false : true,

			component_status:
			row?.component_status || "Active"
		};
	},

	normalizeRows(rows) {
		const realRows = (rows || [])
		.filter(row => this.hasContent(row))
		.map((row, index) =>
				 this.prepareRow(row, index + 1)
				);

		const targetCount = Math.max(
			this.minRows,
			realRows.length + 1
		);

		while (realRows.length < targetCount) {
			realRows.push(
				this.blankRow(realRows.length + 1)
			);
		}

		return realRows;
	},

	queryRows() {
		return (qryGetSelectedProposalMenus.data || [])
			.map((row, index) => {
			const item = this.currentMenu(row);

			return {
				...row,

				draft_row_id:
				`proposal_${row.proposal_id}_${row.id}`,

				source_type: "proposal",

				line_no:
				row.line_no ?? index + 1,

				category_id:
				item?.category_id ?? null,

				category_name:
				item?.category_name ?? null,

				menu_cost: null,
				line_cost: row.kitchen_cost,

				active:
				row.active === false
				? false
				: true
			};
		});
	},

	draftRows() {
		const workspace =
					jsProposalWorkspaces.get();

		if (
			workspace &&
			Array.isArray(workspace.components)
		) {
			return workspace.components;
		}

		return this.normalizeRows(
			this.queryRows()
		);
	},

	rows() {
		if (!this.isProposalMode()) {
			return evtCompTable.getRows();
		}

		if (this.isDraftMode()) {
			return this.draftRows();
		}

		return this.queryRows();
	},

	mergeUpdatedRows() {
		const rows = this.draftRows();
		const updates =
					tblEvtComponents.updatedRows || [];

		if (!updates.length) {
			return rows;
		}

		return rows.map((row, index) => {
			const update = updates.find(item =>
																	item.index === index ||
																	item.rowIndex === index ||
																	item.draft_row_id === row.draft_row_id ||
																	item.allFields?.draft_row_id ===
																	row.draft_row_id ||
																	item.updatedFields?.draft_row_id ===
																	row.draft_row_id
																 );

			if (!update) {
				return row;
			}

			return this.prepareRow(
				{
					...row,
					...(update.allFields || {}),
					...(update.updatedFields || {})
				},
				index + 1
			);
		});
	},

	effectiveRows() {
		if (this.isDraftMode()) {
			return this.mergeUpdatedRows();
		}

		return this.rows();
	},

	async setDraftRows(rows) {
		if (!this.isDraftMode()) {
			return null;
		}

		await jsProposalWorkspaces
			.setCurrentComponents(rows);

		return jsProposalWorkspaces
			.get()?.components || [];
	},

	async syncFromTable() {
		return await this.setDraftRows(
			this.mergeUpdatedRows()
		);
	},

	async patchRow(row, patch) {
		if (
			!this.isDraftMode() ||
			!row?.draft_row_id
		) {
			return null;
		}

		await this.syncFromTable();

		const rows = this.draftRows().map(item =>
																			item.draft_row_id === row.draft_row_id
																			? { ...item, ...patch }
																			: item
																		 );

		return await this.setDraftRows(rows);
	},

	categoryOptions() {
		return evtCompTable.categoryOptions();
	},

	menuOptions(row) {
		const usedIds = this.draftRows()
		.filter(item =>
						item.draft_row_id !== row?.draft_row_id
					 )
		.map(item => Number(item.menu_id || 0))
		.filter(Boolean);

		return (getEvtComponentItems.data || [])
			.filter(item =>
							!row?.category_name ||
							row.category_name === "Uncategorized" ||
							item.category_name === row.category_name
						 )
			.filter(item =>
							!usedIds.includes(Number(item.id))
						 )
			.sort((a, b) =>
						String(a.name).localeCompare(
			String(b.name)
		)
					 )
			.map(item => ({
			label: item.name,
			value: item.name
		}));
	},

	async onCategoryChange(row) {
		return await this.patchRow(row, {
			category_name: row.category_name || null,
			category_id: null,

			menu_id: null,
			menu_name: null,

			menu_cost: null,
			line_cost: null,

			allergen_names: null,
			diet_tag_names: null
		});
	},

	async onMenuChange(row) {
		if (!this.isDraftMode()) {
			return null;
		}

		await this.syncFromTable();

		const freshRow =
					this.draftRows().find(item =>
																item.draft_row_id === row.draft_row_id
															 ) || row;

		const item = (
			getEvtComponentItems.data || []
		).find(menu =>
					 menu.name === freshRow.menu_name
					);

		if (!item) {
			return null;
		}

		return await this.patchRow(freshRow, {
			category_id: item.category_id || null,
			category_name:
			item.category_name || null,

			menu_id: item.id,
			menu_name: item.name,

			menu_cost:
			item.cost_per_unit ??
			item.total_cost ??
			null,

			allergen_names:
			item.allergen_names || null,

			diet_tag_names:
			item.diet_tag_names || null,

			line_cost: null,
			active: true,
			component_status: "Active"
		});
	},

	async deleteRow(row) {
		if (!this.isDraftMode()) {
			return null;
		}

		await this.syncFromTable();

		const remaining = this.draftRows()
		.filter(item =>
						item.draft_row_id !== row.draft_row_id
					 );

		return await this.setDraftRows(remaining);
	},

	lineCost(row) {
		if (!row || row.active === false) {
			return null;
		}

		if (this.isLockedMode()) {
			const storedCost = Number(
				row.line_cost ?? row.kitchen_cost
			);

			return Number.isFinite(storedCost)
				? Math.round(storedCost * 100) / 100
			: null;
		}

		if (
			!row.menu_name ||
			row.guests === "" ||
			row.guests === null ||
			row.guests === undefined
		) {
			return null;
		}

		const item = this.currentMenu(row);

		if (!item) {
			return null;
		}

		const menuCost = Number(
			item.cost_per_unit ??
			item.total_cost ??
			0
		);

		const production =
					Number(row.guests || 0) +
					Number(row.extra_guests || 0);

		const cost = production * menuCost;

		return Math.round(cost * 100) / 100;
	},

	totalGuests() {
		return this.effectiveRows().reduce(
			(sum, row) => {
				if (row.active === false) {
					return sum;
				}

				return sum + Number(row.guests || 0);
			},
			0
		);
	},

	toProduce() {
		return this.effectiveRows().reduce(
			(sum, row) => {
				if (row.active === false) {
					return sum;
				}

				return (
					sum +
					Number(row.guests || 0) +
					Number(row.extra_guests || 0)
				);
			},
			0
		);
	},

	totalCost() {
		const total = this.effectiveRows().reduce(
			(sum, row) =>
			sum + Number(this.lineCost(row) || 0),
			0
		);

		return Math.round(total * 100) / 100;
	},

	uniqueTextList(value) {
		if (!value) {
			return [];
		}

		return String(value)
			.split(",")
			.map(item => item.trim())
			.filter(Boolean);
	},

	allergenSummary() {
		const values = this.effectiveRows()
		.filter(row => row.active !== false)
		.flatMap(row =>
						 this.uniqueTextList(
			row.allergen_names
		)
						);

		return [...new Set(values)]
			.sort()
			.join(", ");
	},

	dietTagSummary() {
		const values = this.effectiveRows()
		.filter(row => row.active !== false)
		.flatMap(row =>
						 this.uniqueTextList(
			row.diet_tag_names
		)
						);

		return [...new Set(values)]
			.sort()
			.join(", ");
	}
};