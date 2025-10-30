import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token: paramToken } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const q = new URLSearchParams(location.search);
  const queryToken = q.get("token");
  const queryEmail = q.get("email");
  const token = paramToken || queryToken || "";
  const [tokenInput, setTokenInput] = useState(token);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("DEBUG ResetPassword token (param/query):", { paramToken, queryToken, token, queryEmail });
    setTokenInput(token);
    if (!token) setError("Thiếu token reset. Kiểm tra link email hoặc dán token vào ô.");
  }, [paramToken, queryToken, token, queryEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  if (!tokenInput) return setError("Không có token reset.");
    if (password.length < 6) return setError("Mật khẩu tối thiểu 6 ký tự.");
    if (password !== confirm) return setError("Mật khẩu xác nhận không khớp.");

    setLoading(true);
  const API = (process.env.REACT_APP_API_URL || "http://localhost:4000").replace(/\/$/, "");

    // Các biến thể URL và body để thử (tăng khả năng tương thích với backend khác nhau)
    const candidates = [];

    // 1) path variants: /auth/reset-password/:token and /api/auth/reset-password/:token
  candidates.push({ url: `${API}/auth/reset-password/${encodeURIComponent(tokenInput)}`, body: { password } });
  candidates.push({ url: `${API}/api/auth/reset-password/${encodeURIComponent(tokenInput)}`, body: { password } });
    // try newPassword field name as some backends expect that
  candidates.push({ url: `${API}/auth/reset-password/${encodeURIComponent(tokenInput)}`, body: { newPassword: password } });
  candidates.push({ url: `${API}/api/auth/reset-password/${encodeURIComponent(tokenInput)}`, body: { newPassword: password } });

    // 2) body variants: POST /auth/reset-password with { token, password } or { token, newPassword }
  candidates.push({ url: `${API}/auth/reset-password`, body: { token: tokenInput, password } });
  candidates.push({ url: `${API}/api/auth/reset-password`, body: { token: tokenInput, password } });
  candidates.push({ url: `${API}/auth/reset-password`, body: { token: tokenInput, newPassword: password } });
  candidates.push({ url: `${API}/api/auth/reset-password`, body: { token: tokenInput, newPassword: password } });

    // 3) some implementations require email + token
    if (queryEmail) {
  candidates.push({ url: `${API}/auth/reset-password`, body: { token: tokenInput, email: queryEmail, password } });
  candidates.push({ url: `${API}/api/auth/reset-password`, body: { token: tokenInput, email: queryEmail, password } });
    }

    // dedupe candidate urls
    const seen = new Set();
    const uniqueCandidates = candidates.filter((c) => {
      const k = `${c.url}|${JSON.stringify(c.body)}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    try {
      let successRes = null;
      for (const c of uniqueCandidates) {
        try {
          console.log("DEBUG thử URL:", c.url, "body:", c.body);
          const res = await axios.post(c.url, c.body, { headers: { "Content-Type": "application/json" } });
          console.log("DEBUG success:", c.url, res.status, res.data);
          successRes = res;
          break;
        } catch (err) {
          console.warn("DEBUG request failed:", c.url, err?.response?.status, err?.response?.data || err.message);
          // continue trying next candidate
        }
      }

      if (!successRes) throw new Error("Tất cả endpoint thử đều thất bại - xem console/network/backend logs");

      alert(successRes.data?.message || "Đổi mật khẩu thành công");
      navigate("/login");
    } catch (err) {
      console.error("DEBUG Final error:", err?.response || err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err.message || "Lỗi server";
      setError(`Lỗi (${status || "?"}): ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Đổi mật khẩu</h2>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {!paramToken && (
            <input
              placeholder="Token reset (dán vào nếu link sai miền)"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
          )}
          <input type="password" placeholder="Mật khẩu mới" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" placeholder="Xác nhận mật khẩu" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button type="submit" disabled={loading}>{loading ? "Đang xử lý..." : "Đổi mật khẩu"}</button>
        </form>
      </div>
    </div>
  );
}