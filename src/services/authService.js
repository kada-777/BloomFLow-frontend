import api, { getApiError } from "./api";

function unwrap(response) {
  return response.data?.data ?? response.data;
}

function extractToken(payload) {
  return payload?.token || payload?.accessToken || payload?.jwt || null;
}

export const authService = {
  async login(credentials) {
    try {
      const payload = unwrap(await api.post("/auth/login", credentials));
      const token = extractToken(payload);

      if (!token) throw new Error("Login response did not include an access token.");

      return { token, user: payload?.user || payload?.profile || null };
    } catch (error) {
      throw new Error(getApiError(error, "Unable to sign in. Check your credentials."));
    }
  },

  async getCurrentUser() {
    try {
      const payload = unwrap(await api.get("/auth/me"));
      return payload?.user || payload?.profile || payload;
    } catch (error) {
      throw new Error(getApiError(error, "Your session has expired. Please sign in again."));
    }
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      throw new Error(getApiError(error, "Unable to end this session."));
    }
  },
};
