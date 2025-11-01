import React, { useEffect, useState } from "react";
import LogsTable from "../components/LogsTable";
import { fetchLogs } from "../api/logs";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../api/auth";
import { fetchUsersList } from "../api/users";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [reloadTick, setReloadTick] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      setErrorMsg("");
      try {
        const data = await fetchLogs({ page, limit });
        // Chuẩn hoá dữ liệu trả về: data có thể là {items,total} hoặc {data,total} hoặc mảng thuần
        let items = [];
        let totalCount = 0;
        if (Array.isArray(data)) {
          items = data;
          totalCount = data.length;
        } else if (data?.items) {
          items = data.items;
          totalCount = data.total ?? data.count ?? 0;
        } else if (data?.data) {
          items = data.data;
          totalCount = data.total ?? data.count ?? 0;
        } else {
          items = data?.logs || [];
          totalCount = data?.total ?? data?.count ?? items.length;
        }

        // Bước 1: nếu backend populate userId thành object { _id, email, name }, chuẩn hoá thành field user/email để FE hiển thị ngay
        items = items.map((l) => {
          if (l && l.userId && typeof l.userId === "object") {
            const uo = l.userId;
            const normalizedUser = l.user?.email || l.user?.name ? l.user : {
              id: uo._id || uo.id,
              email: uo.email,
              name: uo.name,
            };
            return {
              ...l,
              user: normalizedUser,
              email: l.email || uo.email,
            };
          }
          // Nếu backend dùng các trường khác như actor/createdBy
          if (l && l.actor && typeof l.actor === "object") {
            const a = l.actor;
            return {
              ...l,
              user: l.user?.email || l.user?.name ? l.user : {
                id: a._id || a.id,
                email: a.email,
                name: a.name,
              },
              email: l.email || a.email,
            };
          }
          if (l && l.createdBy && typeof l.createdBy === "object") {
            const a = l.createdBy;
            return {
              ...l,
              user: l.user?.email || l.user?.name ? l.user : {
                id: a._id || a.id,
                email: a.email,
                name: a.name,
              },
              email: l.email || a.email,
            };
          }
          // Nếu l.user là chuỗi email, gán vào email để hiển thị
          if (l && typeof l.user === "string" && l.user.includes("@")) {
            return { ...l, email: l.email || l.user };
          }
          return l;
        });

        // Bước 2: Nếu còn thiếu thông tin user/email nhưng có userId (chuỗi), tải danh sách users 1 lần để map
        const needUserMap = items.some((l) => {
          const hasUserInfo = !!(l?.user?.email || l?.email || (l?.userId && typeof l.userId === "object" && (l.userId.email || l.userId.name)));
          const hasUserIdString = !!(l?.userId && typeof l.userId === "string") || !!(l?.user?.id && typeof l.user?.id === "string");
          return !hasUserInfo && hasUserIdString;
        });
        if (needUserMap) {
          try {
            const users = await fetchUsersList();
            const map = new Map();
            (users || []).forEach((u) => {
              const id = u._id || u.id;
              if (id) map.set(String(id), { id, email: u.email, name: u.name });
            });
            items = items.map((l) => {
              const uid = (l && typeof l.userId === "object")
                ? (l.userId._id || l.userId.id)
                : (l?.userId || l?.user?.id);
              if (!uid) return l;
              const mapped = map.get(String(uid));
              if (!mapped) return l;
              return {
                ...l,
                user: l.user?.email || l.user?.name ? l.user : mapped,
                email: l.email || mapped.email,
              };
            });
          } catch (_) {
            // Bỏ qua nếu users API không sẵn
          }
        }
        if (mounted) {
          setLogs(items);
          setTotal(totalCount);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setErrorMsg(err?.message || String(err));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [page, limit, reloadTick]);

  return (
    <div className="profile-container">
      <div className="profile-card wide-card" style={{ textAlign: "left" }}>
        <div className="page-header">
          <h2 className="page-title">Admin - Logs</h2>
          <div>
            <button
              className="btn btn-outline-secondary btn-sm me-2"
              onClick={() => setReloadTick((t) => t + 1)}
              disabled={loading}
              title="Tải lại dữ liệu"
            >
              ↻ Tải lại
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/admin")}>
              « Về Admin
            </button>
            <button className="btn btn-secondary btn-sm ms-2" onClick={() => navigate("/home")}>
              Về Home
            </button>
          </div>
        </div>
      {error && (
        <div className="alert alert-warning" role="alert">
          <div><strong>Lỗi tải logs:</strong> {errorMsg}</div>
          {error?.response?.status === 404 && (
            <div className="mt-2">
              Backend chưa có endpoint logs phù hợp. Thêm route GET như 
              <code> /logs </code> hoặc cấu hình biến môi trường <code>REACT_APP_EP_LOGS</code> trỏ đúng endpoint rồi tải lại trang.
            </div>
          )}
          {error?.response?.status === 403 && (
            <div className="mt-2">
              Bạn không có quyền xem nhật ký hoạt động. Hãy đăng nhập bằng tài khoản có role <code>admin</code>.
              <div className="mt-2 small text-muted">
                Tài khoản hiện tại: {getCurrentUser()?.email || "(chưa đăng nhập)"} — role: {getCurrentUser()?.role || "N/A"}
              </div>
              <div className="mt-2 d-flex gap-2">
                <button className="btn btn-danger btn-sm" onClick={() => { logout(); navigate("/login"); }}>
                  Đăng xuất để đăng nhập lại
                </button>
              </div>
            </div>
          )}
        </div>
      )}
        <LogsTable
          logs={logs}
          loading={loading}
          error={errorMsg}
          page={page}
          total={total}
          limit={limit}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
