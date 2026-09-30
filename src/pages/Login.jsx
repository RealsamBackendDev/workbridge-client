import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "CLIENT" ? "/jobs" : "/jobs");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6">Log in to WorkBridge</h1>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full border p-2 rounded" type="email" placeholder="Email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Log in</button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        No account? <Link to="/register" className="text-blue-600">Sign up</Link>
      </p>
    </div>
  );
}