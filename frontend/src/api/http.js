import axios from "axios";

const ENV_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();
const FALLBACK_BASE_URL = `http://${window.location.hostname}:4000`;
const BASE_URL = ENV_BASE_URL || FALLBACK_BASE_URL;

export const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
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
      throw new Error("No response from server");
    } else {
      throw error;
    }
  }
);

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
