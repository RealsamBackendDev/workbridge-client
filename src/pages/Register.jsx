import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", role: "FREELANCER",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const { data } = await api.post("/auth/register", form);
      setMessage(`${data.message} After verifying, log in.`);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6">Create your account</h1>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>}
      {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</p>}
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full border p-2 rounded" placeholder="Full name"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="w-full border p-2 rounded" type="email" placeholder="Email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="w-full border p-2 rounded" placeholder="Phone (e.g. +2348012345678)"
          value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password (min 8 chars)"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <div className="flex gap-4">
          {["CLIENT", "FREELANCER"].map((r) => (
            <label key={r} className="flex items-center gap-2">
              <input type="radio" checked={form.role === r} onChange={() => setForm({ ...form, role: r })} />
              {r === "CLIENT" ? "I want to hire" : "I want to work"}
            </label>
          ))}
        </div>
        <button className="w-full bg-blue-600 text-white p-2 rounded">Sign up</button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Have an account? <Link to="/login" className="text-blue-600">Log in</Link>
      </p>
    </div>
  );
}