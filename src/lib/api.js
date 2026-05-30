import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

axios.defaults.baseURL = BACKEND_URL;
axios.defaults.withCredentials = true;
axios.defaults.timeout = 20000;
axios.defaults.headers.common.Accept = "application/json";

axios.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("bree_admin_token") ||
      localStorage.getItem("bree_access_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  config.withCredentials = true;
  return config;
});

const getRequestPath = (url) => {
  if (!url) return "";
  try {
    if (url.startsWith("http")) {
      return new URL(url).pathname;
    }
  } catch {
    // ignore invalid URL
  }
  return url;
};

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message =
        "Unable to reach the backend. Check your network or backend server.";
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      const requestPath = getRequestPath(error.config?.url);
      const logoutPaths = [
        "/api/auth/",
        "/api/profile",
        "/api/addresses",
        "/api/orders",
      ];
      if (logoutPaths.some((path) => requestPath.startsWith(path))) {
        window.dispatchEvent(new Event("auth:expired"));
      }
    }

    const backendMessage = error.response.data?.message;
    if (backendMessage) {
      error.message = backendMessage;
    }

    return Promise.reject(error);
  },
);

export const getApiErrorMessage = (error) => {
  if (!error) return "Something went wrong. Please try again.";
  if (typeof error === "string") return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return "An unexpected error occurred. Please refresh and try again.";
};
export const fetchOrderSuccess = async (orderId) => {
  if (!orderId) {
    throw new Error("Order ID is required");
  }
  return axios.get(`/api/orders/${orderId}/success`);
};
export default axios;
