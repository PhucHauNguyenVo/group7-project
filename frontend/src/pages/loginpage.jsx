// frontend/src/pages/loginpage.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../features/auth/authSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
  const token = useSelector((s) => s?.auth?.token);
  const location = useLocation();

  // Nếu đã đăng nhập sẵn và người dùng truy cập /login, điều hướng về /home ngay
  useEffect(() => {
    if (token) navigate("/home");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        // Hiển thị thông báo một chút trước khi chuyển trang
        await new Promise((r) => setTimeout(r, 2000));
        navigate("/home");
        return;
      }
      // rejected -> action.payload may be an object { status, message, retryAfter }
      setIsError(true);
      const payload = action.payload || {};
      const backendMsg = payload.message || action.error?.message || "";

      if (payload.status === 429) {
        const wait = payload.retryAfter || "vài giây";
        setMessage(`⚠️ Quá nhiều yêu cầu. Vui lòng đợi ${wait} rồi thử lại.`);
        return;
      }

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
        {/* Thông điệp khi bị chuyển hướng từ route bảo vệ */}
        {!token && location.state?.reason === "auth" && (
          <p className="auth-message" style={{ color: "#0d6efd", fontWeight: "bold" }}>
            Vui lòng đăng nhập để truy cập: {location.state?.from || "trang yêu cầu đăng nhập"}
          </p>
        )}
        {/* Thông điệp thông báo chung (ví dụ: sau khi đổi mật khẩu) */}
        {location.state?.info && (
          <p className="auth-message" style={{ color: "#0d6efd", fontWeight: "bold" }}>
            {location.state.info}
          </p>
        )}
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
