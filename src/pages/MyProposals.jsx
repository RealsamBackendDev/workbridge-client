import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function MyProposals() {
  const [proposals, setProposals] = useState([]);

  const load = () => {
    api.get("/proposals/my").then(({ data }) => setProposals(data.data.proposals));
  };

  useEffect(() => { load(); }, []);

  const withdraw = async (id) => {
    if (!window.confirm("Withdraw this proposal? This cannot be undone.")) return;
    await api.delete(`/proposals/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold my-4 text-forest">My Proposals</h1>
      <div className="space-y-3">
        {proposals.map((p) => (
          <div key={p.id} className="border border-stone/30 rounded p-4 bg-white">
            <div className="flex justify-between items-start gap-4">
              <div>
                <Link to={`/jobs/${p.job?.id}`} className="font-semibold text-forest hover:underline">
                  {p.job?.title}
                </Link>
                <p className="text-sm text-stone mt-1">
                  Bid ₦{p.bidAmount?.toLocaleString()} · {p.estimatedDays} days
                  {p.attachments?.length > 0 && ` · ${p.attachments.length} attachment(s)`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs px-2 py-1 rounded ${
                  p.status === "ACCEPTED" ? "bg-green-100 text-green-700"
                  : p.status === "PENDING" ? "bg-yellow-100 text-yellow-700"
                  : "bg-slate-100 text-slate-600"
                }`}>{p.status}</span>
                {p.status === "PENDING" && (
                  <button onClick={() => withdraw(p.id)}
                    className="text-xs border border-red-300 text-red-600 px-3 py-1 rounded hover:bg-red-50">
                    Withdraw
                  </button>
                )}
              </div>
            </div>
            <p className="text-stone text-sm line-clamp-2 mt-1 break-words">{p.coverLetter}</p>
          </div>
        ))}
        {proposals.length === 0 && (
          <p className="text-stone text-center py-10">
            No proposals yet. <Link to="/jobs" className="text-forest underline">Browse jobs</Link> and submit your first bid.
          </p>
        )}
      </div>
    </div>
  );
}