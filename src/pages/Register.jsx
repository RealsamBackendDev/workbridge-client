import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Phone, Lock, UserPlus } from "lucide-react";
import api from "../lib/api";
import Logo from "../components/Logo";

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
      setMessage(data.message);
      setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(form.email)}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const inputClass =
    "w-full border border-stone/40 rounded-lg pl-9 pr-3 py-2.5 bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40 focus:bg-white";

  return (
    <div className="grid md:grid-cols-2 gap-0 max-w-4xl mx-auto mt-10 border border-stone/30 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-forest text-white p-10 flex flex-col justify-center">
        <div className="mb-6"><Logo size={56} /></div>
        <p className="text-3xl font-bold">Join WorkBridge 🚀</p>
        <p className="text-cream/80 mt-4">
          {form.role === "CLIENT"
            ? "Post jobs and hire identity-verified freelancers with milestone-protected payments."
            : "Find real clients, submit proposals, and get paid per milestone — with built-in protection."}
        </p>
        <ul className="mt-8 space-y-2 text-sm text-cream/80">
          <li>✦ Email-verified accounts</li>
          <li>✦ KYC for freelancer trust</li>
          <li>✦ Wallet-based payments</li>
        </ul>
      </div>

      <div className="bg-white p-10">
        <h2 className="text-xl font-bold mb-1 text-forest flex items-center gap-2"><UserPlus size={20} /> Create account</h2>
        <p className="text-sm text-stone mb-6">Takes less than a minute</p>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
        {message && <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">{message}</p>}

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <User size={16} className="absolute left-3 top-3.5 text-stone" />
            <input className={inputClass} placeholder="Full name"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-3.5 text-stone" />
            <input className={inputClass} type="email" placeholder="Email address"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-3.5 text-stone" />
            <input className={inputClass} placeholder="Phone (e.g. +2348012345678)"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-3.5 text-stone" />
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
                className={`border rounded-lg p-3 text-sm text-left transition-colors ${
                  form.role === r.value
                    ? "border-forest bg-mist/50"
                    : "border-stone/40 bg-white hover:border-forest/60"
                }`}
              >
                <span className="text-lg">{r.icon}</span>
                <p className="font-medium mt-1 text-forest">{r.label}</p>
              </button>
            ))}
          </div>

          <button className="w-full bg-forest hover:bg-stone text-white py-2.5 rounded-lg font-medium">Create account</button>
        </form>

        <p className="mt-6 text-sm text-stone text-center">
          Already have an account? <Link to="/login" className="text-forest font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}