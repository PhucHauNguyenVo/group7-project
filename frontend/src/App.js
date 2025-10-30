import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import LoginPage from "./pages/loginpage";
import SignupPage from "./pages/signuppage";
import HomePage from "./pages/homepage";
import ProfilePage from "./pages/profilepage";
import AdminPage from "./pages/adminpage";
import ModerationPage from "./pages/moderationpage";
import Navbar from "./components/navbar";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AvatarUploader from "./components/AvatarUploader";
import { RequireAuth, RequireRole } from "./components/guards";

import { getToken, clearToken } from "./utils/storage";
import { getCurrentUser, logout } from "./api/auth";

function App() {
  // 🚀 Ban đầu chưa xác thực
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ Khi app khởi chạy, kiểm tra token & user trong localStorage
  useEffect(() => {
    const token = getToken();
    const savedUser = getCurrentUser();

    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(savedUser);
      console.log("✅ Khôi phục phiên đăng nhập:", savedUser);
    } else {
      console.log("🚪 Chưa đăng nhập hoặc thiếu thông tin user");
    }
  }, []);

  // ✅ Khi đăng nhập thành công
  const handleLoginSuccess = (data) => {
    console.log("✅ onLoginSuccess nhận được:", data);
    setIsAuthenticated(true);

    // lấy user từ localStorage (do login đã lưu)
    const savedUser = getCurrentUser();
    setUser(savedUser || data?.user || data);
  };

  // ✅ Khi đăng xuất
  const handleLogout = () => {
    console.log("🚪 Đăng xuất!");
    logout();
    clearToken();
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  // Giữ lại state hiển thị Navbar, nhưng dùng guards cho route

  return (
    
    
    <Router>
      {/* ✅ Navbar chỉ hiện khi đã đăng nhập */}
      {isAuthenticated && <Navbar onLogout={handleLogout} user={user} />}

      <Routes>
        {/* Điều hướng mặc định */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/home" : "/login"} />}
        />

        {/* Trang đăng nhập */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Trang đăng ký */}
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <SignupPage />}
        />

        {/* Form Forgot Password (có thể truy cập khi chưa đăng nhập) */}
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <ForgotPassword />}
        />

        {/* Reset Password bằng token (token trong URL) */}
        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        {/* Trang người dùng */}
        <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />

        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

        {/* Upload Avatar (chỉ cho user đã đăng nhập) */}
        <Route path="/upload-avatar" element={<RequireAuth><AvatarUploader /></RequireAuth>} />
      
  {/* Trang admin */}
        <Route path="/admin" element={<RequireAuth><RequireRole roles={["admin"]}><AdminPage /></RequireRole></RequireAuth>} />

  {/* Khu vực Moderator (cả admin và moderator đều vào được) */}
  <Route path="/moderation" element={<RequireAuth><RequireRole roles={["admin","moderator"]}><ModerationPage /></RequireRole></RequireAuth>} />

        {/* Route mặc định */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
