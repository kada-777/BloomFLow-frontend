import api from "./api";

const endpoints = {
  branches: "/branches",
  farms: "/farms",
  flowers: "/flowers",
};

function getEndpoint(resource) {
  if (!endpoints[resource]) throw new Error(`Unsupported master data resource: ${resource}`);
  return endpoints[resource];
}

function unwrap(response) {
  return response.data?.data ?? response.data;
}

export const masterDataService = {
  async list(resource) {
    return unwrap(await api.get(getEndpoint(resource), { params: { limit: "100" } }));
  },

  async create(resource, payload) {
    return unwrap(await api.post(getEndpoint(resource), payload));
  },

  async update(resource, id, payload) {
    return unwrap(await api.patch(`${getEndpoint(resource)}/${id}`, payload));
  },
};
