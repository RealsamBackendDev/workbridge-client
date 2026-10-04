import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Paperclip, X } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [milestoneForm, setMilestoneForm] = useState({ title: "", description: "", amount: "", dueDate: "" });
  const [submitFor, setSubmitFor] = useState(null);
  const [submission, setSubmission] = useState("");
  const [submissionLinks, setSubmissionLinks] = useState("");
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [rejectFor, setRejectFor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await api.get(`/projects/${id}`);
    setProject(data.data.project);
    const res = await api.get(`/projects/${id}/milestones`);
    setMilestones(res.data.data.milestones);
  };

  useEffect(() => { load(); }, [id]);

  const createMilestone = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/projects/${id}/milestones`, {
        title: milestoneForm.title,
        description: milestoneForm.description,
        amount: Number(milestoneForm.amount),
        dueDate: new Date(milestoneForm.dueDate).toISOString(),
      });
      setMilestoneForm({ title: "", description: "", amount: "", dueDate: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create milestone");
    }
  };

  const uploadSubmissionFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "milestone");
      try {
        const { data } = await api.post("/upload", fd);
        setSubmissionFiles((f) => [...f, { name: file.name, url: data.data.url }]);
      } catch (err) {
        setError(err.response?.data?.message || `Upload failed for ${file.name}`);
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const submitMilestone = async (milestoneId) => {
    setError("");
    const links = submissionLinks.split(",").map((s) => s.trim()).filter(Boolean);
    const attachments = [...submissionFiles.map((f) => f.url), ...links];
    try {
      await api.post(`/milestones/${milestoneId}/submit`, {
        submission,
        ...(attachments.length ? { attachments } : {}),
      });
      setSubmitFor(null);
      setSubmission("");
      setSubmissionLinks("");
      setSubmissionFiles([]);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Submit failed");
    }
  };

  const approveMilestone = async (milestoneId) => {
    setError("");
    try {
      const { data } = await api.post(`/milestones/${milestoneId}/approve`);
      if (data.data.projectCompleted) {
        alert("All milestones approved — project completed and fully paid.");
      }
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Approval failed");
    }
  };

  const rejectMilestone = async (milestoneId) => {
    setError("");
    try {
      await api.post(`/milestones/${milestoneId}/reject`, { reason: rejectReason });
      setRejectFor(null);
      setRejectReason("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Reject failed");
    }
  };

  const completeProject = async () => {
    setError("");
    try {
      await api.post(`/projects/${id}/complete`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Cannot complete project");
    }
  };

  if (!project) return <p className="p-10 text-center text-stone">Loading...</p>;

  const isClient = user?.id === project.clientId;
  const isFreelancer = user?.id === project.freelancerId;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="border border-stone/30 rounded p-5 bg-white">
          <h1 className="text-xl font-bold text-forest break-words">{project.title}</h1>
          <p className="text-green-700 font-medium mt-1">₦{project.budget?.toLocaleString()}</p>
          <span className={`text-xs px-2 py-1 rounded inline-block mt-2 ${
            project.status === "ACTIVE" ? "bg-mist/40 text-forest" : "bg-slate-100 text-slate-600"
          }`}>{project.status}</span>
          <p className="text-sm text-stone mt-4 whitespace-pre-wrap break-words">{project.description}</p>
          <p className="text-sm text-stone mt-4">
            {project.approvedMilestones}/{milestones.length || project.milestones?.length || 0} milestones approved
          </p>
          {isClient && project.status === "ACTIVE" && (
            <button onClick={completeProject} className="mt-4 w-full bg-forest text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone">
              Mark project complete
            </button>
          )}
        </div>

        {isClient && project.status === "ACTIVE" && (
          <form onSubmit={createMilestone} className="border border-stone/30 rounded p-4 mt-4 bg-white space-y-3">
            <h3 className="font-semibold text-forest">Add milestone</h3>
            {error && <p className="bg-red-100 text-red-700 p-2 rounded text-sm break-words">{error}</p>}
            <input className="w-full border border-stone/40 p-2 rounded bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
              placeholder="Milestone title" value={milestoneForm.title}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })} required />
            <textarea className="w-full border border-stone/40 p-2 rounded bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
              rows="2" placeholder="What should be delivered?" value={milestoneForm.description}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })} required />
            <div className="flex gap-2 flex-wrap">
              <input className="border border-stone/40 p-2 rounded w-32 bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
                type="number" placeholder="Amount ₦" value={milestoneForm.amount}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, amount: e.target.value })} required />
              <input className="border border-stone/40 p-2 rounded flex-1 min-w-36 bg-white text-forest focus:outline-none focus:ring-2 focus:ring-forest/40"
                type="date" value={milestoneForm.dueDate}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })} required />
            </div>
            <button className="w-full bg-forest text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone">
              Create milestone
            </button>
          </form>
        )}
      </div>

      <div className="md:col-span-2 space-y-3 min-w-0">
        <h2 className="font-semibold text-forest">Milestones</h2>
        
        {milestones.map((m) => (
          <div key={m.id} className="border border-stone/30 rounded p-4 bg-white">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <p className="font-medium text-forest break-words">{m.title}</p>
                <p className="text-xs text-stone">
                  Due {new Date(m.dueDate).toLocaleDateString()} · Attempt {m.submissionAttempts}/3
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-green-700 font-medium">₦{m.amount?.toLocaleString()}</p>
                <span className={`text-xs px-2 py-1 rounded ${
                  m.status === "APPROVED" ? "bg-green-100 text-green-700"
                  : m.status === "SUBMITTED" ? "bg-yellow-100 text-yellow-700"
                  : m.status === "REJECTED" ? "bg-red-100 text-red-700"
                  : "bg-mist/40 text-forest"
                }`}>{m.status.replace(/_/g, " ")}</span>
              </div>
            </div>
            <p className="text-sm text-stone mt-2 break-words">{m.description}</p>

            {m.submission && (
              <div className="mt-3 bg-slate-50 rounded p-3 text-sm">
                <p className="font-medium text-xs text-stone mb-1">LATEST SUBMISSION</p>
                <p className="whitespace-pre-wrap break-words">{m.submission}</p>
                {m.attachments?.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {m.attachments.map((a) => (
                      <a key={a} href={a} target="_blank" rel="noreferrer"
                        className="text-xs bg-mist/40 text-forest px-2 py-1 rounded hover:underline break-all">
                        Attachment ↗
                      </a>
                    ))}
                  </div>
                )}
                {m.rejectionReason && (
                  <p className="mt-2 text-red-600 text-xs break-words">Rejected: {m.rejectionReason}</p>
                )}
              </div>
            )}

            <div className="mt-3">
              {isFreelancer && ["IN_PROGRESS", "REJECTED"].includes(m.status) && project.status === "ACTIVE" && (
                submitFor === m.id ? (
                  <div className="space-y-2">
                    <textarea className="w-full border border-stone/40 p-2 rounded bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
                      rows="3" placeholder="Describe the work delivered (min 10 chars)..."
                      value={submission} onChange={(e) => setSubmission(e.target.value)} />
                    <label className="flex items-center gap-2 text-sm text-forest cursor-pointer border border-stone/40 rounded-lg px-3 py-2 hover:bg-mist/30 w-fit">
                      <Paperclip size={14} />
                      {uploading ? "Uploading..." : "Attach files (images / PDF)"}
                      <input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf"
                        className="hidden" onChange={uploadSubmissionFile} disabled={uploading} />
                    </label>
                    {submissionFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {submissionFiles.map((f) => (
                          <span key={f.url} className="flex items-center gap-1 bg-mist/40 text-forest text-xs px-2 py-1 rounded">
                            {f.name}
                            <button type="button" onClick={() => setSubmissionFiles((x) => x.filter((y) => y.url !== f.url))} className="text-red-600">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <input className="w-full border border-stone/40 p-2 rounded bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
                      placeholder="Or paste links (Drive, video, prototype), comma-separated"
                      value={submissionLinks} onChange={(e) => setSubmissionLinks(e.target.value)} />
                    <div className="flex gap-2">
                      <button onClick={() => submitMilestone(m.id)} disabled={uploading}
                        className="bg-forest text-white px-3 py-1 rounded text-sm hover:bg-stone disabled:opacity-50">
                        Send submission
                      </button>
                      <button onClick={() => setSubmitFor(null)} className="text-sm text-stone">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setSubmitFor(m.id); setRejectFor(null); }}
                    className="bg-forest text-white px-3 py-1 rounded text-sm hover:bg-stone">
                    Submit work
                  </button>
                )
              )}

              {isClient && m.status === "SUBMITTED" && (
                <div className="space-y-2">
                  {rejectFor === m.id ? (
                    <>
                      <textarea className="w-full border border-stone/40 p-2 rounded bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
                        rows="2" placeholder="Reason for rejection (freelancer will see this)..."
                        value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                      <div className="flex gap-2">
                        <button onClick={() => rejectMilestone(m.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-500">
                          Confirm rejection
                        </button>
                        <button onClick={() => setRejectFor(null)} className="text-sm text-stone">Cancel</button>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => approveMilestone(m.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-500">
                        Approve & pay ₦{m.amount?.toLocaleString()}
                      </button>
                      <button onClick={() => { setRejectFor(m.id); setSubmitFor(null); }}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {milestones.length === 0 && (
          <p className="text-stone text-sm py-6 text-center">
            {isClient ? "No milestones yet — add the first one using the form." : "Waiting for the client to add milestones."}
          </p>
        )}
      </div>
    </div>
  );
}