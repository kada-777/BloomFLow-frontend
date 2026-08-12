import api from "./api";

function unwrap(response) {
  return response.data?.data ?? response.data;
}

export const distributionService = {
  async generatePlan() {
    return unwrap(await api.post("/forecasts", {}));
  },

  async listPlans() {
    return unwrap(await api.get("/distribution-plans", { params: { limit: "100" } }));
  },

  async getPlan(id) {
    return unwrap(await api.get(`/distribution-plans/${id}`));
  },

  async deletePlan(id) {
    return unwrap(await api.delete(`/distribution-plans/${id}`));
  },

  async updatePlanItem(planId, itemId, payload) {
    return unwrap(await api.patch(`/distribution-plans/${planId}/items/${itemId}`, payload));
  },

  async finalizePlan(id) {
    return unwrap(await api.post(`/distribution-plans/${id}/finalize`));
  },

  async createOrders(id) {
    return unwrap(await api.post(`/distribution-plans/${id}/create-orders`));
  },

  async listOrders({ page = 1, limit = 10, sort = "newest", status = "all" } = {}) {
    const response = await api.get("/distributions", { params: { page, limit, sort, status } });
    return response.data;
  },

  async getOrder(id) {
    return unwrap(await api.get(`/distributions/${id}`));
  },

  async receiveOrder(id, payload) {
    return unwrap(await api.post(`/distributions/${id}/receive`, payload));
  },

  async shipOrder(id) {
    return unwrap(await api.post(`/distributions/${id}/ship`));
  },

  async cancelOrder(id) {
    return unwrap(await api.post(`/distributions/${id}/cancel`));
  },

  async shipPlan(id) {
    return unwrap(await api.post(`/distribution-plans/${id}/ship`));
  },
};
