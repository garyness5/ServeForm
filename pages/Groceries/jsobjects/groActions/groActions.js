export default {
  async updateAll() {
    await refreshGroDetails.run();
    await refreshGroOrder.run();
    await clearGroPrint.run();

    await getGroEvents.run();

    showAlert("Update complete. Print list cleared.", "success");
    return true;
  }
}