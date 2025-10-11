import React, { useState } from "react";  
import UserList from "./UserList";
import AddUser from "./AddUser";

function App() {
    const [users, setUsers] = useState([]);

    const handleUserAdded = (newUser) => {
        setUsers((prevUsers) => [...prevUsers, newUser]);
    };

    return (
        <div>
            <h1 style={{ textAlign: "center" }}>Quản Lý User</h1>
            <AddUser onUserAdded={handleUserAdded} />
            <UserList users={users} />
        </div>
    );
}

export default App;
