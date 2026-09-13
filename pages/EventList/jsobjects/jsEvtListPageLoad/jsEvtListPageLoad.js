export default {
	async initClient() {
		const ready = await jsAppInit.init();

		if (!ready) {
			return false;
		}

		await qryEvtGetList.run();

		return true;
	}
};