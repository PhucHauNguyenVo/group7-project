import axios from "axios";
import React, { useState } from "react";

function AddUser({ reloadUsers }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/users`, {
        name,
        email,
      });
      reloadUsers();
      setName("");
      setEmail("");
    } catch (err) {
      console.error("❌ Lỗi khi thêm user:", err);
    }
  };

  return (
    <form onSubmit={handleAddUser}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <button type="submit">Thêm người dùng</button>
    </form>
  );
}

export default AddUser;
