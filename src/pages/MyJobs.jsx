import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    api.get("/jobs/my").then(({ data }) => setJobs(data.data.jobs));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold my-4">My Posted Jobs</h1>
      <div className="space-y-3">
        {jobs.map((job) => (
          <Link to={`/jobs/${job.id}`} key={job.id} className="border rounded p-4 bg-white block hover:shadow">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{job.title}</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                job.status === "OPEN" ? "bg-yellow-100 text-yellow-700"
                : job.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600"
              }`}>{job.status}</span>
            </div>
            <p className="text-sm text-stone mt-1">
              ₦{job.budgetMin?.toLocaleString()} – ₦{job.budgetMax?.toLocaleString()} · {job.proposalCount ?? 0} proposals
            </p>
            {job.status === "IN_PROGRESS" && (
              <p className="text-xs text-forest mt-2">Hired — view milestones under Projects</p>
            )}
          </Link>
        ))}
        {jobs.length === 0 && <p className="text-gray-500 text-center py-10">You haven't posted any jobs yet.</p>}
      </div>
    </div>
  );
}