import React, { useEffect, useState } from "react";
import axios from "axios";

function UserList() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  // Lấy dữ liệu
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://172.23.15.224:4000/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Lỗi lấy dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xóa user
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này không?")) return;
    try {
      await axios.delete(`http://172.23.15.224:4000/api/users/${id}`);
      fetchUsers(); // reload lại danh sách
    } catch (err) {
      console.error("❌ Lỗi khi xóa user:", err);
    }
  };

  // Lưu sau khi sửa
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://172.23.15.224:4000/api/users/${editingUser._id}`,
        editingUser
      );
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật user:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>👥 Danh sách người dùng MongoDB</h2>

      {/* Form sửa */}
      {editingUser && (
        <form onSubmit={handleSave}>
          <h3>Sửa thông tin user</h3>
          <input
            value={editingUser.name}
            onChange={(e) =>
              setEditingUser({ ...editingUser, name: e.target.value })
            }
            placeholder="Tên"
          />
          <input
            value={editingUser.email}
            onChange={(e) =>
              setEditingUser({ ...editingUser, email: e.target.value })
            }
            placeholder="Email"
          />
          <input
            value={editingUser.role}
            onChange={(e) =>
              setEditingUser({ ...editingUser, role: e.target.value })
            }
            placeholder="Vai trò"
          />
          <button type="submit">💾 Lưu</button>
          <button type="button" onClick={() => setEditingUser(null)}>
            ❌ Hủy
          </button>
        </form>
      )}

      {/* Danh sách */}
      {users.length === 0 ? (
        <p>Không có dữ liệu nào</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u._id}>
              <b>{u.name || u.ten}</b> — {u.role || u.ngay} — {u.email}
              <button onClick={() => setEditingUser(u)}>✏️ Sửa</button>
              <button onClick={() => handleDelete(u._id)}>🗑️ Xóa</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserList;
