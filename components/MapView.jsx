"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

const STATUS_COLOR = {
  Pending: "#f59e0b",
  "In Progress": "#3b82f6",
  Resolved: "#10b981",
};

export default function MapView({ issues = [], height = "500px" }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (leafletMap.current) return;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        const map = L.map(mapRef.current).setView([30.3753, 69.3451], 6);
        leafletMap.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        setLoading(false);
      } catch {
        setError("Failed to load map.");
        setLoading(false);
      }
    };

    initMap();

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletMap.current || loading) return;

    const addMarkers = async () => {
      const L = (await import("leaflet")).default;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const validIssues = issues.filter(
        (i) => i.location?.lat != null && i.location?.lng != null
      );

      validIssues.forEach((issue) => {
        const color = STATUS_COLOR[issue.status] || "#6b7280";
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([issue.location.lat, issue.location.lng], { icon })
          .addTo(leafletMap.current)
          .bindPopup(`
            <div style="min-width:180px;font-family:system-ui,sans-serif">
              <p style="font-weight:600;font-size:13px;margin:0 0 4px">${issue.title}</p>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <span style="font-size:11px;background:#f1f5f9;padding:2px 8px;border-radius:99px">${issue.category}</span>
                <span style="font-size:11px;background:${color}22;color:${color};padding:2px 8px;border-radius:99px;font-weight:600">${issue.status}</span>
              </div>
              ${issue.location?.address ? `<p style="font-size:11px;color:#64748b;margin:6px 0 0">${issue.location.address.substring(0, 80)}...</p>` : ""}
            </div>
          `);

        markersRef.current.push(marker);
      });

      if (validIssues.length > 0 && leafletMap.current) {
        const group = L.featureGroup(markersRef.current);
        leafletMap.current.fitBounds(group.getBounds().pad(0.2), { maxZoom: 14 });
      }
    };

    addMarkers();
  }, [issues, loading]);

  if (error) {
    return (
      <div className="w-full flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200 text-red-500 text-sm" style={{ height }}>
        {error}
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50">
          <Loader2 size={28} className="animate-spin text-blue-600" />
        </div>
      )}
      <div ref={mapRef} style={{ width: "100%", height }} />
      <div className="absolute bottom-3 right-3 z-[400] bg-white/90 backdrop-blur-sm rounded-xl shadow border border-slate-200 p-2.5 space-y-1.5 text-xs">
        {Object.entries(STATUS_COLOR).map(([label, color]) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ background: color }} />
            <span className="text-slate-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
