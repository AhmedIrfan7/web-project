"use client";
import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

export default function MapPicker({ onLocationSelect, initialLat, initialLng }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (leafletMap.current) return;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        const lat = initialLat || 33.6844;
        const lng = initialLng || 73.0479;

        const map = L.map(mapRef.current).setView([lat, lng], 13);
        leafletMap.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        if (initialLat && initialLng) {
          const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
          markerRef.current = marker;
          marker.on("dragend", async () => {
            const { lat, lng } = marker.getLatLng();
            const address = await reverseGeocode(lat, lng);
            onLocationSelect({ lat, lng, address });
          });
        }

        map.on("click", async (e) => {
          const { lat, lng } = e.latlng;
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
            markerRef.current = marker;
            marker.on("dragend", async () => {
              const { lat: mLat, lng: mLng } = marker.getLatLng();
              const address = await reverseGeocode(mLat, mLng);
              onLocationSelect({ lat: mLat, lng: mLng, address });
            });
          }
          const address = await reverseGeocode(lat, lng);
          onLocationSelect({ lat, lng, address });
        });

        setLoading(false);
      } catch (err) {
        setError("Failed to load map. Please refresh.");
        setLoading(false);
      }
    };

    initMap();

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  }

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200 text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50">
          <Loader2 size={28} className="animate-spin text-blue-600 mb-2" />
          <span className="text-sm text-slate-500">Loading map...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-72" style={{ minHeight: 288 }} />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm text-xs text-slate-600 px-3 py-1.5 rounded-full shadow flex items-center gap-1 border border-slate-200">
          <MapPin size={12} className="text-blue-600" />
          Click on the map to pin your location
        </div>
      </div>
    </div>
  );
}
