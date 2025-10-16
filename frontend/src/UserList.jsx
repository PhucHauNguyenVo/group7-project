import React, { useEffect, useState } from "react";
import axios from "axios";

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://172.23.15.224:4000/api/users");
        console.log("📦 Dữ liệu nhận về:", res.data);
        setUsers(res.data);
      } catch (err) {
        console.error("❌ Lỗi lấy dữ liệu:", err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>👥 Danh sách người dùng MongoDB</h2>
      {users.length === 0 ? (
        <p>Không có dữ liệu nào</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u._id}>
              <b>{u.name || u.ten}</b> — {u.role || u.ngay} — {u.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserList;
