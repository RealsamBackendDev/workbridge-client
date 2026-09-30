import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 text-white px-4 py-3 flex items-center gap-5">
      <Link to="/jobs" className="font-bold text-lg">🌉 WorkBridge</Link>
      {user && (
        <>
          <Link to="/jobs" className="hover:underline">Jobs</Link>
          {user.role === "FREELANCER" && <Link to="/proposals/my" className="hover:underline">My Proposals</Link>}
          {(user.role === "CLIENT" || user.role === "FREELANCER") && <Link to="/projects" className="hover:underline">Projects</Link>}
          <Link to="/messages" className="hover:underline">Messages</Link>
          <Link to="/wallet" className="hover:underline">Wallet</Link>
        </>
      )}
      <div className="ml-auto flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-slate-300">{user.name} · {user.role}</span>
            <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded text-sm">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="bg-blue-600 px-3 py-1 rounded text-sm">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}