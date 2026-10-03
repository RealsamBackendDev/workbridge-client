import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [form, setForm] = useState({ coverLetter: "", bidAmount: "", estimatedDays: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await api.get(`/jobs/${id}`);
    setJob(data.data.job);
    if (user?.role === "CLIENT" && data.data.job.client?.id === user.id) {
      const res = await api.get(`/jobs/${id}/proposals`);
      setProposals(res.data.data.proposals);
    }
  };

  useEffect(() => { load(); }, [id, user]);

  const submitProposal = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post(`/jobs/${id}/proposals`, {
        coverLetter: form.coverLetter,
        bidAmount: Number(form.bidAmount),
        estimatedDays: Number(form.estimatedDays),
      });
      setMessage("Proposal submitted successfully");
      setForm({ coverLetter: "", bidAmount: "", estimatedDays: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit proposal");
    }
  };

  const accept = async (proposalId) => {
    await api.post(`/proposals/${proposalId}/accept`);
    load();
  };

  if (!job) return <p className="p-10 text-center text-stone">Loading...</p>;
  const isOwner = user?.id === job.client?.id;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="border rounded p-5 bg-white">
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <p className="text-green-700 font-medium mt-1">
          ₦{job.budgetMin?.toLocaleString()} – ₦{job.budgetMax?.toLocaleString()}
        </p>
        <p className="text-stone text-sm">Posted by {job.client?.name} · {job.status}</p>
        <p className="mt-4 text-forest whitespace-pre-wrap">{job.description}</p>
        <div className="flex gap-2 mt-4 flex-wrap">
          {job.skillsRequired.map((s) => (
            <span key={s} className="bg-mist/40 text-forest text-xs px-2 py-1 rounded">{s}</span>
          ))}
        </div>

        {user?.role === "FREELANCER" && job.status === "OPEN" && (
          <form onSubmit={submitProposal} className="mt-6 border-t pt-4 space-y-3">
            <h3 className="font-semibold">Submit a proposal</h3>
            {error && <p className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</p>}
            {message && <p className="bg-green-100 text-green-700 p-2 rounded text-sm">{message}</p>}
            <textarea className="w-full border p-2 rounded" rows="5" placeholder="Cover letter (min 20 chars)"
              value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} required />
            <div className="flex gap-3">
              <input className="border p-2 rounded w-32" type="number" placeholder="Your bid ₦"
                value={form.bidAmount} onChange={(e) => setForm({ ...form, bidAmount: e.target.value })} required />
              <input className="border p-2 rounded w-32" type="number" placeholder="Days"
                value={form.estimatedDays} onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })} required />
            </div>
            <button className="tebg-forest text-white px-4 py-2 rounded">Submit proposal</button>
          </form>
        )}
      </div>

      {isOwner && (
        <div>
          <h2 className="font-semibold mb-3">Proposals ({proposals.length})</h2>
          <div className="space-y-3">
            {proposals.map((p) => (
              <div key={p.id} className="border rounded p-4 bg-white">
                <div className="flex justify-between">
                  <p className="font-medium">{p.freelancer?.name}</p>
                  <p className="text-green-700">₦{p.bidAmount?.toLocaleString()} · {p.estimatedDays} days</p>
                </div>
                <p className="text-sm text-stone mt-2 line-clamp-3">{p.coverLetter}</p>
                {p.status === "PENDING" && job.status === "OPEN" && (
                  <button onClick={() => accept(p.id)} className="mt-3 bg-green-600 text-white px-3 py-1 rounded text-sm">
                    Accept & hire
                  </button>
                )}
                {p.status !== "PENDING" && (
                  <span className="text-xs bg-mist/30 px-2 py-1 rounded">{p.status}</span>
                )}
              </div>
            ))}
            {proposals.length === 0 && <p className="text-stone text-sm">No proposals yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}