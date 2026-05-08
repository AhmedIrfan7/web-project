"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Tag, User, MessageSquare, Loader2, Trash2, AlertCircle } from "lucide-react";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const STATUS_CLASS = {
  Pending: "badge-pending",
  "In Progress": "badge-in-progress",
  Resolved: "badge-resolved",
};

const STATUSES = ["Pending", "In Progress", "Resolved"];

function formatDate(d) {
  return new Date(d).toLocaleString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function IssueDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [noteError, setNoteError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/issues/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.issue) {
          setIssue(data.issue);
          setAdminNote(data.issue.adminNote || "");
          setSelectedStatus(data.issue.status);
        }
      })
      .catch(() => toast.error("Failed to load issue"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(ev) {
    ev.preventDefault();
    if (adminNote.length > 500) { setNoteError("Admin note must be under 500 characters"); return; }
    setNoteError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus, adminNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      setIssue(data.issue);
      toast.success("Issue updated successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this issue? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/issues/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Delete failed");
      }
      toast.success("Issue deleted");
      router.push(user?.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={36} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Issue not found</h2>
        <p className="text-slate-500 mb-6">This issue may have been deleted or does not exist.</p>
        <Link href="/dashboard" className="btn btn-primary text-sm">Back to Dashboard</Link>
      </div>
    );
  }

  const isOwner = issue.userId === user?._id || issue.userId?.toString() === user?._id?.toString();
  const canDelete = isOwner || user?.role === "admin";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href={user?.role === "admin" ? "/admin" : "/dashboard"}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CLASS[issue.status] || "badge-pending"}`}>
              {issue.status}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {issue.category}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">{issue.title}</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-500">
            {issue.userName && (
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <span>{issue.userName}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              <span>{formatDate(issue.createdAt)}</span>
            </div>
            {issue.location?.address && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-600">{issue.location.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Description</h2>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{issue.description}</p>
        </div>

        {issue.adminNote && (
          <div className="p-6 border-b border-slate-100 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={15} className="text-blue-600" />
              <h2 className="text-sm font-semibold text-blue-700">Admin Note</h2>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">{issue.adminNote}</p>
          </div>
        )}

        {issue.location?.lat && issue.location?.lng && (
          <div className="p-6">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Location</h2>
            <MapView issues={[issue]} height="280px" />
          </div>
        )}
      </div>

      {user?.role === "admin" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-slate-700 mb-4">Admin Controls</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedStatus(s)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      selectedStatus === s
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Admin Note</label>
                <span className={`text-xs ${adminNote.length > 450 ? "text-red-500" : "text-slate-400"}`}>
                  {adminNote.length}/500
                </span>
              </div>
              <textarea
                value={adminNote}
                onChange={(e) => { setAdminNote(e.target.value); setNoteError(""); }}
                placeholder="Add a note for the citizen about this issue..."
                maxLength={500}
                rows={3}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm input-focus resize-none ${noteError ? "border-red-400 bg-red-50" : "border-slate-300"}`}
              />
              {noteError && <p className="text-red-500 text-xs mt-1">{noteError}</p>}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary text-sm"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {canDelete && (
        <div className="bg-white border border-red-100 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-700 mb-1">Danger Zone</h3>
          <p className="text-sm text-slate-500 mb-4">Deleting this issue is permanent and cannot be undone.</p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn btn-danger text-sm"
          >
            {deleting && <Loader2 size={15} className="animate-spin" />}
            <Trash2 size={15} />
            {deleting ? "Deleting..." : "Delete Issue"}
          </button>
        </div>
      )}
    </div>
  );
}
