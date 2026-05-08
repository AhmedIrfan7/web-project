import Link from "next/link";
import { MapPin, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MapPin size={32} className="text-blue-600" />
        </div>
        <h1 className="text-6xl font-black text-slate-200 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 mb-3">Page not found</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn btn-primary text-sm">
            <Home size={16} /> Go Home
          </Link>
          <Link href="/dashboard" className="btn btn-ghost text-sm">
            <ArrowLeft size={16} /> My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
