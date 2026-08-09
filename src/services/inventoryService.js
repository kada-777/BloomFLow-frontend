import api from "./api";

function unwrap(response) {
  return response.data?.data ?? response.data;
}

export const inventoryService = {
  async getHeadOfficeInventory() {
    return unwrap(await api.get("/inventory/head-office", { params: { limit: "100" } }));
  },
};
