import axios from "axios";
import { AxiosError } from "axios";

import { clearAuth } from "../utils/authToken";

// The API's address. On Render it comes from the API service as a bare host
// ("medibridge-api.onrender.com"), so add https:// when no scheme is given.
const rawBaseUrl = (import.meta.env.VITE_BASE_URL ?? "").trim();
export const API_BASE_URL = rawBaseUrl && !/^https?:\/\//i.test(rawBaseUrl) ? `https://${rawBaseUrl}` : rawBaseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const PublicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? "";
    // 401 means the session is missing or expired, so sign out. 403 means
    // "signed in, but not allowed" and is left to the page to show. Auth
    // routes (a wrong password at login) answer 401 too, so skip those.
    if (status === 401 && !url.startsWith("/api/auth/")) {
      clearAuth();
      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
export { PublicApi };

export function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError === true;
}

