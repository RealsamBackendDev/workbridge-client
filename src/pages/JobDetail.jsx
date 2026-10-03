import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Paperclip, X } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [form, setForm] = useState({ coverLetter: "", bidAmount: "", estimatedDays: "", attachments: "" });
  const [uploaded, setUploaded] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data.data.job);
      if (user?.role === "CLIENT" && data.data.job.client?.id === user.id) {
        const res = await api.get(`/jobs/${id}/proposals`);
        setProposals(res.data.data.proposals);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load job");
    }
  };

  useEffect(() => { load(); }, [id, user]);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "misc");
      try {
        const { data } = await api.post("/upload", fd);
        setUploaded((u) => [...u, { name: file.name, url: data.data.url }]);
      } catch (err) {
        setError(err.response?.data?.message || `Upload failed for ${file.name}`);
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const removeUpload = (url) => setUploaded((u) => u.filter((f) => f.url !== url));

  const submitProposal = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const links = form.attachments.split(",").map((s) => s.trim()).filter(Boolean);
    const attachments = [...uploaded.map((f) => f.url), ...links];
    try {
      await api.post(`/jobs/${id}/proposals`, {
        coverLetter: form.coverLetter,
        bidAmount: Number(form.bidAmount),
        estimatedDays: Number(form.estimatedDays),
        ...(attachments.length ? { attachments } : {}),
      });
      setMessage("Proposal submitted successfully");
      setForm({ coverLetter: "", bidAmount: "", estimatedDays: "", attachments: "" });
      setUploaded([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit proposal");
    }
  };

  const accept = async (proposalId) => {
    try {
      await api.post(`/proposals/${proposalId}/accept`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Accept failed");
    }
  };

  const reject = async (proposalId) => {
    try {
      await api.post(`/proposals/${proposalId}/reject`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Reject failed");
    }
  };

  if (!job) return <p className="p-10 text-center text-stone">Loading...</p>;
  const isOwner = user?.id === job.client?.id;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="border border-stone/30 rounded p-5 bg-white min-w-0">
        <h1 className="text-2xl font-bold text-forest break-words">{job.title}</h1>
        <p className="text-green-700 font-medium mt-1">
          ₦{job.budgetMin?.toLocaleString()} – ₦{job.budgetMax?.toLocaleString()}
        </p>
        <p className="text-stone text-sm">
          Posted by {job.client?.name} ·
          <span className={`ml-1 text-xs px-2 py-0.5 rounded ${
            job.status === "OPEN" ? "bg-yellow-100 text-yellow-700" : "bg-mist/40 text-forest"
          }`}>{job.status.replace(/_/g, " ")}</span>
        </p>
        <p className="mt-4 text-stone whitespace-pre-wrap break-words">{job.description}</p>
        <div className="flex gap-2 mt-4 flex-wrap">
          {job.skillsRequired.map((s) => (
            <span key={s} className="bg-mist/40 text-forest text-xs px-2 py-1 rounded break-words">{s}</span>
          ))}
        </div>

        {user?.role === "FREELANCER" && job.status === "OPEN" && (
          <form onSubmit={submitProposal} className="mt-6 border-t border-stone/20 pt-4 space-y-3">
            <h3 className="font-semibold text-forest">Submit a proposal</h3>
            {error && <p className="bg-red-100 text-red-700 p-2 rounded text-sm break-words">{error}</p>}
            {message && <p className="bg-green-100 text-green-700 p-2 rounded text-sm">{message}</p>}
            <textarea className="w-full border border-stone/40 p-2 rounded bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
              rows="5" placeholder="Cover letter (min 20 chars)" value={form.coverLetter}
              onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} required />
            <div className="flex gap-3 flex-wrap">
              <input className="border border-stone/40 p-2 rounded w-32 bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
                type="number" placeholder="Your bid ₦" value={form.bidAmount}
                onChange={(e) => setForm({ ...form, bidAmount: e.target.value })} required />
              <input className="border border-stone/40 p-2 rounded w-32 bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
                type="number" placeholder="Days" value={form.estimatedDays}
                onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })} required />
            </div>

            <label className="flex items-center gap-2 text-sm text-forest cursor-pointer border border-stone/40 rounded-lg px-3 py-2 hover:bg-mist/30 w-fit">
              <Paperclip size={16} />
              {uploading ? "Uploading..." : "Attach files (images / PDF, max 5MB each)"}
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden" onChange={handleFiles} disabled={uploading} />
            </label>

            {uploaded.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploaded.map((f) => (
                  <span key={f.url} className="flex items-center gap-1 bg-mist/40 text-forest text-xs px-2 py-1 rounded">
                    {f.name}
                    <button type="button" onClick={() => removeUpload(f.url)} className="text-red-600">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input className="w-full border border-stone/40 p-2 rounded bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
              placeholder="Or paste links (Drive, YouTube, portfolio), comma-separated"
              value={form.attachments} onChange={(e) => setForm({ ...form, attachments: e.target.value })} />

            <button className="bg-forest text-white px-4 py-2 rounded hover:bg-stone" disabled={uploading}>
              Submit proposal
            </button>
          </form>
        )}
      </div>

      {isOwner && (
        <div className="min-w-0">
          <h2 className="font-semibold mb-3 text-forest">Proposals ({proposals.length})</h2>
          <div className="space-y-3">
            {proposals.map((p) => (
              <div key={p.id} className="border border-stone/30 rounded p-4 bg-white">
                <div className="flex justify-between gap-4 flex-wrap">
                  <p className="font-medium text-forest break-words">{p.freelancer?.name}</p>
                  <p className="text-green-700 whitespace-nowrap">₦{p.bidAmount?.toLocaleString()} · {p.estimatedDays} days</p>
                </div>
                <p className="text-sm text-stone mt-2 line-clamp-3 whitespace-pre-wrap break-words">{p.coverLetter}</p>

                {p.attachments?.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {p.attachments.map((a) => (
                      <a key={a} href={a} target="_blank" rel="noreferrer"
                        className="text-xs bg-mist/40 text-forest px-2 py-1 rounded hover:underline break-all">
                        Attachment ↗
                      </a>
                    ))}
                  </div>
                )}

                {p.status === "PENDING" && job.status === "OPEN" ? (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => accept(p.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-500">
                      Accept & hire
                    </button>
                    <button onClick={() => reject(p.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200">
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="inline-block mt-3 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{p.status}</span>
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