// HomePage.jsx (Code sạch hơn)

import { getToken } from "../utils/storage";
import { useLocation } from "react-router-dom";

export default function HomePage() {
  const token = getToken();
  const location = useLocation();

  const infoMsg =
    location.state?.reason === "role"
      ? `Bạn không có quyền truy cập: ${location.state?.from || "trang này"}`
      : location.state?.reason === "auth"
      ? `Vui lòng đăng nhập để tiếp tục: ${location.state?.from || "trang yêu cầu đăng nhập"}`
      : null;

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      {infoMsg && (
        <div
          style={{
            margin: "0 auto 16px",
            maxWidth: 720,
            background: "#fff3cd",
            color: "#664d03",
            border: "1px solid #ffecb5",
            borderRadius: 8,
            padding: "10px 14px",
            textAlign: "left",
          }}
        >
          {infoMsg}
        </div>
      )}

      <h1>Chào mừng bạn đã đăng nhập!</h1>
      <p>Token đang lưu trong localStorage:</p>

      <pre
        style={{
          wordWrap: "break-word",
          whiteSpace: "pre-wrap",
          background: "#f4f4f4",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        {token}
      </pre>
    </div>
  );
}