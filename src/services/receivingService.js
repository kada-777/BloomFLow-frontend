import api from "./api";

function unwrap(response) {
  return response.data?.data ?? response.data;
}

export const receivingService = {
  async list() {
    return unwrap(await api.get("/receivings", { params: { limit: "100" } }));
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
