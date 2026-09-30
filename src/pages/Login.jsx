import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
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
      await login(form.email, form.password);
      navigate("/jobs");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-0 max-w-4xl mx-auto mt-10 border rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-slate-900 text-white p-10 flex flex-col justify-center">
        <p className="text-3xl font-bold">Welcome back 👋</p>
        <p className="text-slate-300 mt-4">
          Log in to manage your projects, review proposals, and release milestone payments.
        </p>
        <ul className="mt-8 space-y-2 text-sm text-slate-300">
          <li>✦ Clients: hire verified freelancers</li>
          <li>✦ Freelancers: track your proposals</li>
          <li>✦ Everyone: chat in real time</li>
        </ul>
      </div>

      <div className="bg-white p-10">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><LogIn size={20} /> Log in</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your credentials to continue</p>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
            <input className="w-full border rounded-lg pl-9 pr-3 py-2.5" type="email" placeholder="Email address"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
            <input className="w-full border rounded-lg pl-9 pr-3 py-2.5" type="password" placeholder="Password"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium">Log in</button>
        </form>

        <p className="mt-6 text-sm text-gray-600 text-center">
          New to WorkBridge? <Link to="/register" className="text-blue-600 font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  );
}