import api from "./api";

function unwrap(response) {
  return response.data?.data ?? response.data;
}

export const dailySalesService = {
  async list() {
    return unwrap(await api.get("/daily-sales", { params: { limit: "100" } }));
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
