import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import apiClient from "../api/apiClient";
import EP from "../api/endpoints";
import { getToken } from "../utils/storage";
import "../form.css";

const UserList = forwardRef(({ showToast }, ref) => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({ name: "", role: "", email: "" });
  const [currentUserRole, setCurrentUserRole] = useState("user");
  const [loading, setLoading] = useState(true);

  // Lấy danh sách user
  const fetchUsers = async () => {
    const meLocal = JSON.parse(localStorage.getItem("user") || "null");
    const isModLocal = (meLocal?.role || "").toLowerCase() === "moderator";
    const candidates = [
      EP.usersList,
      "/users",
      "/user",
      "/admin/users",
      "/users/all",
      "/users/list",
      "/users/basic",
    ];
    try {
      let res;
      let lastErr;
      for (const url of candidates) {
        try {
          // Đảm bảo header Authorization luôn có mặt
          const token = getToken();
          res = await apiClient.get(
            url,
            token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
          );
          break;
        } catch (e) {
          lastErr = e;
          const status = e?.response?.status;
          // Nếu endpoint không tồn tại hoặc bị cấm (403), thử endpoint kế tiếp
          if (status === 404 || status === 405 || status === 403) continue;
          throw e;
        }
      }
      // Nếu moderator không gọi được danh sách, fallback lấy chính profile của họ
      if (!res && isModLocal) {
        try {
          const token = getToken();
          res = await apiClient.get(
            EP.profile || "/users/profile",
            token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
          );
        } catch (e2) {
          lastErr = e2;
        }
      }
      if (!res) throw lastErr || new Error("No users endpoint");

      const payload = res.data;
      const data = Array.isArray(payload)
        ? payload
        : payload?.users || payload?.data || (payload?._id || payload?.id ? [payload] : []);
      const me = payload?.me || payload?.currentUser || JSON.parse(localStorage.getItem("user"));
      setUsers(data);
      setCurrentUserRole((me?.role || "user").toLowerCase());
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "";
      console.error("Lỗi fetchUsers:", status, msg, err.response || err);
      showToast?.(`Lỗi lấy dữ liệu user${status ? ` (${status})` : ""}${msg ? ": " + msg : ""}`, "error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ fetchUsers }));

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // RBAC flags
  const isAdmin = (currentUserRole || "").toLowerCase() === "admin";
  const isModerator = (currentUserRole || "").toLowerCase() === "moderator";
  const canEditBasic = isAdmin || isModerator; // sửa name/email
  const canChangeRole = isAdmin; // chỉ admin đổi role
  const canDelete = isAdmin; // chỉ admin xoá

  // Xóa user (chỉ admin)
  const handleDelete = async (id) => {
    if (!canDelete) {
      showToast?.("Bạn không có quyền xóa người dùng", "error");
      return;
    }
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này không?")) return;

    try {
      await apiClient.delete(`/users/${id}`);
      fetchUsers();
      showToast?.("✅ Xóa người dùng thành công", "success");
    } catch (err) {
      console.error(err);
      showToast?.("❌ Xóa người dùng thất bại", "error");
    }
  };

  // Bắt đầu chỉnh sửa
  const handleEdit = (user) => {
    if (!canEditBasic) {
      showToast?.("Bạn không có quyền chỉnh sửa người dùng", "error");
      return;
    }
    setEditingUser(user._id || user.id);
    setEditData({
      name: user.name || user.username,
      role: user.role || "user",
      email: user.email || "",
    });
  };

  // Lưu chỉnh sửa
  const handleSave = async (id) => {
    if (!canEditBasic) {
      showToast?.("Bạn không có quyền cập nhật người dùng", "error");
      return;
    }

    const payload = { name: editData.name, email: editData.email };
    if (canChangeRole) payload.role = editData.role;

    try {
      await apiClient.put(`/users/${id}`, payload);
      setEditingUser(null);
      fetchUsers();
      showToast?.("💾 Cập nhật user thành công", "success");
    } catch (err) {
      console.error(err);
      showToast?.("❌ Cập nhật user thất bại", "error");
    }
  };

  const handleCancel = () => setEditingUser(null);

  return (
    <div className="userlist-container">
      <h2>👥 Danh sách người dùng</h2>
      {loading ? (
        <p className="loading">Đang tải dữ liệu...</p>
      ) : users.length === 0 ? (
        <p className="no-data">Không có dữ liệu</p>
      ) : (
        <table className="userlist-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên</th>
              <th>Vai trò</th>
              <th>Email</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u._id || u.id} className={i % 2 === 0 ? "row-even" : "row-odd"}>
                <td>{i + 1}</td>
                <td>
                  {editingUser === (u._id || u.id) ? (
                    <input
                      className="edit-input"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      disabled={!canEditBasic}
                    />
                  ) : (
                    u.name
                  )}
                </td>
                <td>
                  {editingUser === (u._id || u.id) ? (
                    <select
                      className="edit-select"
                      value={editData.role}
                      onChange={(e) =>
                        setEditData({ ...editData, role: e.target.value })
                      }
                      disabled={!canChangeRole}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  ) : (
                    u.role
                  )}
                </td>
                <td>
                  {editingUser === (u._id || u.id) ? (
                    <input
                      className="edit-input"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      disabled={!canEditBasic} // user thường không sửa
                    />
                  ) : (
                    u.email
                  )}
                </td>
                <td>
                  {canEditBasic || canDelete ? (
                    editingUser === (u._id || u.id) ? (
                      <>
                        <button
                          className="btn btn-save"
                          onClick={() => handleSave(u._id || u.id)}
                        >
                          💾 Lưu
                        </button>
                        <button
                          className="btn btn-cancel"
                          onClick={handleCancel}
                        >
                          ❌ Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        {canEditBasic && (
                          <button
                            className="btn btn-edit"
                            onClick={() => handleEdit(u)}
                          >
                            ✏️ Sửa
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="btn btn-delete"
                            onClick={() => handleDelete(u._id || u.id)}
                          >
                            🗑️ Xóa
                          </button>
                        )}
                      </>
                    )
                  ) : (
                    <em>Không có quyền</em>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
});

export default UserList;
