import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import { getToken } from "../utils/storage";
import "../form.css";

const UserList = forwardRef(({ showToast }, ref) => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({ name: "", role: "", email: "" });
  const [currentUserRole, setCurrentUserRole] = useState("user");
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL;

  // Lấy danh sách user
  const fetchUsers = async () => {
    const token = getToken();
    if (!token) {
      showToast?.("Không có token, không thể fetch users", "error");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const data = res.data?.users || res.data?.data || [];
      const me = res.data.me || res.data.currentUser || JSON.parse(localStorage.getItem("user"));
      setUsers(data);
      setCurrentUserRole(me?.role || "user");
    } catch (err) {
      console.error("Lỗi fetchUsers:", err.response || err.message || err);
      showToast?.("Lỗi lấy dữ liệu user", "error");
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
      const token = getToken();
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
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
      const token = getToken();
      await axios.put(`${API_URL}/users/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        withCredentials: true,
      });
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
