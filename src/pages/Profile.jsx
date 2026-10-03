import { useEffect, useState } from "react";
import { Camera, ShieldCheck, ShieldAlert, Clock, Pencil } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full border border-stone/40 rounded-lg p-2.5 bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState({
    name: "", bio: "", location: "", skills: "", hourlyRate: "", avatar: "",
  });
  const [kyc, setKyc] = useState({ documentType: "NIN", documentNumber: "", documentImage: "" });
  const [kycMessage, setKycMessage] = useState("");
  const [kycError, setKycError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await api.get("/users/me");
    setProfile(data.data.user);
    setEdit({
      name: data.data.user.name || "",
      bio: data.data.user.bio || "",
      location: data.data.user.location || "",
      skills: (data.data.user.skills || []).join(", "),
      hourlyRate: data.data.user.hourlyRate ?? "",
      avatar: data.data.user.avatar || "",
    });
  };

  useEffect(() => { load(); }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage("");
    try {
      const { data } = await api.patch("/users/me", {
        name: edit.name,
        bio: edit.bio,
        location: edit.location,
        skills: edit.skills.split(",").map((s) => s.trim()).filter(Boolean),
        hourlyRate: edit.hourlyRate === "" ? undefined : Number(edit.hourlyRate),
        avatar: edit.avatar,
      });
      setProfile(data.data.user);
      setUser(data.data.user);
      setSaveMessage("Profile saved successfully.");
    } catch (err) {
      setSaveMessage(err.response?.data?.message || "Save failed — check the backend console");
    }
    setSaving(false);
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("purpose", "avatar");
    try {
      const { data } = await api.post("/upload", fd);
      setEdit((ed) => ({ ...ed, avatar: data.data.url }));
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    }
    setUploading(false);
    e.target.value = "";
  };

  const uploadKycDoc = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setKycError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("purpose", "kyc");
    try {
      const { data } = await api.post("/upload", fd);
      setKyc((k) => ({ ...k, documentImage: data.data.url }));
      setKycMessage("Document uploaded.");
    } catch (err) {
      setKycError(err.response?.data?.message || "Upload failed");
    }
    setUploading(false);
    e.target.value = "";
  };

  const submitKyc = async (e) => {
    e.preventDefault();
    setKycError("");
    setKycMessage("");
    try {
      const { data } = await api.post("/auth/submit-kyc", {
        documentType: kyc.documentType,
        documentNumber: kyc.documentNumber,
        documentImage: kyc.documentImage || undefined,
      });
      setKycMessage("KYC submitted. It will be reviewed within 24 hours.");
      setProfile(data.data.user);
    } catch (err) {
      setKycError(err.response?.data?.message || "KYC submission failed");
    }
  };

  if (!profile) return <p className="p-10 text-center text-stone">Loading...</p>;

  const kycBadge = {
    NOT_SUBMITTED: <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">Not submitted</span>,
    PENDING: <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded"><Clock size={12} /> Under review</span>,
    VERIFIED: <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded"><ShieldCheck size={12} /> Verified</span>,
    REJECTED: <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded"><ShieldAlert size={12} /> Rejected — resubmit</span>,
  }[profile.kycStatus];

  const showKycForm = profile.kycStatus === "NOT_SUBMITTED" || profile.kycStatus === "REJECTED";

  return (
    <div className="grid md:grid-cols-2 gap-6 my-4">
      <div className="border border-stone/30 rounded-2xl p-6 bg-white space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {edit.avatar ? (
              <img src={edit.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover border border-stone/30" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-mist/50 flex items-center justify-center text-2xl font-bold text-forest">
                {profile.name?.[0]?.toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 bg-forest text-white rounded-full p-1.5 cursor-pointer">
              <Camera size={12} />
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadAvatar} disabled={uploading} />
            </label>
          </div>
          <div>
            <p className="font-bold text-lg text-forest">{profile.name}</p>
            <p className="text-sm text-stone">{profile.role} · {profile.email}</p>
            <p className="text-xs text-stone">{profile.phone}</p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-3 border-t border-stone/20 pt-4">
          <p className="font-semibold text-sm text-forest flex items-center gap-2"><Pencil size={14} /> Edit profile</p>
          {saveMessage && (
            <p className={`p-2 rounded text-sm ${saveMessage.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {saveMessage}
            </p>
          )}
          <input className={inputClass} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Full name" />
          <textarea className={inputClass} rows="3" value={edit.bio} onChange={(e) => setEdit({ ...edit, bio: e.target.value })} placeholder="Short bio" />
          <div className="flex gap-3 flex-wrap">
            <input className={`${inputClass} flex-1 min-w-32`} value={edit.location} onChange={(e) => setEdit({ ...edit, location: e.target.value })} placeholder="Location" />
            <input className={`${inputClass} w-32`} type="number" value={edit.hourlyRate} onChange={(e) => setEdit({ ...edit, hourlyRate: e.target.value })} placeholder="Hourly rate $" />
          </div>
          <input className={inputClass} value={edit.skills} onChange={(e) => setEdit({ ...edit, skills: e.target.value })} placeholder="Skills (comma-separated)" />
          <button disabled={saving} className="bg-forest text-white px-4 py-2 rounded-lg text-sm hover:bg-stone disabled:opacity-50">
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </div>

      <div className="border border-stone/30 rounded-2xl p-6 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-forest">Identity verification (KYC)</p>
          {kycBadge}
        </div>

        {profile.kycStatus === "VERIFIED" && (
          <p className="text-sm text-stone">
            Verified with <b className="text-forest">{profile.kycDocumentType}</b>. You can now be hired on any job.
          </p>
        )}

        {profile.kycStatus === "PENDING" && (
          <p className="text-sm text-stone">
            Your {profile.kycDocumentType} submission is being reviewed. You'll be able to receive hires once approved.
          </p>
        )}

        {profile.kycStatus === "REJECTED" && profile.kycRejectionReason && (
          <p className="text-sm text-red-600 bg-red-50 rounded p-3">
            Rejection reason: {profile.kycRejectionReason}
          </p>
        )}

        {showKycForm && profile.role === "FREELANCER" && (
          <form onSubmit={submitKyc} className="space-y-3 border-t border-stone/20 pt-4">
            <p className="text-xs text-stone">
              Clients can only hire verified freelancers. Submit a government ID to get verified.
            </p>
            {kycError && <p className="bg-red-100 text-red-700 p-2 rounded text-sm">{kycError}</p>}
            {kycMessage && <p className="bg-green-100 text-green-700 p-2 rounded text-sm">{kycMessage}</p>}
            <select className={inputClass} value={kyc.documentType} onChange={(e) => setKyc({ ...kyc, documentType: e.target.value })}>
              <option value="NIN">National ID (NIN)</option>
              <option value="PASSPORT">International Passport</option>
            </select>
            <input className={inputClass} value={kyc.documentNumber} onChange={(e) => setKyc({ ...kyc, documentNumber: e.target.value })}
              placeholder="Document number" required />
            <label className="flex items-center gap-2 text-sm text-forest cursor-pointer border border-stone/40 rounded-lg px-3 py-2 hover:bg-mist/30 w-fit">
              <Camera size={14} />
              {uploading ? "Uploading..." : kyc.documentImage ? "Document attached ✓ (click to replace)" : "Attach document image (optional)"}
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={uploadKycDoc} disabled={uploading} />
            </label>
            <button className="bg-forest text-white px-4 py-2 rounded-lg text-sm hover:bg-stone">Submit for review</button>
          </form>
        )}

        {showKycForm && profile.role !== "FREELANCER" && (
          <p className="text-sm text-stone border-t border-stone/20 pt-4">
            KYC verification is only required for freelancers.
          </p>
        )}
      </div>
    </div>
  );
}