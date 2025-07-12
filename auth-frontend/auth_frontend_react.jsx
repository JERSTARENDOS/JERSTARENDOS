import React, { useState } from "react";

export default function AuthApp() {
  const [registerData, setRegisterData] = useState({ email: "", password: "" });
  const [otpData, setOtpData] = useState({ email: "", otp: "" });
  const [message, setMessage] = useState({ register: "", verify: "" });

  const backendURL = "http://localhost:5000/api/auth";

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendURL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      setMessage((prev) => ({ ...prev, register: data.message }));
    } catch (err) {
      setMessage((prev) => ({ ...prev, register: "Error registering user." }));
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendURL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(otpData),
      });
      const data = await res.json();
      setMessage((prev) => ({ ...prev, verify: data.message }));
    } catch (err) {
      setMessage((prev) => ({ ...prev, verify: "Error verifying OTP." }));
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold text-center mb-4">User Authentication</h2>

      <form onSubmit={handleRegister} className="mb-6 border p-4 rounded">
        <h3 className="font-semibold mb-2">Register</h3>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-2 border rounded"
          value={registerData.email}
          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-2 border rounded"
          value={registerData.password}
          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Register</button>
        <p className="text-sm mt-2 text-green-600">{message.register}</p>
      </form>

      <form onSubmit={handleVerify} className="border p-4 rounded">
        <h3 className="font-semibold mb-2">Verify OTP</h3>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-2 border rounded"
          value={otpData.email}
          onChange={(e) => setOtpData({ ...otpData, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full p-2 mb-2 border rounded"
          value={otpData.otp}
          onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
          required
        />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Verify OTP</button>
        <p className="text-sm mt-2 text-green-600">{message.verify}</p>
      </form>
    </div>
  );
}
