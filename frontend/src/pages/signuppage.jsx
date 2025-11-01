import { useState } from "react";
import { signup } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5"; 
import "../form.css";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setIsError(true);
      setMessage("⚠️ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (!isValidEmail(form.email)) {
      setIsError(true);
      setMessage("⚠️ Email không hợp lệ!");
      return;
    }

    if (form.password.length < 8) {
      setIsError(true);
      setMessage("⚠️ Mật khẩu phải có ít nhất 8 ký tự!");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setIsError(true);
      setMessage("⚠️ Mật khẩu nhập lại không khớp!");
      return;
    }

    try {
      // Gọi API signup và in response ra console để debug
      const res = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      console.log("signup response:", res);

      setIsError(false);
      // Nếu backend trả message cụ thể thì hiển thị nó
      const backendMsg = res?.data?.message || res?.data || "Đăng ký thành công";
      setMessage(`✅ ${backendMsg}`);
      // Chờ 1s cho người dùng nhìn message rồi chuyển sang login
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error("signup error:", err?.response || err);
      setIsError(true);
      const backendMsg = err.response?.data?.message || "";
      if (backendMsg.toLowerCase().includes("email")) {
        setMessage("⚠️ Email này đã được sử dụng!");
      } else if (backendMsg) {
        setMessage(`❌ ${backendMsg}`);
      } else {
        setMessage("❌ Lỗi khi đăng ký!");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Đăng ký</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Tên"
            value={form.name}
            onChange={handleChange}
          />
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          {/* Mật khẩu */}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu (tối thiểu 8 ký tự)"
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

          {/* Nhập lại mật khẩu */}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "20px",
                color: "#666",
              }}
              title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showConfirmPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </span>
          </div>

          <button type="submit">Đăng ký</button>
        </form>

        {message && (
          <p
            className="auth-message"
            style={{
              color: isError ? "red" : "green",
              fontWeight: "bold",
            }}
          >
            {message}
          </p>
        )}

        <p className="link-text" onClick={() => navigate("/login")}>
          Đã có tài khoản? Đăng nhập
        </p>
      </div>
    </div>
  );
}