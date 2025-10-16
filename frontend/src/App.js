import React, { useState } from "react";
import AddUser from "./AddUser";
import UserList from "./UserList";

function App() {
  const [reload, setReload] = useState(false);

  const reloadUsers = () => setReload(!reload);

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>Quản Lý User</h1>
      <AddUser reloadUsers={reloadUsers} />
      <UserList reload={reload} />
    </div>
  );
}

export default App;
