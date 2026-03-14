import { useState } from "react";

export default function AdminLogin() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    const res = await fetch("https://n8n.aflows.uk/webhook/admin-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const response = await res.json();
    const data = Array.isArray(response) ? response[0] : response;
    
    if (data.success) {
      localStorage.setItem("admin_token", data.token);
      window.location.href = "/interna-admin";
    }


    } else {

      alert("Invalid admin credentials");

    }
  };

  return (

    <div className="flex items-center justify-center min-h-screen bg-gray-50">

      <div className="bg-white p-8 rounded-xl shadow-md w-96">

        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Admin Login
        </h1>

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
