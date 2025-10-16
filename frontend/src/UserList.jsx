import React, { useEffect, useState } from "react";
import axios from "axios";

function UserList() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({ name: "", role: "", email: "" });

  // 👉 Dùng biến môi trường từ .env
  const API_URL = `${process.env.REACT_APP_API_URL}/users`;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL);
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Lỗi lấy dữ liệu:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này không?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("❌ Lỗi khi xóa user:", err);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditData({
      name: user.name || user.ten,
      role: user.role || user.ngay,
      email: user.email,
    });
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, editData);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật user:", err);
    }
  };

  const handleCancel = () => setEditingUser(null);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👥 Danh sách người dùng</h2>
      {users.length === 0 ? (
        <p style={styles.empty}>Không có dữ liệu nào</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Tên</th>
              <th style={styles.th}>Vai trò</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, index) => (
              <tr key={u._id} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>
                  {editingUser === u._id ? (
                    <input
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      style={styles.input}
                    />
                  ) : (
                    u.name || u.ten
                  )}
                </td>
                <td style={styles.td}>
                  {editingUser === u._id ? (
                    <input
                      value={editData.role}
                      onChange={(e) =>
                        setEditData({ ...editData, role: e.target.value })
                      }
                      style={styles.input}
                    />
                  ) : (
                    u.role || u.ngay
                  )}
                </td>
                <td style={styles.td}>
                  {editingUser === u._id ? (
                    <input
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      style={styles.input}
                    />
                  ) : (
                    u.email
                  )}
                </td>
                <td style={styles.td}>
                  {editingUser === u._id ? (
                    <>
                      <button style={styles.saveBtn} onClick={() => handleSave(u._id)}>
                        💾 Lưu
                      </button>
                      <button style={styles.cancelBtn} onClick={handleCancel}>
                        ❌ Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button style={styles.editBtn} onClick={() => handleEdit(u)}>
                        ✏️ Sửa
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(u._id)}
                      >
                        🗑️ Xóa
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 20, maxWidth: 900, margin: "auto" },
  title: { textAlign: "center", color: "#007bff", marginBottom: 20 },
  empty: { textAlign: "center", fontStyle: "italic", color: "#999" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  th: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px 8px",
    textAlign: "left",
  },
  td: {
    padding: "10px 8px",
    borderBottom: "1px solid #ddd",
  },
  rowEven: { backgroundColor: "#f9f9f9" },
  rowOdd: { backgroundColor: "#ffffff" },
  input: {
    width: "90%",
    padding: "5px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  editBtn: {
    backgroundColor: "#ffc107",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "5px 10px",
    marginRight: "5px",
    cursor: "pointer",
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "5px 10px",
    cursor: "pointer",
  },
  saveBtn: {
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "5px 10px",
    marginRight: "5px",
    cursor: "pointer",
  },
  cancelBtn: {
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "5px 10px",
    cursor: "pointer",
  },
};

export default UserList;
