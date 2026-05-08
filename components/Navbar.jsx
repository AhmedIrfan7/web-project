"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MapPin, Menu, X, LogOut, LayoutDashboard, FileText, Map, Users, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  const navLink = (href, label) => (
    <Link
      href={href}
      onClick={() => setMenuOpen(false)}
      className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
        isActive(href)
          ? "bg-blue-100 text-blue-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-blue-600 text-xl shrink-0">
            <MapPin size={22} className="text-blue-600" />
            UrbanFix
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLink("/", "Home")}
            {user && navLink("/dashboard", "Dashboard")}
            {user && navLink("/report", "Report Issue")}
            {user?.role === "admin" && navLink("/admin", "Admin")}
            {user?.role === "admin" && navLink("/admin/map", "Live Map")}
            {user?.role === "admin" && navLink("/admin/users", "Users")}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown size={14} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="text-xs font-semibold text-blue-600 capitalize">{user.role}</span>
                    </div>
                    <button
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost text-sm">Sign in</Link>
                <Link href="/signup" className="btn btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {navLink("/", "Home")}
          {user && navLink("/dashboard", "Dashboard")}
          {user && navLink("/report", "Report Issue")}
          {user?.role === "admin" && navLink("/admin", "Admin Panel")}
          {user?.role === "admin" && navLink("/admin/map", "Live Map")}
          {user?.role === "admin" && navLink("/admin/users", "Manage Users")}
          {user ? (
            <div className="pt-2 border-t border-slate-100 mt-2">
              <div className="flex items-center gap-3 px-3 py-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => { setMenuOpen(false); logout(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2 border-t border-slate-100 mt-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="btn btn-ghost flex-1 text-sm">Sign in</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="btn btn-primary flex-1 text-sm">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
