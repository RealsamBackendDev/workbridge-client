import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="bg-forest text-white p-10 flex flex-col justify-center">
        <div className="mb-6"><Logo size={56} /></div>
        <p className="text-3xl font-bold">Welcome back</p>
        <p className="text-cream/80 mt-4">
          Log in to manage your projects, review proposals, and release milestone payments.
        </p>
        <ul className="mt-8 space-y-2 text-sm text-cream/80">
          <li>✦ Clients: hire verified freelancers</li>
          <li>✦ Freelancers: track your proposals</li>
          <li>✦ Everyone: chat in real time</li>
        </ul>
      </div>

      <div className="bg-white p-10">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><LogIn size={20} /> Log in</h2>
        <p className="text-sm text-stone mb-6">Enter your credentials to continue</p>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-3.5 text-stone" />
            <input className="w-full border rounded-lg pl-9 pr-3 py-2.5" type="email" placeholder="Email address"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-3.5 text-stone" />
            <input
              className="w-full border rounded-lg pl-9 pr-10 py-2.5"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-3.5 text-stone hover:text-forest"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-forest hover:underline">Forgot password?</Link>
          </div>
          <button className="w-full bg-forest hover:bg-stone text-white py-2.5 rounded-lg font-medium">Log in</button>
        </form>

        <p className="mt-6 text-sm text-stone text-center">
          New to WorkBridge? <Link to="/register" className="text-forest font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  );
}