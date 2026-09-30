import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Phone, Lock, UserPlus } from "lucide-react";
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

  const inputClass = "w-full border rounded-lg pl-9 pr-3 py-2.5";

  return (
    <div className="grid md:grid-cols-2 gap-0 max-w-4xl mx-auto mt-10 border rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-blue-700 text-white p-10 flex flex-col justify-center">
        <p className="text-3xl font-bold">Join WorkBridge 🚀</p>
        <p className="text-blue-100 mt-4">
          {form.role === "CLIENT"
            ? "Post jobs and hire identity-verified freelancers with milestone-protected payments."
            : "Find real clients, submit proposals, and get paid per milestone — with built-in protection."}
        </p>
        <ul className="mt-8 space-y-2 text-sm text-blue-100">
          <li>✦ Email-verified accounts</li>
          <li>✦ KYC for freelancer trust</li>
          <li>✦ Wallet-based payments</li>
        </ul>
      </div>

      <div className="bg-white p-10">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><UserPlus size={20} /> Create account</h2>
        <p className="text-sm text-gray-500 mb-6">Takes less than a minute</p>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
        {message && <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">{message}</p>}

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
            <input className={inputClass} placeholder="Full name"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
            <input className={inputClass} type="email" placeholder="Email address"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
            <input className={inputClass} placeholder="Phone (e.g. +2348012345678)"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
            <input className={inputClass} type="password" placeholder="Password (min 8 characters)"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "CLIENT", label: "I want to hire", icon: "💼" },
              { value: "FREELANCER", label: "I want to work", icon: "🛠️" },
            ].map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setForm({ ...form, role: r.value })}
                className={`border rounded-lg p-3 text-sm text-left ${
                  form.role === r.value ? "border-blue-600 bg-blue-50" : "hover:bg-slate-50"
                }`}
              >
                <span className="text-lg">{r.icon}</span>
                <p className="font-medium mt-1">{r.label}</p>
              </button>
            ))}
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium">Create account</button>
        </form>

        <p className="mt-6 text-sm text-gray-600 text-center">
          Already have an account? <Link to="/login" className="text-blue-600 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}