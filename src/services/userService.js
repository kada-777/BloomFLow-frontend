import api from "./api";

function unwrap(response) {
  return response.data?.data ?? response.data;
}

export const userService = {
  async list() {
    return unwrap(await api.get("/users", { params: { limit: "100" } }));
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
