// Token
export const setToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const clearToken = () => localStorage.removeItem("token");

// User
export const setUser = (user) => localStorage.setItem("user", JSON.stringify(user));
export const getUser = () => {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
};
export const clearUser = () => localStorage.removeItem("user");
