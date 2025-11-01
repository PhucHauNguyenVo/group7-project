import apiClient from "./apiClient";
import EP from "./endpoints";

// Lấy danh sách logs với fallback endpoint linh hoạt
export async function fetchLogs({ page = 1, limit = 20 } = {}) {
  const qs = `?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`;
  const candidates = [
    `${EP.logs}${qs}`,
    `${EP.adminLogs}${qs}`,
    `${EP.logsRecent}${qs}`,
    // Một số biến thể phổ biến khác mà backend có thể dùng
    `/activity/logs${qs}`,
    `/audit/logs${qs}`,
    `/admin/activity-logs${qs}`,
    `/admin/audit-logs${qs}`,
  ];

  let lastErr;
  for (const url of candidates) {
    try {
      const res = await apiClient.get(url);
      return res.data;
    } catch (err) {
      lastErr = err;
      const status = err?.response?.status;
      if (status === 404 || status === 405) continue;
      throw err;
    }
  }
  throw lastErr || new Error("No logs endpoint available");
}

const logsApi = { fetchLogs };
export default logsApi;
