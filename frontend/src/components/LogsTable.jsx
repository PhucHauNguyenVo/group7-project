import React from "react";

// LogsTable hiển thị danh sách logs đơn giản, có phân trang cơ bản
// props:
// - logs: Array<{_id?, id?, user?, email?, action?, ip?, createdAt?, timestamp?, details?}>
// - loading: boolean
// - error: string | null
// - page: number
// - total: number (tổng số bản ghi, nếu backend trả về)
// - limit: number
// - onPageChange: (page) => void
export default function LogsTable({
  logs = [],
  loading = false,
  error = null,
  page = 1,
  total = 0,
  limit = 20,
  onPageChange = () => {},
}) {
  const totalPages = total && limit ? Math.max(1, Math.ceil(total / limit)) : null;

  return (
    <div className="userlist-container wide-card" style={{ overflowX: "auto", textAlign: "left" }}>
      <h2 style={{ textAlign: "center", color: "#1e3a8a", marginTop: 0, marginBottom: 12 }}>Nhật ký hoạt động</h2>
      {error && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: 12 }}>
          {String(error)}
        </div>
      )}
      <table className="userlist-table">
        <thead>
          <tr>
            <th style={{ width: 220 }}>Thời gian</th>
            <th style={{ width: 240 }}>Người dùng</th>
            <th>Hành động</th>
            <th style={{ width: 140 }}>IP</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="loading">Đang tải...</td>
            </tr>
          ) : logs && logs.length ? (
            logs.map((l) => {
              const id = l._id || l.id || `${l.timestamp || l.createdAt}-${l.action}`;
              const time = l.createdAt || l.timestamp || l.time || "";
              const user =
                l.user?.email ||
                l.user?.name ||
                // nếu backend trả l.user là chuỗi email/username
                (typeof l.user === "string" ? l.user : null) ||
                // nếu backend populate userId thành object
                l.userId?.email ||
                l.userId?.name ||
                // các biến thể actor/createdBy
                l.actor?.email ||
                l.actor?.name ||
                l.createdBy?.email ||
                l.createdBy?.name ||
                // các tên trường phổ biến khác
                l.username ||
                l.userEmail ||
                l.email ||
                (typeof l.userId === "string" ? l.userId : null) ||
                "Ẩn danh";
              const action = l.action || l.type || l.event || "";
              const ip = l.ip || l.ipAddress || "";
              let details = l.details || l.meta || l.data || null;

              if (details && typeof details === "object") {
                try { details = JSON.stringify(details); } catch (_) { details = String(details); }
              }

              return (
                <tr key={id}>
                  <td style={{ whiteSpace: "nowrap" }}>{time ? new Date(time).toLocaleString() : ""}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{user}</td>
                  <td style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}>{action}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{ip}</td>
                  <td style={{ maxWidth: 480, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={details || ""}>
                    {details || ""}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="no-data">Không có dữ liệu</td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages && totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            « Trước
          </button>
          <div>
            Trang {page} / {totalPages}
          </div>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Sau »
          </button>
        </div>
      )}
    </div>
  );
}
