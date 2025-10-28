import axios from "axios";

// const USER_API_URL = `${process.env.REACT_APP_API_URL}`;
// const AUTH_API_URL = USER_API_URL.replace("/api/users", "/api/auth");

const BASE = process.env.REACT_APP_API_URL || "";
// nếu backend có prefix /api, để /api/auth, nếu không, đổi lại thành /auth theo backend của bạn
export const AUTH_API_URL = `${BASE}/auth`;

console.log("DEBUG AUTH_API_URL =", AUTH_API_URL);

const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

// Helper: nếu backend không dùng /api/auth, sửa đường dẫn ở đây
export const forgotPassword = (email) => api.post(`${AUTH_API_URL.replace(BASE, "")}/forgot-password`, { email });

export const resetPassword = (token, password) => api.post(`${AUTH_API_URL.replace(BASE, "")}/reset-password`, { token, password });

//🟢 Đăng ký tài khoản
export const signup = async (userData) => {
  return await axios.post(`${AUTH_API_URL}/signup`, userData);
};

// 🟢 Đăng nhập (lưu token + user)
export const login = async (userData) => {
  const res = await axios.post(`${AUTH_API_URL}/login`, userData);
  const data = res.data;

  // ✅ Nếu backend trả về token và user, lưu lại vào localStorage
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
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
  localStorage.removeItem("user");
};
