import { Link, useNavigate } from "react-router-dom";
import { Search, Code2, PenTool, FileText, Megaphone, Database, Sparkles, ShieldCheck, Wallet, ArrowRight } from "lucide-react";
import { useState } from "react";
import Logo from "../components/Logo";

const CATEGORIES = [
  { icon: Code2, label: "Web Development", value: "WEB_DEVELOPMENT" },
  { icon: PenTool, label: "Design", value: "DESIGN" },
  { icon: FileText, label: "Writing", value: "WRITING" },
  { icon: Megaphone, label: "Marketing", value: "MARKETING" },
  { icon: Database, label: "Data", value: "DATA" },
  { icon: Sparkles, label: "Everything else", value: "" },
];

const POPULAR = ["React developer", "Logo design", "Landing page", "Copywriting", "Figma", "Node.js"];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const go = (q) => navigate(q ? `/jobs?search=${encodeURIComponent(q)}` : "/jobs");

  return (
    <div className="-mx-4">
      <section className="bg-forest text-white px-4 pt-16 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6"><Logo size={64} /></div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Hire expert freelancers for any job, online.
          </h1>
          <p className="text-cream/80 mt-4 text-lg">
            Post a job, compare proposals from KYC-verified freelancers, and pay only when work is approved.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); go(query); }}
            className="mt-8 flex bg-white rounded-xl overflow-hidden shadow-lg max-w-xl mx-auto"
          >
            <div className="flex items-center pl-4 text-stone">
              <Search size={18} />
            </div>
            <input
              className="flex-1 px-3 py-4 text-forest outline-none"
              placeholder='Try "build a website" or "logo design"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="tebg-forest hover:bg-stone px-6 font-medium">Search</button>
          </form>

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            <span className="text-stone py-1">Popular:</span>
            {POPULAR.map((p) => (
              <button
                key={p}
                onClick={() => go(p)}
                className="border border-stone/50 rounded-full px-3 py-1 hover:bg-forest"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              to={c.value ? `/jobs?category=${c.value}` : "/jobs"}
              className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <c.icon size={22} className="text-forest" />
              <p className="font-medium mt-3">{c.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center">Get work done in three steps</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {[
            { title: "Post your job", text: "Describe what you need and set your budget. It's free to post." },
            { title: "Choose your freelancer", text: "Compare proposals, review bids, and hire with milestone protection." },
            { title: "Pay when it's done", text: "Funds release only when you approve each milestone delivery." },
          ].map((s, i) => (
            <div key={i} className="border rounded-xl p-6 bg-white">
              <p className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-bold">{i + 1}</p>
              <p className="font-semibold mt-4">{s.title}</p>
              <p className="text-sm text-stone mt-2">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-mist/30 px-4 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 border">
            <ShieldCheck size={26} className="text-green-600" />
            <h3 className="text-xl font-bold mt-3">For clients</h3>
            <p className="text-stone mt-2 text-sm">
              Hire identity-verified talent. Your money sits in your wallet and only moves when you approve delivered work.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 mt-5 bg-forest text-white px-5 py-2.5 rounded-lg">
              Post a job <ArrowRight size={16} />
            </Link>
          </div>
          <div className="bg-white rounded-2xl p-8 border">
            <Wallet size={26} className="text-forest" />
            <h3 className="text-xl font-bold mt-3">For freelancers</h3>
            <p className="text-stone mt-2 text-sm">
              Complete a one-time KYC, bid on real jobs, and get paid per milestone straight to your wallet.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 mt-5 tebg-forest text-white px-5 py-2.5 rounded-lg">
              Earn money <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-forest text-white px-4 py-16 text-center">
        <h2 className="text-3xl font-bold">Ready to get started?</h2>
        <p className="text-cream/80 mt-2">Join WorkBridge — it takes less than a minute.</p>
        <Link to="/register" className="inline-block mt-6 tebg-forest hover:bg-stone px-8 py-3 rounded-lg font-medium">
          Create free account
        </Link>
      </section>
    </div>
  );
}