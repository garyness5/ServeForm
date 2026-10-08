export default {

	async select(row) {
		const workspaceKey = row?.workspace_key || null;

		if (row?.is_temporary && workspaceKey) {
			const ws = jsQuoWorkspace.getAll()[workspaceKey];
			if (!ws) return false;

			await jsQuoWorkspace.select(workspaceKey);
			await removeValue("quotationQuoteId");

			await storeValue(
				"quotationMenuRows",
				jsQuoWorkspace.clone(ws.current.menus || [])
			);

			return true;
		}

		const quoteId = Number(row?.quote_id || 0);

		if (!quoteId) {
			await removeValue("quotationQuoteId");
			await removeValue("quotationActiveWorkspaceKey");
			await jsQuoMenus.loadProposal();
			return false;
		}

		const key = `quote:${quoteId}`;
		const existing = jsQuoWorkspace.getAll()[key];

		await storeValue("quotationQuoteId", quoteId);

		if (existing) {
			await jsQuoWorkspace.select(key);

			await storeValue(
				"quotationMenuRows",
				jsQuoWorkspace.clone(existing.current.menus || [])
			);

			return true;
		}

		await Promise.all([
			qryQuoGetQuoteHeader.run(),
			qryQuoGetQuoteMenus.run()
		]);

		const menus = await jsQuoMenus.loadQuote();

		const headerData = qryQuoGetQuoteHeader.data;
		const header = Array.isArray(headerData)
		? (headerData[0] || {})
		: (headerData || {});

		const newKey = await jsQuoWorkspace.putSaved(quoteId, {
			header: jsQuoWorkspace.clone(header),
			menus
		});

		await jsQuoWorkspace.select(newKey);
		return true;
	},


	async save() {
		const workspace = jsQuoWorkspace.getActive();

		if (!workspace) {
			showAlert("Select a Quote before saving.", "warning");
			return false;
		}

		const workspaceKey = workspace.key;
		const data = jsQuoWorkspace.clone(workspace.current);
		const inboxId = Number(data.header?.inbox_id || 0);

		let quoteId = Number(workspace.quoteId || 0);
		let stage = "initialization";

		try {
			if (!quoteId) {
				if (!inboxId) {
					throw new Error("The Quote has no source Proposal.");
				}

				stage = "create Quote";

				const createdResult =
							await qryQuoCreateQuoteFromWorkspace.run({ inboxId });

				const created = Array.isArray(createdResult)
				? createdResult[0]
				: createdResult;

				quoteId = Number(created?.quote_id || 0);

				if (!quoteId) {
					throw new Error("Quote creation returned no Quote ID.");
				}

				// Persist the new database ID immediately.
				// Do not create a second Quote if a later step fails.
				const all = jsQuoWorkspace.clone(
					jsQuoWorkspace.getAll()
				);

				all[workspaceKey].quoteId = quoteId;
				all[workspaceKey].current.header.quote_id = quoteId;

				await storeValue("quotationWorkspaces", all);
			}

			stage = "load database Menus";

			const dbMenusResult =
						await qryQuoGetWorkspaceMenus.run({ quoteId });

			const dbMenus = Array.isArray(dbMenusResult)
			? dbMenusResult
			: [];

			const savedMenuByReceivedId = new Map(
				dbMenus.map(r => [
					Number(r.received_menu_id),
					Number(r.quote_menu_id)
				])
			);

			stage = "prepare pricing";

			const pricingRows = (data.menus || []).map(r => {
				const receivedId = Number(r.received_menu_id);
				const newMenuId =
							savedMenuByReceivedId.get(receivedId);

				if (!newMenuId) {
					throw new Error(
						`Could not match Menu ${r.menu_name || receivedId}.`
					);
				}

				return {
					quote_menu_id: newMenuId,
					price_per_guest_markup_percent:
					r.price_per_guest_markup_percent ?? null,
					selling_price_per_guest:
					r.selling_price_per_guest ?? null,
					total_markup_percent:
					r.total_markup_percent ?? null,
					selling_total:
					r.selling_total ?? null
				};
			});

			stage = "save pricing";

			const pricingResult =
						await qryQuoSaveWorkspacePricing.run({
							quoteId,
							rows: pricingRows
						});

			if (qryQuoSaveWorkspacePricing.isLoading) {
				throw new Error("Pricing query did not finish.");
			}

			if (!pricingResult) {
				throw new Error("Pricing query returned no result.");
			}

			stage = "reload saved Quote";

			await storeValue("quotationQuoteId", quoteId);

			await Promise.all([
				qryQuoGetQuoteHeader.run(),
				qryQuoGetQuoteMenus.run(),
				qryQuoGetQuotes.run(),
				qryQuoGetEventProposals.run()
			]);

			const menus = await jsQuoMenus.loadQuote();

			const headerData = qryQuoGetQuoteHeader.data;
			const header = Array.isArray(headerData)
			? (headerData[0] || {})
			: (headerData || {});

			stage = "finalize workspace";

			await jsQuoWorkspace.markSaved(quoteId, {
				header: jsQuoWorkspace.clone(header),
				menus
			});

			showAlert("Quote saved.", "success");
			return true;

		} catch (error) {
			console.error("Quote Save failed:", {
				stage,
				quoteId,
				workspaceKey,
				message: error?.message
			});

			showAlert(
				`Quote Save failed at ${stage}: ${
				error?.message || "Unknown error"
				}`,
				"error"
			);

			return false;
		}
	},

	async newQuote() {
		const inboxId = Number(appsmith.store.quotationInboxId || 0);
		const eventId = Number(appsmith.store.quotationEventId || 0);

		if (!inboxId) {
			showAlert("Select a Proposal first.", "warning");
			return false;
		}

		try {
			await qryQuoGetReceivedMenus.run();

			const menus = await jsQuoMenus.loadProposal();

			const key = await jsQuoWorkspace.addTemporary({
				header: {
					quote_id: null,
					event_id: eventId,
					inbox_id: inboxId,
					quote_number: null,
					quote_title: null,
					quote_status: "Draft",
					quote_date: null,
					valid_until: null,
					quote_notes: null,
					internal_notes: null,
					terms: null,
					closed: false
				},
				menus
			});

			await removeValue("quotationQuoteId");

			await storeValue(
				"quotationMenuRows",
				jsQuoWorkspace.clone(menus)
			);

			showAlert("New Quote ready. Save to create it.", "success");
			return key;

		} catch (error) {
			showAlert(
				error?.message || "Could not prepare new Quote.",
				"error"
			);
			return false;
		}
	},
};
