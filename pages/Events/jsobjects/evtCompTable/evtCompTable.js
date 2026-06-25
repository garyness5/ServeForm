export default {
	minRows: 10,

	makeDraftId() {
		return "dr_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
	},

	blankRow(lineNo) {
		return {
			draft_row_id: this.makeDraftId(),
			id: null,
			menu_id: Number(appsmith.store.current_menu_id || 0),
			line_no: lineNo,

			item_type: null,
			component_category: null,
			component_name: null,

			ingredient_id: null,
			child_recipe_id: null,
			child_dish_id: null,

			qty: null,
			unit_id: null,
			unit_abbreviation: null,
			unit_type: null,

			apply_wastage: true,
			active: true,

			wastage_percent: null,
			price_per_unit: null,
			cost_per_base_unit: null,
			factor_to_base: null,

			allergen_names: null,
			diet_tag_names: null,
			line_cost: null
		};
	},

	hasContent(row) {
		return !!(
			row &&
			(
				row.id ||
				row.item_type ||
				row.component_category ||
				row.component_name ||
				row.ingredient_id ||
				row.child_recipe_id ||
				row.child_dish_id ||
				row.qty ||
				row.unit_id ||
				row.unit_abbreviation
			)
		);
	},

	prepareRow(row, lineNo) {
		return {
			...this.blankRow(lineNo),
			...row,
			draft_row_id: row?.draft_row_id || this.makeDraftId(),
			line_no: lineNo,
			menu_id: Number(appsmith.store.current_menu_id || 0),
			apply_wastage: row?.apply_wastage === false ? false : true,
			active: row?.active === false ? false : true
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
		await storeValue("mnu_components_local_rows", normalized);
		return normalized;
	},

	getRows() {
		const rows = appsmith.store.mnu_components_local_rows;
		const currentMenuId = Number(appsmith.store.current_menu_id || 0);

		if (Array.isArray(rows) && rows.length > 0) {
			const contentRows = rows.filter(r => this.hasContent(r));

			const contentMenuIds = contentRows
				.map(r => Number(r.menu_id || 0))
				.filter(id => id > 0);

			if (currentMenuId > 0) {
				const belongsToCurrentMenu =
					contentMenuIds.length === 0 ||
					contentMenuIds.every(id => id === currentMenuId);

				if (belongsToCurrentMenu) {
					return rows.map((r, index) => ({
						...r,
						menu_id: currentMenuId,
						line_no: index + 1
					}));
				}
			}

			if (currentMenuId === 0 && contentMenuIds.length === 0) {
				return rows.map((r, index) => ({
					...r,
					menu_id: 0,
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

	clearAfterItemType(row) {
		return {
			item_type: row.item_type || null,
			component_category: null,
			component_name: null,
			ingredient_id: null,
			child_recipe_id: null,
			child_dish_id: null,
			qty: null,
			unit_id: null,
			unit_abbreviation: null,
			unit_type: null,
			wastage_percent: null,
			price_per_unit: null,
			cost_per_base_unit: null,
			factor_to_base: null,
			allergen_names: null,
			diet_tag_names: null,
			line_cost: null,
			apply_wastage: true,
			active: true
		};
	},

	clearAfterCategory(row) {
		return {
			component_category: row.component_category || null,
			component_name: null,
			ingredient_id: null,
			child_recipe_id: null,
			child_dish_id: null,
			qty: null,
			unit_id: null,
			unit_abbreviation: null,
			unit_type: null,
			wastage_percent: null,
			price_per_unit: null,
			cost_per_base_unit: null,
			factor_to_base: null,
			allergen_names: null,
			diet_tag_names: null,
			line_cost: null,
			apply_wastage: true,
			active: true
		};
	},

	async onItemTypeChange(row) {
		return await this.patchRow(row, this.clearAfterItemType(row));
	},

	async onCategoryChange(row) {
		return await this.patchRow(row, this.clearAfterCategory(row));
	},

	async clearRows() {
		await removeValue("mnu_components_local_rows");
	},

	itemId(row) {
		if (!row) return null;

		if (row.item_type === "ingredient") return row.ingredient_id;
		if (row.item_type === "recipe") return row.child_recipe_id;
		if (row.item_type === "dish") return row.child_dish_id;

		return null;
	},

	itemKey(row) {
		if (!row?.item_type) return null;

		const id = this.itemId(row);
		if (!id) return null;

		return `${row.item_type}:${id}`;
	},

	usedItemKeys(currentRow) {
		return this.getRows()
			.filter(r => r.draft_row_id !== currentRow?.draft_row_id)
			.map(r => this.itemKey(r))
			.filter(x => x);
	},

	categoryOptions(row) {
		const itemType = row?.item_type;
		if (!itemType) return [];

		const categories = (getEvtComponentItems.data || [])
			.filter(i => i.item_type === itemType)
			.map(i => i.category_name)
			.filter(x => x);

		return [...new Set(categories)]
			.sort()
			.map(x => ({ label: x, value: x }));
	},

	itemOptions(row) {
		const itemType = row?.item_type;
		if (!itemType) return [];

		const used = this.usedItemKeys(row);

		return (getEvtComponentItems.data || [])
			.filter(i => i.item_type === itemType)
			.filter(i => !row?.component_category || i.category_name === row.component_category)
			.filter(i => !used.includes(`${i.item_type}:${i.id}`))
			.sort((a, b) => String(a.name).localeCompare(String(b.name)))
			.map(i => ({
				label: i.name,
				value: i.name
			}));
	},

	async onItemChange(row) {
		if (!row?.draft_row_id) return;

		await this.syncFromTable();

		const freshRow = this.getRows().find(r => r.draft_row_id === row.draft_row_id) || row;

		const item = (getEvtComponentItems.data || []).find(i =>
			i.item_type === freshRow.item_type &&
			i.name === freshRow.component_name
		);

		if (!item) return;

		return await this.patchRow(freshRow, {
			item_type: item.item_type,
			component_category: item.category_name,
			component_name: item.name,

			ingredient_id: item.item_type === "ingredient" ? item.id : null,
			child_recipe_id: item.item_type === "recipe" ? item.id : null,
			child_dish_id: item.item_type === "dish" ? item.id : null,

			unit_id: item.default_unit_id,
			unit_abbreviation: item.default_unit,
			unit_type: item.unit_type,

			wastage_percent: item.wastage_percent,
			price_per_unit: item.price_per_unit,
			cost_per_base_unit: item.cost_per_base_unit,
			factor_to_base: item.factor_to_base,

			allergen_names: item.allergen_names,
			diet_tag_names: item.diet_tag_names,

			child_deleted: false,
			child_active: true,
			component_status: "active",

			apply_wastage: true,
			active: true,
			line_cost: null
		});
	},

	async clearDraftRows() {
		await removeValue("mnu_components_local_rows");
		return await this.setRows([]);
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
				const isDeletedChild =
					r.component_status === "child_deleted" ||
					r.child_deleted === true;

				if (isDeletedChild) {
					return {
						menu_id: Number(appsmith.store.current_menu_id || 0),
						line_no: index + 1,
						item_type: r.item_type || null,
						ingredient_id: r.item_type === "ingredient" ? Number(r.ingredient_id || 0) || null : null,
						child_recipe_id: r.item_type === "recipe" ? Number(r.child_recipe_id || 0) || null : null,
						child_dish_id: r.item_type === "dish" ? Number(r.child_dish_id || 0) || null : null,
						qty: r.saved_qty === "" || r.saved_qty == null ? null : Number(r.saved_qty),
						unit_id: Number(r.saved_unit_id || 0) || null,
						apply_wastage: r.apply_wastage === false ? false : true,
						active: r.active === false ? false : true
					};
				}

				const item = (getEvtComponentItems.data || []).find(i =>
					i.item_type === r.item_type &&
					i.name === r.component_name
				);

				const unit = (getEvtComponentUnits.data || []).find(u =>
					u.abbreviation === r.unit_abbreviation
				);

				return {
					menu_id: Number(appsmith.store.current_menu_id || 0),
					line_no: index + 1,
					item_type: r.item_type || null,
					ingredient_id: r.item_type === "ingredient" ? Number(r.ingredient_id || item?.id || 0) || null : null,
					child_recipe_id: r.item_type === "recipe" ? Number(r.child_recipe_id || item?.id || 0) || null : null,
					child_dish_id: r.item_type === "dish" ? Number(r.child_dish_id || item?.id || 0) || null : null,
					qty: r.qty === "" || r.qty == null ? null : Number(r.qty),
					unit_id: unit?.id || r.unit_id || item?.default_unit_id || null,
					apply_wastage: r.apply_wastage === false ? false : true,
					active: r.active === false ? false : true
				};
			});
	},

	unitOptions(row) {
		const unitType = row?.unit_type;

		if (!unitType) return [];

		return (getEvtComponentUnits.data || [])
			.filter(u => u.unit_type === unitType)
			.map(u => ({
				label: u.abbreviation,
				value: u.abbreviation
			}));
	},

	lineCost(row) {
		if (
			!row ||
			row.active === false ||
			row.child_active === false ||
			row.child_deleted === true ||
			row.qty === "" ||
			row.qty == null ||
			!row.unit_abbreviation ||
			!row.item_type ||
			!row.component_name
		) return null;

		const componentId = this.itemId(row);

		const item = (getEvtComponentItems.data || []).find(i =>
			i.item_type === row.item_type &&
			Number(i.id) === Number(componentId)
		);

		const unit = (getEvtComponentUnits.data || []).find(u =>
			u.abbreviation === row.unit_abbreviation
		);

		if (!item || !unit || item.cost_per_base_unit == null) return null;

		let cost =
			Number(row.qty) *
			Number(unit.factor_to_base || 0) *
			Number(item.cost_per_base_unit || 0);

		if (row.item_type === "ingredient" && row.apply_wastage === true) {
			cost = cost * (1 + Number(item.wastage_percent || 0) / 100);
		}

		return Math.round(cost * 100) / 100;
	},

	subtotal() {
		const rows = this.mergeUpdatedRows();

		return rows.reduce((sum, row) => {
			const cost = this.lineCost(row);
			return sum + (cost || 0);
		}, 0);
	},

	totalCost() {
		const subtotal = this.subtotal();
		const extra = Number(inpMnuExtraPercent.text || 0);

		return Math.round((subtotal * (1 + extra / 100)) * 100) / 100;
	},

	costPerYieldUnit() {
		const total = this.totalCost();
		const yieldQty = Number(inpMnuYieldQty.text || 0);

		if (!yieldQty) return null;

		return Math.round((total / yieldQty) * 100) / 100;
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

		const items = rows.flatMap(r =>
			this.uniqueTextList(r.allergen_names)
		);

		return [...new Set(items)].sort().join(", ");
	},

	componentDietTagSummary() {
		const rows = this.mergeUpdatedRows();

		const items = rows.flatMap(r =>
			this.uniqueTextList(r.diet_tag_names)
		);

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