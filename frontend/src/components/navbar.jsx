import { useNavigate } from "react-router-dom";
import "../form.css";


export default function Navbar({ onLogout, user }) {
  const navigate = useNavigate();
  
  
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


