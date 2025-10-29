import React, { useState } from "react";
import axios from "axios";
import { getToken } from "../utils/storage";

export default function AvatarUploader({ onUploaded, showToast, currentAvatar }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentAvatar || "");
  const [uploading, setUploading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(f.type)) {
      showToast?.("Chỉ chấp nhận ảnh JPG/PNG", "error");
      return;
    }

    if (f.size > 2 * 1024 * 1024) {
      showToast?.("Ảnh quá lớn, tối đa 2MB", "error");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return showToast?.("Chọn ảnh trước", "error");

    const form = new FormData();
    form.append("avatar", file);

    try {
      setUploading(true);
      const token = getToken();
      const API_URL = process.env.REACT_APP_API_URL;

      if (!API_URL) {
        console.error("API URL chưa cấu hình!");
        showToast?.("Lỗi cấu hình API", "error");
        return;
      }

      const res = await axios.post(`${API_URL}/users/upload-avatar`, form, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      console.log("✅ Upload response:", res.data);

      if (res.data?.user) {
        setPreview(res.data.user.avatar || "");
        onUploaded?.(res.data);
      }

      showToast?.(res.data?.message || "Upload thành công", "success");
    } catch (err) {
      console.error("❌ Upload error:", err.response || err);
      showToast?.(
        err.response?.data?.message || "Upload thất bại",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      const token = getToken();
      const API_URL = process.env.REACT_APP_API_URL;

      if (!API_URL) return;

      const res = await axios.put(
        `${API_URL}/users/profile`,
        { avatar: "" }, // backend cần hỗ trợ xóa avatar
        { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
      );

      if (res.data?.user) {
        setPreview("");
        onUploaded?.(res.data);
      }

      showToast?.(res.data?.message || "Xóa avatar thành công", "success");
    } catch (err) {
      console.error(err);
      showToast?.("Xóa avatar thất bại", "error");
    }
  };

  return (
    <div className="upload-avatar">
      <h3>Upload Avatar</h3>
      {preview ? (
        <img
          src={preview}
          alt="preview"
          style={{
            width: 120,
            height: 120,
            objectFit: "cover",
            borderRadius: "50%",
            border: "2px solid #ccc",
          }}
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

      <input type="file" accept="image/*" onChange={handleFile} />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Đang upload..." : "Tải lên"}
        </button>
        {preview && (
          <button className="btn btn-cancel" onClick={handleRemove}>
            ❌ Xóa
          </button>
        )}
      </div>
    </div>
  );
}
