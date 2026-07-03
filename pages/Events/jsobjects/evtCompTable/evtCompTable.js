export default {
	minRows: 10,

	makeDraftId() {
		return "er_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
	},

	blankRow(lineNo) {
		return {
			draft_row_id: this.makeDraftId(),
			id: null,
			event_id: Number(appsmith.store.current_event_id || 0),
			line_no: lineNo,

			category_id: null,
			category_name: null,

			menu_id: null,
			menu_name: null,

			guests: null,
			extra_guests: null,
			active: true,

			menu_cost: null,
			line_cost: null,

			allergen_names: null,
			diet_tag_names: null
		};
	},

	hasContent(row) {
		return !!(
			row &&
			(
				row.id ||
				row.category_id ||
				row.category_name ||
				row.menu_id ||
				row.menu_name ||
				row.guests ||
				row.extra_guests
			)
		);
	},

	prepareRow(row, lineNo) {
		return {
			...this.blankRow(lineNo),
			...row,

			category_id: row?.category_id || row?.menu_category_id || null,
			category_name: row?.category_name || row?.menu_category_name || null,

			menu_id: row?.menu_id || null,
			menu_name: row?.menu_name || null,

			draft_row_id: row?.draft_row_id || this.makeDraftId(),
			event_id: Number(appsmith.store.current_event_id || 0),
			line_no: lineNo,

			active: row?.active === false ? false : true,
			extra_guests: row?.extra_guests == null || row?.extra_guests === "" ? 0 : Number(row.extra_guests)
		};
	},

	normalizeRows(rows) {
		const realRows = (rows || [])
			.filter(r => this.hasContent(r))
			.map((r, index) => this.prepareRow(r, index + 1));

		const targetCount = Math.max(this.minRows, realRows.length + 1);

		while (realRows.length < targetCount) {
			realRows.push(this.blankRow(realRows.length + 1));
		}

		return realRows;
	},

	async setRows(rows) {
		const normalized = this.normalizeRows(rows);
		await storeValue("evt_components_local_rows", normalized);
		return normalized;
	},

	getRows() {
		const rows = appsmith.store.evt_components_local_rows;
		const currentEventId = Number(appsmith.store.current_event_id || 0);

		if (Array.isArray(rows) && rows.length > 0) {
			const contentRows = rows.filter(r => this.hasContent(r));

			const contentEventIds = contentRows
				.map(r => Number(r.event_id || 0))
				.filter(id => id > 0);

			if (currentEventId > 0) {
				const belongsToCurrentEvent =
					contentEventIds.length === 0 ||
					contentEventIds.every(id => id === currentEventId);

				if (belongsToCurrentEvent) {
					return rows.map((r, index) => ({
						...r,
						event_id: currentEventId,
						line_no: index + 1
					}));
				}
			}

			if (currentEventId === 0 && contentEventIds.length === 0) {
				return rows.map((r, index) => ({
					...r,
					event_id: 0,
					line_no: index + 1
				}));
			}
		}

		return this.normalizeRows([]);
	},

	async loadFromQuery() {
		const queryRows = getEvtComponents.data || [];
		return await this.setRows(queryRows);
	},

	mergeUpdatedRows() {
		const rows = this.getRows();
		const updates = tblEvtComponents.updatedRows || [];

		if (!updates.length) return rows;

		return rows.map((row, index) => {
			const update = updates.find(u =>
				u.index === index ||
				u.rowIndex === index ||
				u.draft_row_id === row.draft_row_id ||
				u.allFields?.draft_row_id === row.draft_row_id ||
				u.updatedFields?.draft_row_id === row.draft_row_id
			);

			if (!update) return row;

			return {
				...row,
				...(update.allFields || {}),
				...(update.updatedFields || {})
			};
		});
	},

	async syncFromTable() {
		const merged = this.mergeUpdatedRows();
		return await this.setRows(merged);
	},

	async patchRow(row, patch) {
		if (!row?.draft_row_id) return;

		await this.syncFromTable();

		const rows = this.getRows().map(r =>
			r.draft_row_id === row.draft_row_id
				? { ...r, ...patch }
				: r
		);

		return await this.setRows(rows);
	},

	categoryOptions() {
		const categories = (getEvtComponentItems.data || [])
			.map(i => ({
				label: i.category_name || "Uncategorized",
				value: i.category_name || "Uncategorized"
			}));

		return [...new Map(categories.map(x => [x.value, x])).values()]
			.sort((a, b) => String(a.label).localeCompare(String(b.label)));
	},

	menuOptions(row) {
		const used = this.usedMenuIds(row);

		return (getEvtComponentItems.data || [])
			.filter(i => !row?.category_name || row.category_name === "Uncategorized" || i.category_name === row.category_name)
			.filter(i => !used.includes(Number(i.id)))
			.sort((a, b) => String(a.name).localeCompare(String(b.name)))
			.map(i => ({
				label: i.name,
				value: i.name
			}));
	},

	menuId(row) {
		return row?.menu_id ? Number(row.menu_id) : null;
	},

	usedMenuIds(currentRow) {
		return this.getRows()
			.filter(r => r.draft_row_id !== currentRow?.draft_row_id)
			.map(r => this.menuId(r))
			.filter(x => x);
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
		if (!row?.draft_row_id) return;

		await this.syncFromTable();

		const freshRow = this.getRows().find(r => r.draft_row_id === row.draft_row_id) || row;

		const item = (getEvtComponentItems.data || []).find(i =>
			i.name === freshRow.menu_name
		);

		if (!item) return;

		return await this.patchRow(freshRow, {
			category_id: item.category_id || null,
			category_name: item.category_name || null,

			menu_id: item.id,
			menu_name: item.name,

			menu_cost: item.cost_per_unit ?? item.total_cost ?? null,
			allergen_names: item.allergen_names || null,
			diet_tag_names: item.diet_tag_names || null,

			line_cost: null,
			active: true
		});
	},

	async deleteRow(row) {
		await this.syncFromTable();

		const remaining = this.getRows().filter(r =>
			r.draft_row_id !== row.draft_row_id
		);

		return await this.setRows(remaining);
	},

	rowsForSave() {
		const rows = this.mergeUpdatedRows();

		return this.normalizeRows(rows)
			.filter(r => this.hasContent(r))
			.map((r, index) => {
				const item = (getEvtComponentItems.data || []).find(i =>
					i.name === r.menu_name
				);

				return {
					event_id: Number(appsmith.store.current_event_id || 0),
					line_no: index + 1,
					menu_id: Number(r.menu_id || item?.id || 0) || null,
					guests: r.guests === "" || r.guests == null ? null : Number(r.guests),
					extra_guests: r.extra_guests === "" || r.extra_guests == null ? 0 : Number(r.extra_guests),
					active: r.active === false ? false : true
				};
			});
	},

	lineCost(row) {
		if (
			!row ||
			row.active === false ||
			!row.menu_name ||
			row.guests === "" ||
			row.guests == null
		) return null;

		const item = (getEvtComponentItems.data || []).find(i =>
			Number(i.id) === Number(row.menu_id) ||
			i.name === row.menu_name
		);

		if (!item) return null;

		const menuCost = Number(item.cost_per_unit ?? item.total_cost ?? 0);
		const guests = Number(row.guests || 0);
		const extra = Number(row.extra_guests || 0);

		const cost = (guests + extra) * menuCost;

		return Math.round(cost * 100) / 100;
	},

	totalGuests() {
		const rows = this.mergeUpdatedRows();

		return rows.reduce((sum, row) => {
			if (row.active === false) return sum;
			return sum + (Number(row.guests || 0) || 0);
		}, 0);
	},

	menuCount() {
		return this.mergeUpdatedRows()
			.filter(r => r.active !== false && r.menu_name)
			.length;
	},

	toProduce() {
		const rows = this.mergeUpdatedRows();

		return rows.reduce((sum, row) => {
			if (row.active === false) return sum;

			const guests = Number(row.guests || 0);
			const extra = Number(row.extra_guests || 0);

			return sum + guests + extra;
		}, 0);
	},

	totalCost() {
		const rows = this.mergeUpdatedRows();

		const total = rows.reduce((sum, row) => {
			const cost = this.lineCost(row);
			return sum + (cost || 0);
		}, 0);

		return Math.round(total * 100) / 100;
	},

	uniqueTextList(value) {
		if (!value) return [];

		return String(value)
			.split(",")
			.map(x => x.trim())
			.filter(x => x);
	},
	
	componentAllergenSummary() {
		const rows = this.mergeUpdatedRows();

		const items = rows
			.filter(r => r.active !== false)
			.flatMap(r => this.uniqueTextList(r.allergen_names));

		return [...new Set(items)].sort().join(", ");
	},

	componentDietTagSummary() {
		const rows = this.mergeUpdatedRows();

		const items = rows
			.filter(r => r.active !== false)
			.flatMap(r => this.uniqueTextList(r.diet_tag_names));

		return [...new Set(items)].sort().join(", ");
	},

	testRowsForSave() {
		return this.rowsForSave();
	},

	debugUpdatedRows() {
		return {
			localRows: this.getRows(),
			updatedRows: tblEvtComponents.updatedRows || [],
			tableData: tblEvtComponents.tableData || []
		};
	}
}