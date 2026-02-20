import axios from "axios";

// Base URL from Vite environment (Docker / local)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// Create a reusable Axios instance
export const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // optional, safety net for long requests
});

// --- Optional Auth Token ---
// When you add Google/JWT later, store it in localStorage or Redux
// and automatically attach here:
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token"); // adjust if using Redux state
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Global error handling ---
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with a status code outside 2xx
      const { status, data } = error.response;
      const message =
        data?.message ||
        data?.error ||
        `HTTP ${status} ${error.response.statusText}`;
      const err = new Error(message);
      err.status = status;
      err.payload = data;
      throw err;
    } else if (error.request) {
      // No response received
      throw new Error("No response from server");
    } else {
      // Something else (setup, etc.)
      throw error;
    }
  }
);

// --- Convenience shortcuts ---
export async function get(path, config = {}) {
  const res = await http.get(path, config);
  return res.data;
}

export async function post(path, body = {}, config = {}) {
  const res = await http.post(path, body, config);
  return res.data;
}

export async function del(path, config = {}) {
  const res = await http.delete(path, config);
  return res.data;
}
