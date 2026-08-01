export default {
  async initialize() {
    const rows = qryGetProposalsForEvent.data ?? [];

    if (rows.length > 0) {
      const latest = rows[0];

      await storeValue("current_proposal_id", Number(latest.id));
      return latest;
    }

    await removeValue("current_proposal_id");
    return null;
  },

  async selectProposal(row) {
    if (!row?.id) {
      showAlert("Select a Proposal.", "warning");
      return;
    }

    await storeValue("current_proposal_id", Number(row.id));
  },

  async clearSelection() {
    await removeValue("current_proposal_id");
  }
};