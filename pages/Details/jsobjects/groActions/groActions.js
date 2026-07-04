export default {
  async updateAll() {
    await refreshGroDetails.run();
    await refreshGroOrder.run();
    await clearGroPrint.run();

    await getGroDetails.run();

    await resetWidget("tblGroDetails", true);
    await tblGroDetails.setData(getGroDetails.data);

    showAlert("Update complete. Print list cleared.", "success");
    return true;
  }
}