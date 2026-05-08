"use client";
import { useState, useEffect, useCallback } from "react";
import IssueCard from "@/components/IssueCard";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Filter, Search, BarChart3, Clock, CheckCircle, Map, Users } from "lucide-react";

const STATUSES = ["All", "Pending", "In Progress", "Resolved"];
const CATEGORIES = ["All", "Road", "Water", "Electricity", "Garbage", "Park", "Other"];

function StatCard({ label, value, icon: Icon, color, accent }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 stat-card-accent ${accent}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-3xl font-extrabold text-slate-800">{value ?? "-"}</div>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.stats))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setStatsLoading(false));
  }, []);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (status !== "All") params.set("status", status);
      if (category !== "All") params.set("category", category);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/issues?${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setIssues(data.issues || []);
      setPagination(data.pagination || null);
    } catch {
      toast.error("Could not load issues");
    } finally {
      setLoading(false);
    }
  }, [status, category, search, page]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  function handleFilterChange(type, val) {
    if (type === "status") setStatus(val);
    if (type === "category") setCategory(val);
    setPage(1);
  }

  function handleSearchSubmit(ev) {
    ev.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and resolve all civic issues</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/map" className="btn btn-ghost text-sm">
            <Map size={15} /> Live Map
          </Link>
          <Link href="/admin/users" className="btn btn-ghost text-sm">
            <Users size={15} /> Users
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Issues" value={statsLoading ? "..." : stats?.totalIssues} icon={BarChart3} color="bg-blue-50 text-blue-600" accent="blue" />
        <StatCard label="Pending" value={statsLoading ? "..." : stats?.pendingIssues} icon={Clock} color="bg-amber-50 text-amber-600" accent="yellow" />
        <StatCard label="In Progress" value={statsLoading ? "..." : stats?.inProgressIssues} icon={AlertCircle} color="bg-indigo-50 text-indigo-600" accent="indigo" />
        <StatCard label="Resolved" value={statsLoading ? "..." : stats?.resolvedIssues} icon={CheckCircle} color="bg-emerald-50 text-emerald-600" accent="green" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title or address..."
              className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm input-focus bg-white"
            />
          </div>
          <button type="submit" className="btn btn-primary text-sm px-4">Search</button>
          {search && (
            <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} className="btn btn-ghost text-sm">
              Clear
            </button>
          )}
        </form>

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-500">Status:</span>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handleFilterChange("status", s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${status === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-500">Category:</span>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => handleFilterChange("category", c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${category === c ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={30} className="animate-spin text-blue-600" />
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-20">
          <AlertCircle size={40} className="text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-600 mb-1">No issues found</h3>
          <p className="text-slate-400 text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {issues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} showUser />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn btn-ghost text-sm px-3 py-2">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.totalPages} className="btn btn-ghost text-sm px-3 py-2">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
