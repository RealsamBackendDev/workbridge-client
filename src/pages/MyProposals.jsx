import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function MyProposals() {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    api.get("/proposals/my").then(({ data }) => setProposals(data.data.proposals));
  }, []);

  const withdraw = async (id) => {
    await api.delete(`/proposals/${id}`);
    setProposals((ps) => ps.map((p) => (p.id === id ? { ...p, status: "WITHDRAWN" } : p)));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold my-4">My Proposals</h1>
      <div className="space-y-3">
        {proposals.map((p) => (
          <div key={p.id} className="border rounded p-4 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <Link to={`/jobs/${p.job?.id}`} className="font-semibold text-forest hover:underline">
                  {p.job?.title}
                </Link>
                <p className="text-sm text-stone">
                  Bid ₦{p.bidAmount?.toLocaleString()} · {p.estimatedDays} days
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    p.status === "ACCEPTED"
                      ? "bg-green-100 text-green-700"
                      : p.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-mist/30 text-stone"
                  }`}
                >
                  {p.status}
                </span>
                {p.status === "PENDING" && (
                  <button onClick={() => withdraw(p.id)} className="text-xs text-red-600 hover:underline">
                    Withdraw
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-stone mt-2 line-clamp-2">{p.coverLetter}</p>
          </div>
        ))}
        {proposals.length === 0 && <p className="text-stone text-center py-10">No proposals yet.</p>}
      </div>
    </div>
  );
}