import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const body = new URLSearchParams();
    body.append("username", username);
    body.append("password", password);

    try {
      const { data } = await axios.post("/auth/login", body);
      localStorage.setItem("token", data.access_token);

      const user = await axios.get("/auth/me");
      localStorage.setItem("role", user.data.role);
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-semibold mb-4">Wine Service Login</h2>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full mb-2 border p-2 rounded" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full mb-4 border p-2 rounded" />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
}
