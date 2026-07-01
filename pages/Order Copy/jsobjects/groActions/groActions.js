export default {
  async updateAll() {
    await refreshGroDetails.run();
    await refreshGroOrder.run();
  }
}