"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { Loader2, MapPin, RefreshCw } from "lucide-react";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function AdminMapPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchIssues(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/issues/map");
      if (!res.ok) throw new Error("Failed to fetch issues");
      const data = await res.json();
      setIssues(data.issues || []);
    } catch {
      toast.error("Could not load map data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchIssues(); }, []);

  const withLocation = issues.filter((i) => i.location?.lat != null && i.location?.lng != null);

  const counts = {
    Pending: issues.filter((i) => i.status === "Pending").length,
    "In Progress": issues.filter((i) => i.status === "In Progress").length,
    Resolved: issues.filter((i) => i.status === "Resolved").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Live Issue Map</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {withLocation.length} of {issues.length} issues with location data
          </p>
        </div>
        <button
          onClick={() => fetchIssues(true)}
          disabled={refreshing}
          className="btn btn-ghost text-sm self-start sm:self-auto"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.entries(counts).map(([label, count]) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{count}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ height: 500 }}>
          <Loader2 size={36} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <MapView issues={withLocation} height="580px" />
      )}

      {!loading && withLocation.length === 0 && (
        <div className="mt-6 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
          <MapPin size={15} className="text-slate-400" />
          No geolocated issues to display yet.
        </div>
      )}
    </div>
  );
}
