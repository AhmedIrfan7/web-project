"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { MapPin, Eye, EyeOff, Loader2, Check, X } from "lucide-react";

function PwRule({ met, text }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${met ? "text-emerald-600" : "text-slate-400"}`}>
      {met ? <Check size={11} /> : <X size={11} />}
      {text}
    </li>
  );
}

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const pw = form.password;
  const rules = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    digit: /[0-9]/.test(pw),
  };

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    else if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
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

    setLoading(true);
    try {
      const user = await register(form.name.trim(), form.email.trim(), pw);
      toast.success("Account created! Welcome to UrbanFix.");
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const textField = (key, label, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 border rounded-lg text-sm input-focus ${errors[key] ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MapPin size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Create account</h1>
            <p className="text-slate-500 text-sm mt-1">Join UrbanFix and help fix your city</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {textField("name", "Full name", "text", "Your Name")}
            {textField("email", "Email address", "email", "you@example.com")}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Create a strong password"
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
                placeholder="Repeat your password"
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm input-focus ${errors.confirm ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`}
              />
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 text-sm font-semibold"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
