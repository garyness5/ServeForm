export default {
  async loadComponents() {
    await removeValue("rec_components_local_rows");
    await getRecComponents.run();
    await recCompTable.loadFromQuery();
  }
}