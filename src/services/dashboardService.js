import api from "./api";

function unwrap(response) {
  return response.data?.data ?? response.data;
}

export const dashboardService = {
  async getBranches() {
    return unwrap(await api.get("/branches", { params: { limit: "100" } }));
  },
  async getFarms() {
    return unwrap(await api.get("/farms", { params: { limit: "100" } }));
  },
  async getHeadOfficeInventory() {
    return unwrap(await api.get("/inventory/head-office", { params: { limit: "100" } }));
  },
  async getBranchInventory() {
    return unwrap(await api.get("/inventory/branches", { params: { limit: "100" } }));
  },
  async getMyBranchInventory() {
    return unwrap(await api.get("/inventory/my-branch", { params: { limit: "100" } }));
  },
  async getDailySales() {
    return unwrap(await api.get("/daily-sales", { params: { limit: "100" } }));
  },
  async getReceivings() {
    return unwrap(await api.get("/receivings", { params: { limit: "100" } }));
  },
};
