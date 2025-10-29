// frontend/src/pages/profilepage.jsx
import React, { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api/profile";
import { getToken, getUser, setUser } from "../utils/storage";
import { useNavigate } from "react-router-dom";
import AvatarUploader from "../components/AvatarUploader";
import "../form.css";

export default function ProfilePage() {
  const [userState, setUserState] = useState(() => getUser() || { name: "", email: "", avatar: "", role: "" });
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [showUploader, setShowUploader] = useState(false);

  const token = getToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setToast({ message: "⚠️ Bạn chưa đăng nhập!", type: "error" });
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getProfile(token);
        const userData = data.user || data;

        // Merge với localStorage (giữ avatar, role nếu có)
        const prevUser = getUser() || {};
        const mergedUser = { ...prevUser, ...userData };

        setUserState(mergedUser);
        setForm({ name: mergedUser.name || "", email: mergedUser.email || "" });
        setUser(mergedUser); // lưu vào localStorage
      } catch (err) {
        console.error(err);
        setToast({ message: "Không thể tải thông tin user.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const showToastMsg = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateProfile(token, { name: form.name, email: form.email });
      const updatedUser = updated.user;

      setUser(updatedUser);
      setUserState(updatedUser);
      setForm({ name: updatedUser.name, email: updatedUser.email });
      setEditing(false);
      showToastMsg("Cập nhật thông tin thành công!", "success");
    } catch (err) {
      console.error(err);
      showToastMsg("Cập nhật thất bại, vui lòng thử lại.", "error");
    }
  };

  const handleUploaded = (res) => {
    if (res?.user) {
      const updatedUser = res.user;
      setUser(updatedUser);
      setUserState(updatedUser);
      showToastMsg(res.message || "Cập nhật avatar thành công", "success");
      setShowUploader(false);
    } else {
      showToastMsg("Upload hoàn tất nhưng không nhận được avatar", "error");
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const updated = await updateProfile(token, { avatar: "" }); // backend cần hỗ trợ avatar="" để xóa
      const updatedUser = updated.user;
      setUser(updatedUser);
      setUserState(updatedUser);
      showToastMsg("Xóa avatar thành công", "success");
    } catch (err) {
      console.error(err);
      showToastMsg("Xóa avatar thất bại", "error");
    }
  };

  if (loading) return <div className="spinner">⏳ Đang tải...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">👤 Thông tin cá nhân</h2>

        {/* Avatar area */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          {userState?.avatar ? (
            <img
              src={userState.avatar}
              alt="avatar"
              style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "50%", border: "2px solid #ccc" }}
            />
          ) : (
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
                fontWeight: 600,
              }}
            >
              Chưa có avatar
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn btn-primary" onClick={() => setShowUploader((s) => !s)}>
              {showUploader ? "Đóng" : "Tải lên avatar"}
            </button>
            {userState?.avatar && (
              <button className="btn btn-cancel" onClick={handleRemoveAvatar}>
                ❌ Xóa avatar
              </button>
            )}
          </div>
        </div>

        {showUploader && (
  <AvatarUploader
    currentAvatar={userState.avatar}
    onUploaded={handleUploaded}
    showToast={showToastMsg}
  />
)}
        {!editing ? (
          <>
            <div className="profile-info">
              <p><strong>Họ tên:</strong> {userState?.name}</p>
              <p><strong>Email:</strong> {userState?.email}</p>
              {userState?.role && <p><strong>Role:</strong> {userState.role}</p>}
            </div>
            <div className="form-buttons" style={{ justifyContent: "space-between" }}>
              <button className="btn btn-primary" onClick={() => setEditing(true)}>✏️ Chỉnh sửa</button>
              <button className="btn btn-success" onClick={() => navigate("/home")}>🏠 Về Home</button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Họ tên:</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn btn-success">💾 Lưu</button>
              <button type="button" className="btn btn-cancel" onClick={() => setEditing(false)}>❌ Hủy</button>
              <button type="button" className="btn btn-primary" onClick={() => navigate("/home")}>🏠 Về Home</button>
            </div>
          </form>
        )}

        {toast.message && (
          <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}

