export default {
	btnPLAddSaveonClick () {
		return addPicklistItems.run()
			.then(() => getPicklistItems.run())
			.then(() => resetWidget('inpPLAddName'))
			.then(() => closeModal('mdlPLAdd'))
	}
}