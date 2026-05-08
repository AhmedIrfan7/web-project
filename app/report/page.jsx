"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Loader2, MapPin, Send, AlertCircle } from "lucide-react";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

const CATEGORIES = ["Road", "Water", "Electricity", "Garbage", "Park", "Other"];

export default function ReportPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ title: "", description: "", category: "" });
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    else if (form.title.trim().length < 5) e.title = "Title must be at least 5 characters";
    else if (form.title.trim().length > 100) e.title = "Title must be under 100 characters";
    if (!form.description.trim()) e.description = "Description is required";
    else if (form.description.trim().length < 10) e.description = "Description must be at least 10 characters";
    else if (form.description.trim().length > 1000) e.description = "Description must be under 1000 characters";
    if (!form.category) e.category = "Please select a category";
    if (!location) e.location = "Please pin the issue location on the map";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the errors below");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          location,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit issue");
      toast.success("Issue reported successfully!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const charCount = form.description.length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Report a Civic Issue</h1>
        <p className="text-slate-500 text-sm mt-1">
          Describe the problem and pin its exact location on the map.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Issue Details</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Large pothole on Main Street near petrol station"
              maxLength={100}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm input-focus ${errors.title ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: cat }))}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    form.category === cat
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Description <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs ${charCount > 900 ? "text-red-500" : "text-slate-400"}`}>
                {charCount}/1000
              </span>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the issue in detail. When did you notice it? How severe is it?"
              maxLength={1000}
              rows={4}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm input-focus resize-none ${errors.description ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-blue-600" />
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Issue Location</h2>
            <span className="text-red-500 text-sm">*</span>
          </div>

          {location ? (
            <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg mb-3 text-sm">
              <MapPin size={14} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-700 font-medium">Location pinned</p>
                <p className="text-emerald-600 text-xs mt-0.5 line-clamp-2">{location.address}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3 text-sm text-amber-700">
              <AlertCircle size={14} className="shrink-0" />
              Click on the map below to pin the issue location
            </div>
          )}

          <MapPicker onLocationSelect={setLocation} />
          {errors.location && <p className="text-red-500 text-xs mt-2">{errors.location}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full py-3 text-base font-semibold"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Submitting..." : (
            <>
              <Send size={18} /> Submit Issue Report
            </>
          )}
        </button>
      </form>
    </div>
  );
}
