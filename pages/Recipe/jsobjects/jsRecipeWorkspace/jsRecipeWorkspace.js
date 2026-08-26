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

	emptyWorkspace() {
		return {
			id: 0,
			header: this.emptyHeader(),
			diet_tags: [],
			components: []
		};
	},

	current() {
		const workspace =
					appsmith.store.recipe_workspace;

		if (
			workspace &&
			typeof workspace === "object"
		) {
			return workspace;
		}

		return this.emptyWorkspace();
	},

	async set(workspace) {
		const value = {
			...this.emptyWorkspace(),
			...(workspace || {}),

			header: {
				...this.emptyHeader(),
				...(workspace?.header || {})
			},

			diet_tags:
			Array.isArray(workspace?.diet_tags)
			? workspace.diet_tags
			: [],

			components:
			Array.isArray(workspace?.components)
			? workspace.components
			: []
		};

		await storeValue(
			"recipe_workspace",
			value
		);

		return value;
	},

	async clear() {
		await removeValue(
			"recipe_workspace"
		);

		return true;
	},

	headerFromSaved() {
		const row =
					Array.isArray(qryRecGetItemById.data)
		? qryRecGetItemById.data[0]
		: qryRecGetItemById.data;

		if (!row) {
			return this.emptyHeader();
		}

		return {
			name:
			String(row.name || "").trim() ||
			null,

			category_id:
			row.category_id == null
			? null
			: Number(row.category_id),

			active:
			row.active === false
			? false
			: true,

			yield_qty:
			row.yield_qty == null ||
			row.yield_qty === ""
			? null
			: Number(row.yield_qty),

			yield_unit_id:
			row.yield_unit_id == null
			? null
			: Number(row.yield_unit_id),

			extra_percent:
			row.extra_percent == null ||
			row.extra_percent === ""
			? 0
			: Number(row.extra_percent),

			notes:
			row.notes || null
		};
	},

	dietTagsFromSaved() {
		return (
			qryRecGetSelectedDietTags.data || []
		)
			.map(row =>
					 Number(row.value || 0)
					)
			.filter(Boolean);
	},

	componentsFromSaved() {
		return (
			qryRecGetComponents.data || []
		)
			.map((row, index) => ({
			...row,

			draft_row_id:
			row.draft_row_id ||
			jsRecipeCompTable.makeDraftId(),

			line_no:
			index + 1
		}));
	},

	async initializeFromSaved() {
		const id =
					Number(
						appsmith.store.current_recipe_id || 0
					);

		return await this.set({
			id,

			header:
			this.headerFromSaved(),

			diet_tags:
			this.dietTagsFromSaved(),

			components:
			this.componentsFromSaved()
		});
	},

	async initializeNew() {
		return await this.set(
			this.emptyWorkspace()
		);
	},
};