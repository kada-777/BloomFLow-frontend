import api from "./api";

function unwrap(response) {
  return response.data?.data ?? response.data;
}

function unwrapPaginated(response) {
  return {
    data: Array.isArray(response.data?.data) ? response.data.data : [],
    pagination: response.data?.pagination || null,
  };
}

export const inventoryService = {
  async getMyBranchStock({ page = 1, limit = 10, sort = "default" } = {}) {
    return unwrapPaginated(await api.get("/inventory/my-branch", { params: { page, limit, sort } }));
  },
  async getMyBranchFlowerDetail(flowerId) {
    return unwrap(await api.get(`/inventory/my-branch/${flowerId}`));
  },
};
