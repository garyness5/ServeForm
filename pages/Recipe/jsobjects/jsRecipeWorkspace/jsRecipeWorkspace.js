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

	normalize(workspace) {
		const source = workspace || {};

		return {
			id:
			Number(source.id || 0),

			header: {
				...this.emptyHeader(),
				...(source.header || {})
			},

			diet_tags:
			Array.isArray(source.diet_tags)
			? [...source.diet_tags]
			: [],

			components:
			Array.isArray(source.components)
			? source.components.map(row => ({ ...row }))
			: []
		};
	},

	current() {
		return this.normalize(
			appsmith.store.recipe_workspace
		);
	},

	saved() {
		return this.normalize(
			appsmith.store.recipe_workspace_saved
		);
	},

	async setCurrent(workspace) {
		const value =
					this.normalize(workspace);

		await storeValue(
			"recipe_workspace",
			value
		);

		return value;
	},

	async setSaved(workspace) {
		const value =
					this.normalize(workspace);

		await storeValue(
			"recipe_workspace_saved",
			value
		);

		return value;
	},

	async setBoth(workspace) {
		const value =
					this.normalize(workspace);

		await storeValue(
			"recipe_workspace_saved",
			value
		);

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

		await removeValue(
			"recipe_workspace_saved"
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
			.filter(Boolean)
			.sort((a, b) => a - b);
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

	savedTruth() {
		return this.normalize({
			id:
			Number(
				appsmith.store.current_recipe_id || 0
			),

			header:
			this.headerFromSaved(),

			diet_tags:
			this.dietTagsFromSaved(),

			components:
			this.componentsFromSaved()
		});
	},

	async initializeFromSaved() {
		return await this.setBoth(
			this.savedTruth()
		);
	},

	async initializeNew() {
		const value =
					this.emptyWorkspace();

		return await this.setBoth(
			value
		);
	},

	async patchHeader(patch) {
		const workspace =
					this.current();

		return await this.setCurrent({
			...workspace,

			header: {
				...workspace.header,
				...(patch || {})
			}
		});
	},

	async setDietTags(values) {
		const tags =
					(values || [])
		.map(Number)
		.filter(Boolean)
		.sort((a, b) => a - b);

		return await this.setCurrent({
			...this.current(),
			diet_tags: tags
		});
	},

	async setComponents(rows) {
		return await this.setCurrent({
			...this.current(),

			components:
			Array.isArray(rows)
			? rows.map(row => ({ ...row }))
			: []
		});
	},

	isDirty() {
		return (
			JSON.stringify(this.current()) !==
			JSON.stringify(this.saved())
		);
	}
};