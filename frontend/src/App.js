import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import LoginPage from "./pages/loginpage";
import SignupPage from "./pages/signuppage";
import HomePage from "./pages/homepage";
import ProfilePage from "./pages/profilepage";
import AdminPage from "./pages/adminpage";
import ModerationPage from "./pages/moderationpage";
import AdminLogsPage from "./pages/adminLogsPage";
import Navbar from "./components/navbar";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AvatarUploader from "./components/AvatarUploader";
import { RequireAuth, RequireRole } from "./components/guards";

import { clearToken } from "./utils/storage";
import { logout as apiLogout } from "./api/auth";
import { logoutThunk } from "./features/auth/authSlice";

function App() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s?.auth?.token);
  const user = useSelector((s) => s?.auth?.user);
  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  // ✅ Khi đăng xuất
  const handleLogout = () => {
    console.log("🚪 Đăng xuất!");
    try { apiLogout(); } catch (_) {}
    try { clearToken(); } catch (_) {}
    dispatch(logoutThunk());
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
        <Route path="/login" element={<LoginPage />} />

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

    {/* Logs cho Admin */}
    <Route path="/admin/logs" element={<RequireAuth><RequireRole roles={["admin"]}><AdminLogsPage /></RequireRole></RequireAuth>} />

  {/* Khu vực Moderator (cả admin và moderator đều vào được) */}
  <Route path="/moderation" element={<RequireAuth><RequireRole roles={["admin","moderator"]}><ModerationPage /></RequireRole></RequireAuth>} />

        {/* Route mặc định */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
