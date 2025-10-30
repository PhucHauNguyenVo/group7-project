import apiClient from "../api/apiClient";
import React, { useState } from "react";
import { getToken, getUser } from "../utils/storage";

function AddUser({ reloadUsers, showToast }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
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

    try {
      setSubmitting(true);
      const token = getToken();
      if (!token) {
        showToast?.("⚠️ Bạn cần đăng nhập trước khi thêm user", "error");
        setSubmitting(false);
        return;
      }

      const res = await apiClient.post(`/users`, { name, role, email });

      if (res.status === 201 || res.status === 200) {
        setName("");
        setRole("user");
        setEmail("");
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
        <option value="admin">Admin</option>
      </select>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={submitting}
      />
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Đang thêm..." : "➕ Thêm"}
      </button>
    </form>
  );
}

export default AddUser;
