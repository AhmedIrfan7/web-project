"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Loader2, Search, ChevronLeft, ChevronRight, UserCheck, UserX, ShieldCheck, AlertCircle } from "lucide-react";

function Badge({ active }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function RoleBadge({ role }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${role === "admin" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>
      {role}
    </span>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [updating, setUpdating] = useState({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setUsers(data.users || []);
      setPagination(data.pagination || null);
    } catch {
      toast.error("Could not load users");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function patchUser(id, updates) {
    setUpdating((u) => ({ ...u, [id]: true }));
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, ...data.user } : u)));
      toast.success("User updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating((u) => ({ ...u, [id]: false }));
    }
  }

  function handleSearchSubmit(ev) {
    ev.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Activate, deactivate, or change roles for registered users
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={30} className="animate-spin text-blue-600" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <AlertCircle size={40} className="text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-600">No users found</h3>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="table-responsive">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Role</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Joined</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                      <td className="px-4 py-3"><Badge active={u.isActive} /></td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {updating[u._id] ? (
                            <Loader2 size={15} className="animate-spin text-blue-600" />
                          ) : (
                            <>
                              <button
                                onClick={() => patchUser(u._id, { isActive: !u.isActive })}
                                title={u.isActive ? "Deactivate" : "Activate"}
                                className={`p-1.5 rounded-lg transition-colors ${u.isActive ? "text-red-500 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                              >
                                {u.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                              </button>
                              <button
                                onClick={() => patchUser(u._id, { role: u.role === "admin" ? "user" : "admin" })}
                                title={u.role === "admin" ? "Remove admin" : "Make admin"}
                                className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                              >
                                <ShieldCheck size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-slate-500">
                {pagination.total} users total - Page {pagination.page} of {pagination.totalPages}
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
