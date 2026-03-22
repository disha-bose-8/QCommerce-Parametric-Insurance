import { useState } from "react";

export default function Login({ setRole }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // simple mock login (can connect backend later)
    if (username === "admin" && password === "admin") {
      localStorage.setItem("role", "admin");
      setRole("admin");
    } else if (username === "worker" && password === "worker") {
      localStorage.setItem("role", "worker");
      setRole("worker");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">

      <div className="bg-white p-8 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        <input
          placeholder="Username"
          className="border p-2 w-full mb-3"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white w-full py-2 rounded"
        >
          Login
        </button>

        <p className="text-sm text-gray-500 mt-3 text-center">
          admin/admin or worker/worker
        </p>
      </div>
    </div>
  );
}