import { useState } from "react";
import axios from "axios";

function AddUser({ onUserAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = { name, email };

    axios
      .post("http://localhost:3000/api/users", newUser) // ← đổi thành /api/users nếu backend có prefix /api
      .then((res) => {
        onUserAdded(res.data);
        setName("");
        setEmail("");
      })
      .catch((err) => console.error("Lỗi khi thêm user:", err));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Thêm User Mới (MongoDB)</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Thêm User</button>
      </form>
    </div>
  );
}

export default AddUser;
