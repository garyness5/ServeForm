export default {
	emptyHeader() {
		return {
			name: null,
			category_id: null,
			active: true,
			yield_qty: null,
			yield_unit_id: null,
			extra_percent: 0,
			notes: null
		};
	},

	emptySnapshot() {
		return {
			header: this.emptyHeader(),
			diet_tags: [],
			components: []
		};
	},

	clean(value) {
		if (
			value === undefined ||
			value === null ||
			value === ""
		) {
			return null;
		}

		if (
			typeof value === "number"
		) {
			return Number(value);
		}

		if (
			value !== true &&
			value !== false &&
			!isNaN(value)
		) {
			return Number(value);
		}

		return value;
	},

	textClean(value) {
		const text =
					String(value || "").trim();

		return text || null;
	},

	normalizeHeader(header = {}) {
		return {
			name:
			this.textClean(header.name),

			category_id:
			this.clean(header.category_id),

			active:
			header.active === false
			? false
			: true,

			yield_qty:
			this.clean(header.yield_qty),

			yield_unit_id:
			this.clean(header.yield_unit_id),

			extra_percent:
			header.extra_percent == null ||
			header.extra_percent === ""
			? 0
			: Number(header.extra_percent),

			notes:
			this.textClean(header.notes)
		};
	},

	normalizeDietTags(values = []) {
		return (values || [])
			.map(value => {
			if (
				typeof value === "object" &&
				value !== null
			) {
				return Number(
					value.tag_id ??
					value.value ??
					value.helper_list_item_id ??
					0
				);
			}

			return Number(value || 0);
		})
			.filter(Boolean)
			.sort((a, b) => a - b);
	},

	normalizeComponents(rows = []) {
		return (rows || [])
			.filter(row =>
							row &&
							row.item_type &&
							(
			row.ingredient_id ||
			row.child_recipe_id
		)
						 )
			.map((row, index) => ({
			line_no:
			index + 1,

			item_type:
			row.item_type || null,

			ingredient_id:
			row.item_type === "ingredient"
			? this.clean(row.ingredient_id)
			: null,

			child_recipe_id:
			row.item_type === "recipe"
			? this.clean(row.child_recipe_id)
			: null,

			qty:
			this.clean(
				row.saved_qty ??
				row.qty
			),

			unit_id:
			this.clean(
				row.saved_unit_id ??
				row.unit_id
			),

			apply_wastage:
			row.apply_wastage === false
			? false
			: true,

			active:
			row.active === false
			? false
			: true
		}));
	},

	normalizeSnapshot(snapshot = {}) {
		return {
			header:
			this.normalizeHeader(
				snapshot.header || {}
			),

			diet_tags:
			this.normalizeDietTags(
				snapshot.diet_tags || []
			),

			components:
			this.normalizeComponents(
				snapshot.components || []
			)
		};
	},

	baseline() {
		return this.normalizeSnapshot(
			appsmith.store.recipe_baseline ||
			this.emptySnapshot()
		);
	},

	initialHeader() {
		return this.baseline().header;
	},

	initialDietTags() {
		return this.baseline().diet_tags;
	},

	currentHeader() {
		return this.normalizeHeader({
			name:
			inpRecName.text,

			category_id:
			selRecCategory.selectedOptionValue,

			active:
			chkRecActive.isChecked,

			yield_qty:
			inpRecYieldQty.text,

			yield_unit_id:
			selRecYieldUnit.selectedOptionValue,

			extra_percent:
			inpRecExtraPercent.text,

			notes:
			rteRecNotes.text
		});
	},

	currentDietTags() {
		return this.normalizeDietTags(
			msRecDietTags.selectedOptionValues || []
		);
	},

	currentComponents() {
		return this.normalizeComponents(
			jsRecipeCompTable.rowsForSave()
		);
	},

	current() {
		return this.normalizeSnapshot({
			header:
			this.currentHeader(),

			diet_tags:
			this.currentDietTags(),

			components:
			this.currentComponents()
		});
	},

	savedHeaderFromQuery() {
		const row =
					Array.isArray(qryRecGetItemById.data)
		? qryRecGetItemById.data[0]
		: qryRecGetItemById.data;

		if (!row) {
			return this.emptyHeader();
		}

		return this.normalizeHeader({
			name:
			row.name,

			category_id:
			row.category_id,

			active:
			row.active,

			yield_qty:
			row.yield_qty,

			yield_unit_id:
			row.yield_unit_id,

			extra_percent:
			row.extra_percent,

			notes:
			row.notes
		});
	},

	savedDietTagsFromQuery() {
		return this.normalizeDietTags(
			qryRecGetSelectedDietTags.data || []
		);
	},

	savedComponentsFromQuery() {
		return this.normalizeComponents(
			qryRecGetComponents.data || []
		);
	},

	savedTruth() {
		return this.normalizeSnapshot({
			header:
			this.savedHeaderFromQuery(),

			diet_tags:
			this.savedDietTagsFromQuery(),

			components:
			this.savedComponentsFromQuery()
		});
	},

	async setBaseline(snapshot) {
		const value =
					this.normalizeSnapshot(snapshot);

		await storeValue(
			"recipe_baseline",
			value
		);

		return value;
	},

	async initializeFromSaved() {
		return await this.setBaseline(
			this.savedTruth()
		);
	},

	async initializeNew() {
		return await this.setBaseline(
			this.emptySnapshot()
		);
	},

	async initializeDuplicate(snapshot) {
		return await this.setBaseline(
			this.normalizeSnapshot(snapshot)
		);
	},

	isDirty() {
		return (
			JSON.stringify(this.current()) !==
			JSON.stringify(this.baseline())
		);
	},

	async clear() {
		await removeValue(
			"recipe_baseline"
		);

		await removeValue(
			"recipe_initial"
		);

		return true;
	}
};