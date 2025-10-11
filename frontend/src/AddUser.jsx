import { useState } from "react";
import axios from "axios";

function AddUser({ onUserAdded }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const newUser = { name, email };

        axios
            .post("http://localhost:3000/users", newUser)
            .then((res) => {
                onUserAdded(res.data);
                setName("");
                setEmail("");
            })
            .catch((err) => console.error(err));
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Thêm User Mới</h2>
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
