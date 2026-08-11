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

export const userService = {
  async list({ page = 1, limit = 10 } = {}) {
    return unwrapPaginated(await api.get("/users", { params: { page, limit } }));
  },

  async create(payload) {
    return unwrap(await api.post("/users", payload));
  },

  async update(id, payload) {
    return unwrap(await api.patch(`/users/${id}`, payload));
  },

  async listBranches() {
    return unwrap(await api.get("/branches", { params: { limit: "100" } }));
  },
};
