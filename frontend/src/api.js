import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // đổi lại nếu backend m không có /api
});

export default api;
