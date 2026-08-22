export default {
	btnPLAddSaveonClick () {
		return addPicklistItems.run()
			.then(() => qryGetPicklistItems.run())
			.then(() => resetWidget('inpPLAddName'))
			.then(() => closeModal('mdlPLAdd'))
	}
}