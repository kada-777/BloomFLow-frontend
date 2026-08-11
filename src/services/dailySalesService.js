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

export const dailySalesService = {
  async list({ page = 1, limit = 10, sort = "default" } = {}) {
    return unwrapPaginated(await api.get("/daily-sales", { params: { page, limit, sort } }));
  },

  async getById(id) {
    return unwrap(await api.get(`/daily-sales/${id}`));
  },

  async create(payload) {
    return unwrap(await api.post("/daily-sales", payload));
  },

  async listFlowers() {
    return unwrap(await api.get("/flowers", { params: { limit: "100" } }));
  },
};
