import axios from "axios";

export const TOKEN_STORAGE_KEY = "bloom-token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

export function getApiError(error, fallback = "Something went wrong. Please try again.") {
  return error.response?.data?.message || error.message || fallback;
}

export default api;
