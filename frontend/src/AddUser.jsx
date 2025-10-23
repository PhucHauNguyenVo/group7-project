import axios from "axios";
import React, { useState } from "react";

function AddUser({ reloadUsers }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddUser = async (e) => {
    e.preventDefault();

    // Validation cơ bản
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

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("⚠️ Email không hợp lệ (vd: ten@gmail.com)");
      setSuccess("");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/users`, {
        name,
        role,
        email,
      });

      setName("");
      setRole("");
      setEmail("");
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
    <div style={styles.container}>
      <h2 style={styles.title}>➕ Thêm người dùng mới</h2>

      <form onSubmit={handleAddUser} style={styles.form}>
        <input
          type="text"
          placeholder="Tên người dùng"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Vai trò "
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          ➕ Thêm người dùng
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    maxWidth: "450px",
    margin: "20px auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    color: "#007bff",
    marginBottom: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
    outline: "none",
    transition: "border 0.2s ease-in-out",
  },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 12px",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  inputFocus: {
    borderColor: "#007bff",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  error: {
    color: "#dc3545",
    marginTop: "10px",
    textAlign: "center",
  },
  success: {
    color: "#28a745",
    marginTop: "10px",
    textAlign: "center",
  },
};

export default AddUser;
