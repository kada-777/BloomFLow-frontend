import api from "./api";

function unwrap(response) {
  return response.data?.data ?? response.data;
}

export const inventoryService = {
  async getMyBranchStock() {
    return unwrap(await api.get("/inventory/my-branch", { params: { limit: "100" } }));
  },
  async getMyBranchFlowerDetail(flowerId) {
    return unwrap(await api.get(`/inventory/my-branch/${flowerId}`));
  },
};
