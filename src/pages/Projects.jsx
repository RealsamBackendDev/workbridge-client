import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get("/projects/my").then(({ data }) => setProjects(data.data.projects));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold my-4">My Projects</h1>
      <div className="space-y-3">
        {projects.map((p) => (
          <Link to={`/projects/${p.id}`} key={p.id} className="border rounded p-4 bg-white block hover:shadow">
            <div className="flex justify-between">
              <h3 className="font-semibold">{p.title}</h3>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  p.status === "ACTIVE" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {p.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {user?.role === "CLIENT" ? "Freelancer" : "Client"}: {user?.role === "CLIENT" ? p.freelancerId : p.clientId}
            </p>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-green-700 font-medium">₦{p.budget?.toLocaleString()}</span>
              <span className="text-gray-500">
                {p.approvedMilestones ?? 0}/{p.milestoneCount ?? 0} milestones approved
              </span>
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <p className="text-gray-500 text-center py-10">
            No projects yet. {user?.role === "CLIENT" ? "Accept a proposal on one of your jobs to start one." : "Win a proposal to start one."}
          </p>
        )}
      </div>
    </div>
  );
}