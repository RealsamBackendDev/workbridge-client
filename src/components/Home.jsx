import { Link } from "react-router-dom";
import { ShieldCheck, Wallet, MessageSquare, Search, ArrowRight, Briefcase, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="-mx-4">
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <span className="bg-slate-700 text-xs px-3 py-1 rounded-full">Freelance marketplace · MVP</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-6 leading-tight">
            Hire verified freelancers.<br />Get paid through milestones.
          </h1>
          <p className="text-slate-300 mt-4 text-lg">
            WorkBridge connects clients with KYC-verified freelancers — post a job,
            compare proposals, and release payment only when work is approved.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link to="/register" className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-medium flex items-center gap-2">
              <Briefcase size={18} /> Hire talent
            </Link>
            <Link to="/register" className="border border-slate-500 hover:bg-slate-700 px-6 py-3 rounded-lg font-medium flex items-center gap-2">
              <Users size={18} /> Find work
            </Link>
          </div>
          <div className="flex justify-center gap-10 mt-12 text-sm text-slate-300">
            <div><p className="text-2xl font-bold text-white">100%</p><p>escrow-style payments</p></div>
            <div><p className="text-2xl font-bold text-white">KYC</p><p>verified freelancers</p></div>
            <div><p className="text-2xl font-bold text-white">Live</p><p>real-time messaging</p></div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {[
            { icon: Search, title: "Post or find a job", text: "Clients post jobs with budgets. Freelancers browse and submit tailored proposals." },
            { icon: ShieldCheck, title: "Hire with confidence", text: "Compare bids, check verified KYC status, and hire. A project workspace opens instantly." },
            { icon: Wallet, title: "Pay per milestone", text: "Work is split into milestones. Funds move only when you approve the delivery." },
          ].map((s, i) => (
            <div key={i} className="border rounded-xl p-6 bg-white">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <s.icon size={20} className="text-blue-600" />
              </div>
              <p className="font-semibold">{s.title}</p>
              <p className="text-sm text-gray-600 mt-2">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-100 px-4 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold">For clients</h2>
            <ul className="mt-4 space-y-3 text-gray-700">
              <li className="flex gap-2"><ShieldCheck className="text-green-600 shrink-0" size={18} /> Every freelancer is identity-verified before they can be hired</li>
              <li className="flex gap-2"><Wallet className="text-green-600 shrink-0" size={18} /> You only pay when milestone work is approved</li>
              <li className="flex gap-2"><MessageSquare className="text-green-600 shrink-0" size={18} /> Built-in real-time chat with your freelancer</li>
            </ul>
            <Link to="/register" className="inline-flex items-center gap-2 mt-6 bg-slate-900 text-white px-5 py-2.5 rounded-lg">
              Post a job <ArrowRight size={16} />
            </Link>
          </div>
          <div>
            <h2 className="text-2xl font-bold">For freelancers</h2>
            <ul className="mt-4 space-y-3 text-gray-700">
              <li className="flex gap-2"><Briefcase className="text-blue-600 shrink-0" size={18} /> Browse open jobs and bid with your terms</li>
              <li className="flex gap-2"><Wallet className="text-blue-600 shrink-0" size={18} /> Get paid per milestone into your wallet</li>
              <li className="flex gap-2"><ShieldCheck className="text-blue-600 shrink-0" size={18} /> Clear submission and review workflow — no ambiguity</li>
            </ul>
            <Link to="/register" className="inline-flex items-center gap-2 mt-6 bg-blue-600 text-white px-5 py-2.5 rounded-lg">
              Create your profile <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}