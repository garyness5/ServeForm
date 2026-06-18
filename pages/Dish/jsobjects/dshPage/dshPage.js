export default {
  async loadComponents() {
    await removeValue("rec_components_local_rows");
    await getDshComponents.run();
    await dshCompTable.loadFromQuery();
  }
}