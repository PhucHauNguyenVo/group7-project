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
    const candidates = [EP.usersList, "/users", "/user", "/admin/users", "/users/all"];
    try {
      let res;
      let lastErr;
      for (const url of candidates) {
        try {
          // Đảm bảo header Authorization luôn có mặt
          const token = getToken();
          res = await apiClient.get(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
          break;
        } catch (e) {
          lastErr = e;
          const status = e?.response?.status;
          if (status === 404 || status === 405) continue;
          throw e;
        }
      }
      if (!res) throw lastErr || new Error("No users endpoint");

      const payload = res.data;
      const data = Array.isArray(payload)
        ? payload
        : payload?.users || payload?.data || [];
      const me = payload?.me || payload?.currentUser || JSON.parse(localStorage.getItem("user"));
      setUsers(data);
      setCurrentUserRole(me?.role || "user");
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

  // Xóa user (chỉ admin)
  const handleDelete = async (id) => {
    if (currentUserRole !== "admin") {
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
    if (currentUserRole !== "admin") {
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
    if (currentUserRole !== "admin") {
      showToast?.("Bạn không có quyền cập nhật người dùng", "error");
      return;
    }

    try {
      await apiClient.put(`/users/${id}`, editData);
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
              <tr key={u._id} className={i % 2 === 0 ? "row-even" : "row-odd"}>
                <td>{i + 1}</td>
                <td>
                  {editingUser === u._id ? (
                    <input
                      className="edit-input"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      disabled={currentUserRole !== "admin"}
                    />
                  ) : (
                    u.name
                  )}
                </td>
                <td>
                  {editingUser === u._id ? (
                    <select
                      className="edit-select"
                      value={editData.role}
                      onChange={(e) =>
                        setEditData({ ...editData, role: e.target.value })
                      }
                      disabled={currentUserRole !== "admin"}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    u.role
                  )}
                </td>
                <td>
                  {editingUser === u._id ? (
                    <input
                      className="edit-input"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      disabled={currentUserRole !== "admin"} // chỉ admin mới sửa email
                    />
                  ) : (
                    u.email
                  )}
                </td>
                <td>
                  {currentUserRole === "admin" ? (
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
                        <button
                          className="btn btn-edit"
                          onClick={() => handleEdit(u)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(u._id || u.id)}
                        >
                          🗑️ Xóa
                        </button>
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
