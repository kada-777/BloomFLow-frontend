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

function unwrapPaginated(response) {
  return {
    data: Array.isArray(response.data?.data) ? response.data.data : [],
    pagination: response.data?.pagination || null,
  };
}

export const masterDataService = {
  async list(resource, { page = 1, limit = 10, sort = "default" } = {}) {
    return unwrapPaginated(await api.get(getEndpoint(resource), { params: { page, limit, sort } }));
  },

  async create(resource, payload) {
    return unwrap(await api.post(getEndpoint(resource), payload));
  },

  async update(resource, id, payload) {
    return unwrap(await api.patch(`${getEndpoint(resource)}/${id}`, payload));
  },
};
