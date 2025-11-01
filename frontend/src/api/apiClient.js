import axios from "axios";
import {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  clearAllAuth,
} from "../utils/storage";

const BASE = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE || undefined,
  // Không đặt Content-Type mặc định ở đây để FormData tự set boundary khi upload file
  withCredentials: false,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    // Bỏ qua trang cảnh báo của ngrok (ERR_NGROK_6024)
    if (config && config.headers) {
      config.headers["ngrok-skip-browser-warning"] = "true";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 -> try refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    // only handle if 401 and we haven't already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // queue the request
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAllAuth();
        return Promise.reject(error);
      }

      try {
        // call refresh endpoint
  const resp = await axios.post(`${BASE}/auth/refresh`, { refreshToken }, { headers: { "Content-Type": "application/json" } });
  const newAccessToken = resp.data?.accessToken || resp.data?.token;
  const newRefreshToken = resp.data?.refreshToken || resp.data?.refresh_token;

        if (newAccessToken) setToken(newAccessToken);
        if (newRefreshToken) setRefreshToken(newRefreshToken);

        processQueue(null, newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (errRefresh) {
        processQueue(errRefresh, null);
        clearAllAuth();
        return Promise.reject(errRefresh);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
