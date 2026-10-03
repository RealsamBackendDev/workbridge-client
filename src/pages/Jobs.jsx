import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["WEB_DEVELOPMENT", "MOBILE_DEVELOPMENT", "DESIGN", "WRITING", "MARKETING", "DATA", "OTHER"];

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
  const [formError, setFormError] = useState("");

  const load = async (s = search, c = category) => {
    const { data } = await api.get("/jobs", { params: { search: s, category: c, status: "OPEN" } });
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
    setFormError("");
    try {
      await api.post("/jobs", {
        title: form.title,
        description: form.description,
        category: form.category,
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        skillsRequired: form.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setShowForm(false);
      setForm({ title: "", description: "", category: "WEB_DEVELOPMENT", budgetMin: "", budgetMax: "", skillsRequired: "" });
      window.location.href = "/jobs/my";
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to post job");
    }
  };

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex items-center gap-3 my-4 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search size={16} className="absolute left-3 top-3.5 text-stone" />
          <input
            className="w-full border border-stone/40 rounded-lg pl-9 pr-3 py-2.5 bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
            placeholder="Search jobs..." value={search} onChange={(e) => onSearch(e.target.value)} />
        </div>
        <select className="border border-stone/40 p-2.5 rounded-lg bg-white text-forest" value={category} onChange={(e) => onCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
          ))}
        </select>
        <button type="submit" className="bg-forest text-white px-5 py-2.5 rounded-lg hover:bg-stone flex items-center gap-2">
          <Search size={16} /> Search
        </button>
        {user?.role === "CLIENT" && (
          <>
            <Link to="/jobs/my" className="border border-forest text-forest px-4 py-2.5 rounded-lg hover:bg-mist/40 text-sm whitespace-nowrap">
              My Jobs
            </Link>
            <button type="button" onClick={() => setShowForm(!showForm)} className="bg-forest text-white px-4 py-2.5 rounded-lg hover:bg-stone whitespace-nowrap">
              {showForm ? "Cancel" : "+ Post a job"}
            </button>
          </>
        )}
      </form>

      {showForm && (
        <form onSubmit={createJob} className="border border-stone/30 rounded p-4 mb-6 space-y-3 bg-white">
          {formError && <p className="bg-red-100 text-red-700 p-2 rounded text-sm">{formError}</p>}
          <input className="w-full border border-stone/40 p-2 rounded bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
            placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="w-full border border-stone/40 p-2 rounded bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
            rows="4" placeholder="Describe the work..." value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="flex gap-3 flex-wrap">
            <select className="border border-stone/40 p-2 rounded bg-white text-forest" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
              ))}
            </select>
            <input className="border border-stone/40 p-2 rounded w-32 bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
              type="number" placeholder="Budget min" value={form.budgetMin}
              onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} required />
            <input className="border border-stone/40 p-2 rounded w-32 bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
              type="number" placeholder="Budget max" value={form.budgetMax}
              onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} required />
            <input className="border border-stone/40 p-2 rounded flex-1 min-w-40 bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
              placeholder="Skills (comma-separated)" value={form.skillsRequired}
              onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })} />
          </div>
          <button className="bg-forest text-white px-4 py-2 rounded hover:bg-stone">Publish job</button>
        </form>
      )}

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Link to={`/jobs/${job.id}`} key={job.id} className="border border-stone/30 rounded p-4 bg-white hover:shadow">
            <div className="flex justify-between gap-4 flex-wrap">
              <h3 className="font-semibold text-lg text-forest break-words">{job.title}</h3>
              <span className="text-green-700 font-medium whitespace-nowrap">
                ₦{job.budgetMin?.toLocaleString()} – ₦{job.budgetMax?.toLocaleString()}
              </span>
            </div>
            <p className="text-stone text-sm line-clamp-2 mt-1 break-words">{job.description}</p>
            <div className="flex gap-2 mt-3 flex-wrap items-center">
              <span className="bg-mist/40 text-forest text-xs px-2 py-1 rounded">{job.category.replace(/_/g, " ")}</span>
              {job.skillsRequired.map((s) => (
                <span key={s} className="bg-cream/70 text-forest text-xs px-2 py-1 rounded break-words">{s}</span>
              ))}
              <span className="text-xs text-stone ml-auto">{job.proposalCount ?? 0} proposals</span>
            </div>
          </Link>
        ))}
        {jobs.length === 0 && <p className="text-stone text-center py-10">No open jobs right now. Check back soon.</p>}
      </div>
    </div>
  );
}