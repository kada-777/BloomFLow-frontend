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

export const receivingService = {
  async list({ page = 1, limit = 10, receivedDate = "" } = {}) {
    return unwrapPaginated(await api.get("/receivings", {
      params: { page, limit, ...(receivedDate ? { receivedDate } : {}) },
    }));
  },

  async getById(id) {
    return unwrap(await api.get(`/receivings/${id}`));
  },

  async create(payload) {
    return unwrap(await api.post("/receivings", payload));
  },

  async listFarms() {
    return unwrap(await api.get("/farms", { params: { limit: "100" } }));
  },

  async listFlowers() {
    return unwrap(await api.get("/flowers", { params: { limit: "100" } }));
  },
};
