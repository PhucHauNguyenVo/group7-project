import axios from "axios";
import React, { useState } from "react";

function AddUser({ reloadUsers }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddUser = async (e) => {
    e.preventDefault();

    // Kiểm tra trống
    if (!name.trim()) {
      setError("⚠️ Tên không được để trống");
      setSuccess("");
      return;
    }

    if (!role.trim()) {
      setError("⚠️ Vai trò không được để trống");
      setSuccess("");
      return;
    }

    // Regex kiểm tra email hợp lệ
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("⚠️ Email không hợp lệ (ví dụ: ten@gmail.com)");
      setSuccess("");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/users`, {
        name,
        email,
        role,
      });

      // Reset form + thông báo thành công
      setName("");
      setEmail("");
      setRole("");
      setError("");
      setSuccess("✅ Thêm người dùng thành công!");
      reloadUsers();
    } catch (err) {
      console.error("❌ Lỗi khi thêm user:", err);
      setError("❌ Không thể thêm người dùng. Kiểm tra backend hoặc kết nối mạng.");
      setSuccess("");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>➕ Thêm người dùng</h2>

      <form
        onSubmit={handleAddUser}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 400,
        }}
      >
        <input
          type="text"
          placeholder="Tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "6px 10px" }}
        />
        <input
          type="text"
          placeholder="Vai trò"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ padding: "6px 10px" }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "6px 10px" }}
        />
        <button type="submit" style={{ padding: "6px 15px" }}>
          Thêm người dùng
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
      {success && <p style={{ color: "green", marginTop: "8px" }}>{success}</p>}
    </div>
  );
}

export default AddUser;
