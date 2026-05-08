"use client";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Eye, EyeOff, Check, X, ShieldCheck } from "lucide-react";

function PwRule({ met, text }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${met ? "text-emerald-600" : "text-slate-400"}`}>
      {met ? <Check size={11} /> : <X size={11} />}
      {text}
    </li>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
    }
  }, [token]);

  const pw = form.password;
  const rules = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    digit: /[0-9]/.test(pw),
  };

  function validate() {
    const e = {};
    if (!pw) e.password = "Password is required";
    else if (!rules.length || !rules.upper || !rules.lower || !rules.digit)
      e.password = "Password does not meet all requirements";
    if (form.confirm !== pw) e.confirm = "Passwords do not match";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    if (!token) { toast.error("Missing reset token"); return; }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: pw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      setDone(true);
      toast.success("Password reset successfully!");
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={28} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Password reset!</h2>
        <p className="text-slate-500 text-sm mb-6">Redirecting you to sign in...</p>
        <Link href="/login" className="btn btn-primary w-full py-2.5 text-sm font-semibold">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={22} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Set new password</h1>
        <p className="text-slate-500 text-sm mt-1">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">New password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="New strong password"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm input-focus pr-10 ${errors.password ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {pw && (
            <ul className="mt-2 space-y-0.5 pl-1">
              <PwRule met={rules.length} text="At least 8 characters" />
              <PwRule met={rules.upper} text="One uppercase letter" />
              <PwRule met={rules.lower} text="One lowercase letter" />
              <PwRule met={rules.digit} text="One number" />
            </ul>
          )}
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
          <input
            type="password"
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            placeholder="Repeat new password"
            className={`w-full px-3.5 py-2.5 border rounded-lg text-sm input-focus ${errors.confirm ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`}
          />
          {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="btn btn-primary w-full py-2.5 text-sm font-semibold"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <Link href="/forgot-password" className="block text-center text-sm text-slate-500 mt-6 hover:text-slate-700">
        Request a new reset link
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-sm">
        <Suspense fallback={
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
            <Loader2 size={24} className="animate-spin text-blue-600 mx-auto" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
