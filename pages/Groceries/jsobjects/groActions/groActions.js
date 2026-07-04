export default {
  async updateAll() {
    await syncEligibleGroEvents.run();
    await refreshGroDetails.run();
    await refreshGroOrder.run();
    await clearGroPrint.run();

    await getGroEvents.run();
    await resetWidget("tblGroEvents", true);
    await tblGroEvents.setData(getGroEvents.data);

    showAlert("Update complete. Print list cleared.", "success");
    return true;
  }
}