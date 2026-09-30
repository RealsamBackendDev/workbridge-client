import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, KeyRound, Lock } from "lucide-react";
import api from "../lib/api";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sendCode = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setStep(2);
      setMessage("Reset code sent. In development, check your server console for the code.");
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/reset-password", { email, code, newPassword });
      setMessage("Password reset successfully. Redirecting to login...");
      setTimeout(() => (window.location.href = "/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  const inputClass = "w-full border rounded-lg pl-9 pr-3 py-2.5";

  return (
    <div className="max-w-md mx-auto mt-16 border rounded-2xl p-8 shadow-sm bg-white">
      <h2 className="text-xl font-bold mb-1">Reset your password</h2>
      <p className="text-sm text-gray-500 mb-6">
        {step === 1 ? "Enter your email and we'll send you a 6-digit code." : "Enter the code from your email and choose a new password."}
      </p>

      {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
      {message && <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">{message}</p>}

      {step === 1 ? (
        <form onSubmit={sendCode} className="space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
            <input className={inputClass} type="email" placeholder="Email address"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium">Send reset code</button>
        </form>
      ) : (
        <form onSubmit={reset} className="space-y-4">
          <div className="relative">
            <KeyRound size={16} className="absolute left-3 top-3.5 text-gray-400" />
            <input className={inputClass} placeholder="6-digit code"
              value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
            <input className={inputClass} type="password" placeholder="New password (min 8 chars)"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium">Reset password</button>
        </form>
      )}

      <p className="mt-6 text-sm text-gray-600 text-center">
        Remembered it? <Link to="/login" className="text-blue-600 font-medium">Back to login</Link>
      </p>
    </div>
  );
}