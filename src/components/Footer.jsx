import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-5xl mx-auto p-8 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <p className="text-white font-bold text-lg mb-2">🌉 WorkBridge</p>
          <p className="text-slate-400">Where clients and freelancers meet, collaborate, and get paid — securely.</p>
        </div>
        <div>
          <p className="text-white font-medium mb-2">Platform</p>
          <ul className="space-y-1">
            <li><Link to="/jobs" className="hover:text-white">Browse jobs</Link></li>
            <li><Link to="/register" className="hover:text-white">Become a freelancer</Link></li>
            <li><Link to="/register" className="hover:text-white">Hire talent</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-medium mb-2">Company</p>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-white">About</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-medium mb-2">Legal</p>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-white">Terms of service</a></li>
            <li><a href="#" className="hover:text-white">Privacy policy</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 text-center text-xs text-slate-500 py-4">
        © 2026 WorkBridge. Built as a portfolio project.
      </div>
    </footer>
  );
}