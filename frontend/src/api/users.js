import apiClient from "./apiClient";
import EP from "./endpoints";

// Lấy danh sách users (admin-only) với một số fallback route phổ biến
export async function fetchUsersList() {
  const candidates = [
    EP.usersList,
    "/api/users",
    "/admin/users",
  ];
  let lastErr;
  for (const url of candidates) {
    try {
      const res = await apiClient.get(url);
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.users)) return data.users;
      if (Array.isArray(data?.items)) return data.items;
      if (Array.isArray(data?.data)) return data.data;
      // Nếu trả về object có dạng { users: {...pagination...} } thì cố lấy list
      if (data?.users?.items && Array.isArray(data.users.items)) return data.users.items;
      return data;
    } catch (err) {
      lastErr = err;
      const status = err?.response?.status;
      if (status === 404 || status === 405) continue;
      throw err;
    }
  }
  throw lastErr || new Error("No users endpoint available");
}

export default { fetchUsersList };
