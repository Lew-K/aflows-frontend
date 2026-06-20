import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("https://api.aflows.uk/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const response = await res.json();
      const data = Array.isArray(response) ? response[0] : response;
      if (data.success) {
        // Cookie is set by the backend; only keep a UI flag locally
        localStorage.setItem(
          "superadmin",
          data.isSuperAdmin ? "true" : "false"
        );
        // Navigate to dashboard
        navigate("/internal-admin");
      } else {
        alert("Invalid admin credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed. Check console for details.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Admin Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-4 rounded text-gray-900 bg-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-6 rounded text-gray-900 bg-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
