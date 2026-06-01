import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

axios.defaults.baseURL = BACKEND_URL;
axios.defaults.withCredentials = true;
axios.defaults.timeout = 20000;
axios.defaults.headers.common.Accept = "application/json";

axios.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const requestPath = getRequestPath(config.url);

    // Only send token for admin routes — user routes use cookies only
    if (requestPath.startsWith("/api/admin")) {
      const adminToken = localStorage.getItem("bree_admin_token");
      if (adminToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
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

let isRefreshing = false;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      error.message =
        "Unable to reach the backend. Check your network or backend server.";
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      const requestPath = getRequestPath(error.config?.url);

      // Don't fire auth:expired for the verify endpoint itself
      const isVerifyCall = requestPath === "/api/auth/verify";

      // Don't retry if this request is already a retry
      const isRetry = error.config?._retry;

      const logoutPaths = ["/api/profile", "/api/addresses", "/api/orders"];

      if (
        !isVerifyCall &&
        !isRetry &&
        logoutPaths.some((path) => requestPath.startsWith(path))
      ) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            // Try to refresh session via verify endpoint
            await axios.get("/api/auth/verify");
            isRefreshing = false;
            // Mark as retry and resend original request
            error.config._retry = true;
            return axios(error.config);
          } catch {
            isRefreshing = false;
            // Session truly expired — log out
            window.dispatchEvent(new Event("auth:expired"));
          }
        }
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
