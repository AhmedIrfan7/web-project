import Link from "next/link";
import { MapPin, Github, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <MapPin size={20} className="text-blue-400" />
              UrbanFix
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              A geospatial civic issue tracking platform that connects citizens and local authorities to build better cities.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/report" className="hover:text-white transition-colors">Report Issue</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">My Issues</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-blue-400 shrink-0" />
                <span>support@urbanfix.gov</span>
              </div>
              <div className="flex items-center gap-2">
                <Github size={14} className="text-blue-400 shrink-0" />
                <span>github.com/AhmedIrfan7/web-project</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>2024 UrbanFix. Built by Ahmed Irfan (23i-0020) and Muhammad Bilal (23i-0595).</p>
          <p>FAST NUCES - Web Programming Project</p>
        </div>
      </div>
    </footer>
  );
}
