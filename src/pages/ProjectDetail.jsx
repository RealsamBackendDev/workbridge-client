import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  const [rejectFor, setRejectFor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");

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

  const submitMilestone = async (milestoneId) => {
    setError("");
    try {
      await api.post(`/milestones/${milestoneId}/submit`, { submission });
      setSubmitFor(null);
      setSubmission("");
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

  if (!project) return <p className="p-10 text-center text-gray-500">Loading...</p>;

  const isClient = user?.id === project.clientId;
  const isFreelancer = user?.id === project.freelancerId;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="border rounded p-5 bg-white">
          <h1 className="text-xl font-bold">{project.title}</h1>
          <p className="text-green-700 font-medium mt-1">₦{project.budget?.toLocaleString()}</p>
          <span className={`text-xs px-2 py-1 rounded inline-block mt-2 ${
            project.status === "ACTIVE" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
          }`}>
            {project.status}
          </span>
          <p className="text-sm text-gray-600 mt-4 whitespace-pre-wrap">{project.description}</p>
          <p className="text-sm text-gray-500 mt-4">
            {project.approvedMilestones}/{project.milestones?.length ?? milestones.length} milestones approved
          </p>
          {isClient && project.status === "ACTIVE" && (
            <button onClick={completeProject} className="mt-4 w-full bg-slate-800 text-white px-4 py-2 rounded text-sm">
              Mark project complete
            </button>
          )}
        </div>

        {isClient && project.status === "ACTIVE" && (
          <form onSubmit={createMilestone} className="border rounded p-4 mt-4 bg-white space-y-3">
            <h3 className="font-semibold">Add milestone</h3>
            {error && <p className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</p>}
            <input className="w-full border p-2 rounded" placeholder="Milestone title"
              value={milestoneForm.title} onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })} required />
            <textarea className="w-full border p-2 rounded" rows="2" placeholder="What should be delivered?"
              value={milestoneForm.description} onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })} required />
            <div className="flex gap-2">
              <input className="border p-2 rounded w-32" type="number" placeholder="Amount ₦"
                value={milestoneForm.amount} onChange={(e) => setMilestoneForm({ ...milestoneForm, amount: e.target.value })} required />
              <input className="border p-2 rounded flex-1" type="date"
                value={milestoneForm.dueDate} onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })} required />
            </div>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm">Create milestone</button>
          </form>
        )}
      </div>

      <div className="md:col-span-2 space-y-3">
        <h2 className="font-semibold">Milestones</h2>
        {milestones.map((m) => (
          <div key={m.id} className="border rounded p-4 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{m.title}</p>
                <p className="text-xs text-gray-500">
                  Due {new Date(m.dueDate).toLocaleDateString()} · Attempt {m.submissionAttempts}/3
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-700 font-medium">₦{m.amount?.toLocaleString()}</p>
                <span className={`text-xs px-2 py-1 rounded ${
                  m.status === "APPROVED" ? "bg-green-100 text-green-700"
                  : m.status === "SUBMITTED" ? "bg-yellow-100 text-yellow-700"
                  : m.status === "REJECTED" ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-600"
                }`}>{m.status}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{m.description}</p>

            {m.submission && (
              <div className="mt-3 bg-slate-50 rounded p-3 text-sm">
                <p className="font-medium text-xs text-gray-500 mb-1">LATEST SUBMISSION</p>
                <p className="whitespace-pre-wrap">{m.submission}</p>
                {m.rejectionReason && (
                  <p className="mt-2 text-red-600 text-xs">Rejected: {m.rejectionReason}</p>
                )}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              {isFreelancer && ["IN_PROGRESS", "REJECTED"].includes(m.status) && project.status === "ACTIVE" && (
                submitFor === m.id ? (
                  <div className="w-full space-y-2">
                    <textarea className="w-full border p-2 rounded" rows="3" placeholder="Describe the work delivered..."
                      value={submission} onChange={(e) => setSubmission(e.target.value)} />
                    <div className="flex gap-2">
                      <button onClick={() => submitMilestone(m.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Send submission</button>
                      <button onClick={() => setSubmitFor(null)} className="text-sm text-gray-500">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setSubmitFor(m.id); setRejectFor(null); }} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                    Submit work
                  </button>
                )
              )}

              {isClient && m.status === "SUBMITTED" && (
                <div className="w-full space-y-2">
                  {rejectFor === m.id ? (
                    <>
                      <textarea className="w-full border p-2 rounded" rows="2" placeholder="Reason for rejection..."
                        value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                      <div className="flex gap-2">
                        <button onClick={() => rejectMilestone(m.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Confirm rejection</button>
                        <button onClick={() => setRejectFor(null)} className="text-sm text-gray-500">Cancel</button>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => approveMilestone(m.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                        Approve & pay ₦{m.amount?.toLocaleString()}
                      </button>
                      <button onClick={() => { setRejectFor(m.id); setSubmitFor(null); }} className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm">
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
          <p className="text-gray-500 text-sm py-6 text-center">
            {isClient ? "No milestones yet — add the first one." : "Waiting for the client to add milestones."}
          </p>
        )}
      </div>
    </div>
  );
}