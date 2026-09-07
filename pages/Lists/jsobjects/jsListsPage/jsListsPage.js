export default {
	async load() {
		const ok = await jsAppInit.init();

		if (!ok) {
			return false;
		}

		await qryImpSuppliers.run();

		return true;
	}
};