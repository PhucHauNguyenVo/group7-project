import axios from "axios";

// Read raw base from env. We will compute an "effective" base so that during
// development we can let CRA proxy (relative paths) instead of accidentally
// pointing requests at the dev server itself (which returns 404).
const RAW_BASE = process.env.REACT_APP_API_URL || "";
let EFFECTIVE_BASE = RAW_BASE;
try {
  const origin = window?.location?.origin;
  // If the configured base points to the same origin as the dev server,
  // prefer using a relative base (empty) so CRA's proxy works.
  if (RAW_BASE && origin && RAW_BASE.startsWith(origin)) {
    EFFECTIVE_BASE = "";
  }
} catch (e) {
  /* ignore */
}

const AUTH_PATH = "/auth"; // path on the API for auth routes

console.log("DEBUG AUTH RAW_BASE=", RAW_BASE, "EFFECTIVE_BASE=", EFFECTIVE_BASE, "AUTH_PATH=", AUTH_PATH);

const api = axios.create({
  baseURL: EFFECTIVE_BASE || undefined,
  headers: { "Content-Type": "application/json" },
});

// Helper endpoints use AUTH_PATH (relative) so they work with proxy or absolute base
export const forgotPassword = (email) => api.post(`${AUTH_PATH}/forgot-password`, { email });

export const resetPassword = (token, password) => api.post(`${AUTH_PATH}/reset-password`, { token, password });

//🟢 Đăng ký tài khoản
// helper: try primary path, then sensible absolute fallbacks to handle
// backends that expose auth under '/api/auth' or a full base URL.
const authPost = async (path, data) => {
  // 1) try relative /auth first (works with CRA proxy or relative backend)
  try {
    // log first attempt URL (effective base may be empty => relative path)
    try {
      const firstUrl = `${EFFECTIVE_BASE || ''}${AUTH_PATH}${path}`;
      console.warn(`[auth] attempt -> ${firstUrl}`);
    } catch (_) {}
    return await api.post(`${AUTH_PATH}${path}`, data);
  } catch (err) {
    const status = err?.response?.status;
    // only attempt fallbacks on 404 (not found)
    if (status !== 404) throw err;

    // build candidate absolute URLs using RAW_BASE to avoid double '/api/api'
    const candidates = [];
    if (RAW_BASE) {
      // RAW_BASE might already include '/api' or not. Try both reasonable options.
      // e.g. RAW_BASE = 'http://localhost:3001' -> try 'http://localhost:3001/auth' (unlikely)
      // and 'http://localhost:3001/api/auth'. If RAW_BASE already contains '/api', the
      // first candidate will already include it.
      const normalized = RAW_BASE.replace(/\/+$/g, "");
      candidates.push(`${normalized}${AUTH_PATH}${path}`);
      if (!normalized.includes("/api")) {
        candidates.push(`${normalized}/api${AUTH_PATH}${path}`);
      }
    } else {
      // no RAW_BASE -> try relative /api/auth
      candidates.push(`/api${AUTH_PATH}${path}`);
    }

    // attempt candidates sequentially with axios (full URLs)
    for (const url of candidates) {
      try {
        console.warn(`[auth] fallback attempt -> ${url}`);
        return await axios.post(url, data);
      } catch (err2) {
        // if last candidate, throw the last error
        const isLast = url === candidates[candidates.length - 1];
        if (isLast) throw err2;
        // otherwise continue to next
      }
    }
  }
};

export const signup = async (userData) => {
  return await authPost(`/signup`, userData);
};

// 🟢 Đăng nhập (lưu token + user)
export const login = async (userData) => {
  const res = await authPost(`/login`, userData);
  const data = res.data;

  // ✅ Nếu backend trả về token và user, lưu lại vào localStorage
  const accessToken = data.token || data.accessToken || data.access_token;
  if (accessToken) {
    localStorage.setItem("token", accessToken);
  }
  // nếu backend trả về refreshToken, lưu luôn
  const refresh = data.refreshToken || data.refresh_token;
  if (refresh) {
    localStorage.setItem("refreshToken", refresh);
  }
  const user = data.user || data.profile || data.data?.user;
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return data;
};

// 🟡 Lấy thông tin user hiện tại (từ localStorage)
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// 🔴 Đăng xuất
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};
