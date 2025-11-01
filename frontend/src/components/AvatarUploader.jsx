import React, { useState } from "react";
import { uploadAvatar, removeAvatar } from "../api/profile";
import { resizeImageFile } from "../utils/image";

export default function AvatarUploader({ onUploaded, showToast, currentAvatar }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentAvatar || "");
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(f.type)) {
      showToast?.("Chỉ chấp nhận ảnh JPG/PNG/WebP", "error");
      return;
    }

    try {
      // Resize & compress client-side to 512px max dimension, ~85% quality, target <= 1MB
      const { file: resized, dataUrl, meta } = await resizeImageFile(f, {
        maxDimension: 512,
        mimeType: "image/jpeg",
        initialQuality: 0.85,
        maxBytes: 1024 * 1024,
      });
      setFile(resized);
      setPreview(dataUrl);
      // Optional feedback
      if (f.size > resized.size) {
        const kb = (n) => Math.round(n / 102.4) / 10; // 1 decimal
        showToast?.(`Đã nén ảnh: ${kb(f.size)}KB → ${kb(resized.size)}KB (${meta.dstW}x${meta.dstH})`, "success");
      }
    } catch (err) {
      console.error("Resize error:", err);
      // fallback: use original
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpload = async () => {
    if (!file) return showToast?.("Chọn ảnh trước", "error");

    try {
      setUploading(true);
  const data = await uploadAvatar(file);
      console.log("✅ Upload response:", data);

      const user = data?.user || data?.data?.user || data?.profile;
      if (user) {
        // tránh tình trạng mất avatar khi backend trả user thiếu field khác
        setPreview(user.avatar || "");
        onUploaded?.({ ...data, user: { ...(JSON.parse(localStorage.getItem("user")) || {}), ...user } });
      }

      showToast?.(data?.message || "Upload thành công", "success");
    } catch (err) {
      console.error("❌ Upload error:", err.response || err);
      showToast?.(err.response?.data?.message || "Upload thất bại", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      const data = await removeAvatar();
      const user = data?.user || data?.data?.user || data?.profile;
      if (user || data) {
        setPreview("");
        onUploaded?.(data);
      }
      showToast?.(data?.message || "Xóa avatar thành công", "success");
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
