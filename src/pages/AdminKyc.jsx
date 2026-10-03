import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, FileText } from "lucide-react";
import api from "../lib/api";

export default function AdminKyc() {
  const [pending, setPending] = useState([]);
  const [message, setMessage] = useState("");

  const load = () => {
    api.get("/admin/kyc/pending").then(({ data }) => setPending(data.data.pending));
  };

  useEffect(() => { load(); }, []);

  const review = async (userId, action) => {
    let reason;
    if (action === "REJECT") {
      reason = window.prompt("Reason for rejection (shown to the freelancer):") ?? "";
      if (reason === null) return;
    }
    setMessage("");
    try {
      await api.post(`/auth/admin/kyc/${userId}/review`, { action, reason });
      setMessage(`KYC ${action === "APPROVE" ? "approved" : "rejected"}.`);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Review failed");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold my-4 text-forest">KYC Submissions Awaiting Review</h1>
      {message && <p className="bg-slate-100 p-3 rounded mb-4 text-sm">{message}</p>}

      <div className="space-y-3">
        {pending.map((u) => (
          <div key={u.id} className="border border-stone/30 rounded p-4 bg-white">
            <div className="flex justify-between gap-4 flex-wrap">
              <div>
                <p className="font-semibold text-forest">{u.name}</p>
                <p className="text-sm text-stone">{u.email}</p>
                <p className="text-xs text-stone mt-1 flex items-center gap-1">
                  <FileText size={12} /> {u.kycDocumentType} · {u.kycDocumentNo}
                  {u.kycDocumentImg && (
                    <a href={u.kycDocumentImg} target="_blank" rel="noreferrer" className="text-forest underline ml-2">
                      View document ↗
                    </a>
                  )}
                </p>
                <p className="text-xs text-stone mt-1">Submitted {new Date(u.updatedAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 items-start">
                <button onClick={() => review(u.id, "APPROVE")}
                  className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-500">
                  <ShieldCheck size={14} /> Approve
                </button>
                <button onClick={() => review(u.id, "REJECT")}
                  className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded text-sm hover:bg-red-200">
                  <ShieldAlert size={14} /> Reject
                </button>
              </div>
            </div>
          </div>
        ))}
        {pending.length === 0 && (
          <p className="text-stone text-center py-10">No pending KYC submissions. All caught up. ✅</p>
        )}
      </div>
    </div>
  );
}