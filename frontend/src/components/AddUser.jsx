import apiClient from "../api/apiClient";
import React, { useState } from "react";
import { getToken, getUser } from "../utils/storage";

function AddUser({ reloadUsers, showToast }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAddUser = async (e) => {
    e.preventDefault();

    // ✨ Chỉ admin mới được thêm user
    const currentUser = getUser();
    if (currentUser?.role !== "admin") {
      showToast?.("❌ Chỉ admin mới được thêm người dùng", "error");
      return;
    }

    if (!name || !role || !email) {
      showToast?.("⚠️ Vui lòng nhập đầy đủ thông tin!", "error");
      return;
    }
    if (!isValidEmail(email)) {
      showToast?.("⚠️ Email không hợp lệ!", "error");
      return;
    }
    if (password && password.length < 8) {
      showToast?.("⚠️ Mật khẩu tối thiểu 8 ký tự!", "error");
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      if (!token) {
        showToast?.("⚠️ Bạn cần đăng nhập trước khi thêm user", "error");
        setSubmitting(false);
        return;
      }

  const payload = { name, role, email };
  if (password) payload.password = password; // nếu không nhập, backend sẽ dùng default '123456'
  const res = await apiClient.post(`/users`, payload);

      if (res.status === 201 || res.status === 200) {
        setName("");
        setRole("user");
  setEmail("");
  setPassword("");
        showToast?.("✅ Thêm người dùng thành công", "success");
        reloadUsers?.();
      } else {
        showToast?.(`❌ Thêm thất bại (${res.status})`, "error");
      }
    } catch (err) {
      console.error("Add user error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Lỗi khi thêm user";
      showToast?.(`❌ ${msg}`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="adduser-form" onSubmit={handleAddUser}>
      <input
        placeholder="Tên"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={submitting}
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        disabled={submitting}
      >
        <option value="user">User</option>
        <option value="moderator">Moderator</option>
        <option value="admin">Admin</option>
      </select>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={submitting}
      />
      <input
        type="password"
        placeholder="Mật khẩu (tuỳ chọn, ≥ 8 ký tự)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={submitting}
      />
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Đang thêm..." : "➕ Thêm"}
      </button>
    </form>
  );
}

export default AddUser;
