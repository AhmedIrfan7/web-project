"use client";
import Link from "next/link";
import { MapPin, Clock, Tag, ChevronRight, User } from "lucide-react";

const STATUS_CLASS = {
  Pending: "badge-pending",
  "In Progress": "badge-in-progress",
  Resolved: "badge-resolved",
};

const CAT_CLASS = {
  Road: "cat-road",
  Water: "cat-water",
  Electricity: "cat-electricity",
  Garbage: "cat-garbage",
  Park: "cat-park",
  Other: "cat-other",
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function IssueCard({ issue, showUser = false }) {
  const { _id, title, description, category, status, location, createdAt, userName } = issue;

  return (
    <Link
      href={`/issues/${_id}`}
      className="block bg-white border border-slate-200 rounded-xl p-4 card-hover group"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CAT_CLASS[category] || "cat-other"}`}>
            {category}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CLASS[status] || "badge-pending"}`}>
            {status}
          </span>
        </div>
        <ChevronRight size={16} className="text-slate-400 shrink-0 mt-0.5 group-hover:text-blue-500 transition-colors" />
      </div>

      <h3 className="font-semibold text-slate-800 mb-1 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{description}</p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400 mt-auto">
        {location?.address && (
          <span className="flex items-center gap-1">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate max-w-[160px]">{location.address}</span>
          </span>
        )}
        {showUser && userName && (
          <span className="flex items-center gap-1">
            <User size={11} className="shrink-0" />
            {userName}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={11} className="shrink-0" />
          {formatDate(createdAt)}
        </span>
      </div>
    </Link>
  );
}
