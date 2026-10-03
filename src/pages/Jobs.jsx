import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Jobs() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "WEB_DEVELOPMENT",
    budgetMin: "", budgetMax: "", skillsRequired: "",
  });

  const load = async (s = search, c = category) => {
    const { data } = await api.get("/jobs", { params: { search: s, category: c } });
    setJobs(data.data.jobs);
  };

  useEffect(() => {
    const s = searchParams.get("search") || "";
    const c = searchParams.get("category") || "";
    setSearch(s);
    setCategory(c);
    load(s, c);
  }, [searchParams]);

  const onSearch = (value) => {
    setSearch(value);
    setSearchParams(value ? { search: value } : {});
  };

  const onCategory = (value) => {
    setCategory(value);
    setSearchParams(value ? { category: value } : {});
  };

  const createJob = async (e) => {
    e.preventDefault();
    await api.post("/jobs", {
      ...form,
      budgetMin: Number(form.budgetMin),
      budgetMax: Number(form.budgetMax),
      skillsRequired: form.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setShowForm(false);
    load();
  };

  return (
    <div>
      <div className="flex items-center gap-3 my-4">
        <input className="border p-2 rounded flex-1" placeholder="Search jobs..."
          value={search} onChange={(e) => onSearch(e.target.value)} />
        <select className="border p-2 rounded" value={category} onChange={(e) => onCategory(e.target.value)}>
          <option value="">All categories</option>
          {["WEB_DEVELOPMENT", "MOBILE_DEVELOPMENT", "DESIGN", "WRITING", "MARKETING", "DATA", "OTHER"].map((c) => (
            <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
          ))}
        </select>
        {user?.role === "CLIENT" && (
          <button onClick={() => setShowForm(!showForm)} className="tebg-forest text-white px-4 py-2 rounded">
            {showForm ? "Cancel" : "+ Post a job"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={createJob} className="border rounded p-4 mb-6 space-y-3 bg-white">
          <input className="w-full border p-2 rounded" placeholder="Job title"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="w-full border p-2 rounded" rows="4" placeholder="Describe the work..."
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="flex gap-3">
            <input className="border p-2 rounded w-32" type="number" placeholder="Budget min"
              value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} required />
            <input className="border p-2 rounded w-32" type="number" placeholder="Budget max"
              value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} required />
            <input className="border p-2 rounded flex-1" placeholder="Skills (comma-separated)"
              value={form.skillsRequired} onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })} />
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded">Publish job</button>
        </form>
      )}

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Link to={`/jobs/${job.id}`} key={job.id} className="border rounded p-4 bg-white hover:shadow">
            <div className="flex justify-between">
              <h3 className="font-semibold text-lg">{job.title}</h3>
              <span className="text-green-700 font-medium">
                ₦{job.budgetMin?.toLocaleString()} – ₦{job.budgetMax?.toLocaleString()}
              </span>
            </div>
            <p className="text-stone text-sm line-clamp-2 mt-1">{job.description}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="bg-mist/30 text-xs px-2 py-1 rounded">{job.category.replace(/_/g, " ")}</span>
              {job.skillsRequired.map((s) => (
                <span key={s} className="bg-mist/40 text-forest text-xs px-2 py-1 rounded">{s}</span>
              ))}
              <span className="text-xs text-stone ml-auto">{job.proposalCount ?? 0} proposals</span>
            </div>
          </Link>
        ))}
        {jobs.length === 0 && <p className="text-stone text-center py-10">No jobs found.</p>}
      </div>
    </div>
  );
}