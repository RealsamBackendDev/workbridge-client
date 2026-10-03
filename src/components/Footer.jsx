import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-forest text-cream/80 mt-16">
      <div className="max-w-5xl mx-auto p-8 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <p className="text-white font-bold text-lg mb-2 flex items-center gap-2">
            <Logo size={24} /> WorkBridge
          </p>
          <p className="text-stone">Where clients and freelancers meet, collaborate, and get paid — securely.</p>
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
      <div className="border-t border-stone/40 text-center text-xs text-stone py-4">
        © <a href="https://www.linkedin.com/in/samuel-ilesanmi-24bb353aa?utm_source=share_via&utm_content=profile&utm_medium=member_android" className="hover:text-white">The Real Sam Dev</a> 2026 WorkBridge. Built as a portfolio and Capstone project.
      </div>
    </footer>
  );
}