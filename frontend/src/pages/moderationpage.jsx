import React from "react";
import { useNavigate } from "react-router-dom";
import UserList from "../components/UserList";

export default function ModerationPage() {
  const navigate = useNavigate();
  const showToast = (msg, type = "info") => {
    // simple fallback; integrate with your toast system if present
    console[type === "error" ? "error" : "log"](msg);
  };

  return (
    <div className="profile-container">
      <div className="profile-card wide-card">
        <div className="page-header">
          <div />
          <h1 className="page-title">Moderator</h1>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/home")}>
            🏠 Về Home
          </button>
        </div>
        <p className="subtitle text-center">Bạn có thể chỉnh sửa tên và email người dùng.</p>
        <UserList showToast={showToast} />
      </div>
    </div>
  );
}
