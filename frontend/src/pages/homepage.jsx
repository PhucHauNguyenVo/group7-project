// HomePage.jsx (Code sạch hơn)

import { getToken } from "../utils/storage";

export default function HomePage() {
  const token = getToken(); 

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Chào mừng bạn đã đăng nhập!</h1>
      <p>Token đang lưu trong localStorage:</p>
      
      {/* Sử dụng <pre> hoặc <code> với wordWrap 
          để token dài không làm vỡ layout 
      */}
      <pre 
        style={{
          wordWrap: "break-word", 
          whiteSpace: "pre-wrap",
          background: "#f4f4f4",
          padding: "10px",
          borderRadius: "5px"
        }}
      >
        {token}
      </pre>
    </div>
  );
}