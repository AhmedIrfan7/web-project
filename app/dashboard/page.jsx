"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import IssueCard from "@/components/IssueCard";
import Link from "next/link";
import { Plus, Filter, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const STATUSES = ["All", "Pending", "In Progress", "Resolved"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (status !== "All") params.set("status", status);
      const res = await fetch(`/api/issues/my?${params}`);
      if (!res.ok) throw new Error("Failed to fetch issues");
      const data = await res.json();
      setIssues(data.issues || []);
      setPagination(data.pagination || null);
    } catch {
      toast.error("Could not load your issues");
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  function handleStatusChange(s) {
    setStatus(s);
    setPage(1);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Issues</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Welcome back, <span className="font-medium text-slate-700">{user?.name}</span>
          </p>
        </div>
        <Link href="/report" className="btn btn-primary text-sm self-start sm:self-auto">
          <Plus size={16} /> Report New Issue
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={15} className="text-slate-400" />
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              status === s
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={30} className="animate-spin text-blue-600" />
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-20">
          <AlertCircle size={40} className="text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-600 mb-1">No issues found</h3>
          <p className="text-slate-400 text-sm mb-6">
            {status !== "All" ? `No ${status} issues.` : "You have not reported any issues yet."}
          </p>
          <Link href="/report" className="btn btn-primary text-sm">
            <Plus size={15} /> Report Your First Issue
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {issues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn btn-ghost text-sm px-3 py-2"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.totalPages}
                  className="btn btn-ghost text-sm px-3 py-2"
                >
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
