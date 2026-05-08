"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, AlertCircle, CheckCircle, Clock, ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    icon: MapPin,
    title: "Pin It on the Map",
    desc: "Click to drop a precise location pin. We use reverse geocoding to auto-fill your address.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Zap,
    title: "Instant Submission",
    desc: "Submit civic issues in seconds. Categorize by type and let local authorities know right away.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    desc: "Follow your reports from Pending to Resolved with live status updates and admin notes.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "Your data stays safe with JWT-based authentication and encrypted passwords.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];


const HOW_IT_WORKS = [
  { step: "01", title: "Sign Up", desc: "Create your free account in under a minute." },
  { step: "02", title: "Pin the Issue", desc: "Drop a pin exactly where the problem is on the interactive map." },
  { step: "03", title: "Add Details", desc: "Describe the issue, add a category, and submit your report." },
  { step: "04", title: "Track & Resolve", desc: "Monitor progress as local authorities review and resolve your issue." },
];

export default function HomePage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { if (d.stats) setStats(d.stats); })
      .catch(() => {});
  }, []);

  const STATS = [
    { label: "Issues Reported", value: stats ? stats.totalIssues.toLocaleString() : "...", icon: AlertCircle },
    { label: "Issues Resolved", value: stats ? stats.resolvedIssues.toLocaleString() : "...", icon: CheckCircle },
    { label: "Active Users", value: stats ? stats.activeUsers.toLocaleString() : "...", icon: Clock },
    { label: "Total Users", value: stats ? stats.totalUsers.toLocaleString() : "...", icon: MapPin },
  ];

  return (
    <div>
      <section className="hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 glass-card px-3 py-1.5 rounded-full text-xs font-medium text-blue-200 mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Now live across Pakistan
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Report Civic Issues.
              <br />
              <span className="text-blue-400">Fix Your City.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl">
              UrbanFix connects citizens to local authorities through a real-time geospatial platform. Pin it, report it, watch it get fixed.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/signup" className="btn btn-primary px-6 py-3 text-base font-semibold">
                Get Started Free <ArrowRight size={18} />
              </a>
              <a href="/login" className="btn glass-card px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors">
                Sign In
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon size={24} className="text-blue-600" />
                </div>
                <div className="text-3xl font-extrabold text-slate-800">{value}</div>
                <div className="text-sm text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="section-title">Everything you need to fix your city</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            A modern civic platform built for speed, accuracy, and transparency.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="bg-white border border-slate-200 rounded-xl p-6 card-hover">
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={22} className={color} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">How it works</h2>
            <p className="section-subtitle">Four simple steps to report and resolve civic issues.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <div key={step} className="bg-white border border-slate-200 rounded-xl p-6 relative">
                <div className="text-5xl font-black text-slate-100 mb-3 leading-none">{step}</div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ArrowRight size={18} className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="section-title mb-4">Ready to make your city better?</h2>
        <p className="section-subtitle mb-8 max-w-md mx-auto">
          Join thousands of citizens who are already reporting and tracking civic issues in their communities.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/signup" className="btn btn-primary px-8 py-3 text-base font-semibold">
            Create Free Account <ArrowRight size={18} />
          </a>
          <a href="/login" className="btn btn-ghost px-8 py-3 text-base font-semibold">
            Sign In
          </a>
        </div>
      </section>
    </div>
  );
}
