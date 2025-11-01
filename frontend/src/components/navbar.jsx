import { useNavigate, useLocation } from "react-router-dom";
import "../form.css";


export default function Navbar({ onLogout, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  // Ẩn Navbar trên trang đăng nhập để tránh che nội dung/thông báo
  if (location.pathname === "/login") return null;
  
  
console.log("Navbar user:", user);
console.log("Navbar user role:", user?.role);


  const handleLogout = () => onLogout();

  return (
    <nav className="navbar">
      <h2 className="navbar-title" onClick={() => navigate("/home")}>
        homepage
      </h2>

      <div className="navbar-buttons">
        {user?.role?.toLowerCase() === "admin" && (
  <button
    className="btn btn-warning"
    onClick={() => navigate("/admin")}
  >
     Admin
  </button>
)}
        {user?.role?.toLowerCase() === "moderator" && (
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/moderation")}
          >
            Moderator
          </button>
        )}
        <button className="btn btn-primary" onClick={() => navigate("/profile")}>
          Hồ sơ cá nhân
        </button>
        <button className="btn btn-danger" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </nav>
  );
}


