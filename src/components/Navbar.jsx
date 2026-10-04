import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import api from "../lib/api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/login");
  };

  const [unread, setUnread] = useState(0);

useEffect(() => {
  if (!user) return;
  const poll = () => api.get("/conversations")
    .then(({ data }) => setUnread(data.data.totalUnread || 0))
    .catch(() => {});
  poll();
  const t = setInterval(poll, 30000);
  return () => clearInterval(t);
}, [user]);

  const homePath = user ? (user.role === "CLIENT" ? "/jobs/my" : user.role === "ADMIN" ? "/admin/kyc" : "/jobs") : "/";

  const links = user ? (
    <>
      <Link to="/jobs" onClick={() => setOpen(false)} className="hover:underline">Browse Jobs</Link>
      {user.role === "CLIENT" && (
        <>
          <Link to="/jobs/my" onClick={() => setOpen(false)} className="hover:underline">My Jobs</Link>
          <Link to="/projects" onClick={() => setOpen(false)} className="hover:underline">Projects</Link>
        </>
      )}
      {user.role === "FREELANCER" && (
        <>
          <Link to="/proposals/my" onClick={() => setOpen(false)} className="hover:underline">My Proposals</Link>
          <Link to="/projects" onClick={() => setOpen(false)} className="hover:underline">Projects</Link>
        </>
      )}
      {user.role === "ADMIN" && (
        <Link to="/admin/kyc" onClick={() => setOpen(false)} className="hover:underline">KYC Review</Link>
      )}
      <Link to="/messages" onClick={() => setOpen(false)} className="hover:underline relative">
  Messages
  {unread > 0 && (
    <span className="absolute -top-2 -right-4 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-px">
      {unread > 9 ? "9+" : unread}
    </span>
  )}
</Link>
      <Link to="/wallet" onClick={() => setOpen(false)} className="hover:underline">Wallet</Link>
      <Link to="/profile" onClick={() => setOpen(false)} className="hover:underline">Profile</Link>
    </>
  ) : null;

  return (
    <nav className="bg-forest text-white px-4 py-3">
      <div className="flex items-center gap-5">
        <Link to={homePath} className="font-bold text-lg flex items-center gap-2">
          <Logo size={28} /> WorkBridge
        </Link>
        <div className="hidden md:flex items-center gap-5">{links}</div>
        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <>
              <Link to="/profile" className="hidden sm:block text-sm text-cream/80 hover:text-white">
                {user.name} · {user.role}
              </Link>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="bg-mist text-forest font-medium px-3 py-1 rounded hover:bg-sky">Sign up</Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="md:hidden" aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && links && (
        <div className="md:hidden flex flex-col gap-3 pt-3 border-t border-cream/20 mt-3">
          {links}
        </div>
      )}
    </nav>
  );
}