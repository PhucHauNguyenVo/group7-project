import React, { useEffect ,useState } from "react";
import axios from "axios";




function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h2>Danh Sách  User </h2>
            <ul  style={{ listStyle: "none", padding: 0 }}>
                {users.map((u) => (
                    <li key={u.id}
                     style={{
              marginBottom: "15px",
              padding: "10px",
              borderBottom: "1px solid #ddd", }}>
                 <div style={{ fontWeight: "bold" }}>{u.name}</div>
            <div style={{ color: "#555" }}>{u.email}</div>
                
                    </li>   
                ))}
            </ul>
        </div>
        );
}

export default UserList;
