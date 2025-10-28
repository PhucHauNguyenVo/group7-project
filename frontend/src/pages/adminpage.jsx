import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UserList from "../components/UserList";
import AddUser from "../components/AddUser";
import "../form.css";

export default function AdminPage() {
  const navigate = useNavigate();
  const userListRef = useRef();
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type="success") => {
    setToast({ message, type });
    setTimeout(()=>setToast({ message:"", type:"" }),3000);
  };

  const reloadUsers = () => userListRef.current?.fetchUsers?.();

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
          <h2 className="profile-title">🛠️ Quản lý User (Admin)</h2>
          <button className="btn btn-primary" onClick={()=>navigate("/home")}>🏠 Về Home</button>
        </div>

        <AddUser reloadUsers={reloadUsers} showToast={showToast} />
        <UserList ref={userListRef} showToast={showToast} />

        {toast.message && (
          <div className={`toast ${toast.type==="error"?"toast-error":"toast-success"}`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}