import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { KeyRound, RefreshCw, MailCheck } from "lucide-react";
import api from "../lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!email) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <p className="text-stone mb-4">No email provided. Register first or log in.</p>
        <Link to="/register" className="text-forest underline">Go to register</Link>
      </div>
    );
  }

  const verify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/auth/verify-email", { email, code });
      setMessage("Email verified! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  const resend = async () => {
    setError("");
    setMessage("");
    try {
      await api.post("/auth/resend-verification", { email });
      setMessage("New code sent. Check the backend console (dev mode).");
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Resend failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 border border-stone/30 rounded-2xl p-8 shadow-sm bg-white">
      <div className="flex justify-center mb-4"><MailCheck size={40} className="text-forest" /></div>
      <h2 className="text-xl font-bold text-forest text-center">Check your email</h2>
      <p className="text-sm text-stone mt-2 text-center break-words">
        We sent a 6-digit code to <b>{email}</b>. In development, the code is printed in the backend server console.
      </p>

      {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mt-4 text-sm">{error}</p>}
      {message && <p className="bg-green-100 text-green-700 p-3 rounded-lg mt-4 text-sm">{message}</p>}

      <form onSubmit={verify} className="mt-6 space-y-4">
        <div className="relative">
          <KeyRound size={16} className="absolute left-3 top-3.5 text-stone" />
          <input
            className="w-full border border-stone/40 rounded-lg pl-9 pr-3 py-2.5 bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40 text-center tracking-[0.5em] text-lg"
            placeholder="••••••"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            required
          />
        </div>
        <button className="w-full bg-forest text-white py-2.5 rounded-lg font-medium hover:bg-stone">
          Verify email
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={resend}
          disabled={cooldown > 0}
          className="text-sm text-forest disabled:text-stone disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          <RefreshCw size={14} /> {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>

      <p className="mt-6 text-sm text-stone text-center">
        Wrong email? <Link to="/register" className="text-forest font-medium">Register again</Link> ·{" "}
        <Link to="/login" className="text-forest font-medium">Back to login</Link>
      </p>
    </div>
  );
}