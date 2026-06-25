export default {
  initClient() {
    return storeValue('current_client_id', '1315144c-801a-4371-aae4-52f2a78873d1')
      .then(() => getEvents.run());
  }
}