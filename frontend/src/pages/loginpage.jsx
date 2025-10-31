// frontend/src/pages/loginpage.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import "../form.css";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authStatus = useSelector((s) => s?.auth?.status);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setIsError(true);
      setMessage("⚠️ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (!isValidEmail(form.email)) {
      setIsError(true);
      setMessage("⚠️ Email không hợp lệ!");
      return;
    }

    try {
      const action = await dispatch(loginThunk(form));
      if (loginThunk.fulfilled.match(action)) {
        setIsError(false);
        setMessage("✅ Đăng nhập thành công!");
        navigate("/home");
        return;
      }
      // rejected
      const backendMsg = action.payload || action.error?.message || "";
      setIsError(true);
      const lower = (backendMsg || "").toLowerCase();
      if (lower.includes("invalid") || lower.includes("wrong") || lower.includes("not found")) {
        setMessage("❌ Sai email hoặc mật khẩu!");
      } else {
        setMessage("❌ Lỗi khi đăng nhập!");
      }
    } catch (_) {
      setIsError(true);
      setMessage("❌ Lỗi khi đăng nhập!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <div style={{ position: "relative", width: "100%" }}>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
              style={{
                width: "100%",
                boxSizing: "border-box",
                paddingRight: "38px",
                height: "38px",
                fontSize: "15px",
              }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "20px",
                color: "#666",
              }}
              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </span>
          </div>

          <button type="submit" disabled={authStatus === "loading"}>
            {authStatus === "loading" ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {message && (
          <p className="auth-message" style={{ color: isError ? "red" : "green", fontWeight: "bold" }}>
            {message}
          </p>
        )}

        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <p
            className="link-text"
            onClick={() => navigate("/signup")}
            style={{ cursor: "pointer", color: "#007bff" }}
          >
            Chưa có tài khoản? Đăng ký ngay
          </p>
          <Link
            to="/forgot-password"
            style={{ color: "#007bff", textDecoration: "none", fontSize: "14px" }}
          >
            Quên mật khẩu?
          </Link>
        </div>
      </div>
    </div>
  );
}
