import React, { useState } from "react";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      console.log("Email trống"); // debug
      alert("Error: Nhập email");
      return;
    }

    try {
      setLoading(true);
      console.log("Gửi email:", email); // debug

      const res = await apiClient.post(`/auth/forgot-password`, { email });

      console.log("Response:", res.data); // debug
      alert(res.data?.message || "Đã gửi token tới email"); // test frontend
    } catch (err) {
      console.error(err); // debug
      alert(err?.response?.data?.message || "Lỗi gửi token"); // test frontend
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Quên mật khẩu</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email nhận token"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button type="submit" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi token"}
            </button>
            <button type="button" onClick={() => navigate("/login")}>
              Quay về đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
