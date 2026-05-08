"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { MapPin, Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address"); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      setSent(true);
      toast.success("Reset email sent!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={26} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Check your inbox</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                If an account exists for <strong className="text-slate-700">{email}</strong>, you will receive a password reset link shortly.
              </p>
              <Link href="/login" className="btn btn-primary w-full py-2.5 text-sm font-semibold">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin size={22} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Forgot password?</h1>
                <p className="text-slate-500 text-sm mt-1">We will send you a reset link by email.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@example.com"
                    className={`w-full px-3.5 py-2.5 border rounded-lg text-sm input-focus ${error ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`}
                  />
                  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-2.5 text-sm font-semibold"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <Link href="/login" className="flex items-center justify-center gap-1.5 mt-6 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
