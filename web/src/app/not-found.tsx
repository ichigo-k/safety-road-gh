import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, MapPin, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: '404 — Route Not Found | Safety Road GH',
  description: 'The requested page could not be found on the Safety Road GH system.',
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-6 selection:bg-amber-500 selection:text-slate-950">
      {/* Decorative background rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-slate-800/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-slate-800/20" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-red-600/20 to-amber-500/20 border-2 border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
        </div>

        {/* Error Code */}
        <div>
          <p className="text-8xl font-black tracking-tighter bg-gradient-to-r from-amber-400 via-red-500 to-red-600 bg-clip-text text-transparent">
            404
          </p>
          <h1 className="text-2xl font-bold text-white mt-2 tracking-tight">
            Route Not Found on Ghana Road Network
          </h1>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-base leading-relaxed max-w-md mx-auto">
          The page you are looking for does not exist on the Safety Road GH system. 
          It may have been moved, removed, or the URL was entered incorrectly.
        </p>

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-xl text-sm transition shadow-lg shadow-amber-500/20 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Home Base</span>
          </Link>

          <Link
            href="/admin/login"
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold px-6 py-3.5 rounded-xl text-sm transition"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Admin Portal</span>
          </Link>
        </div>

        {/* API Endpoints Reference */}
        <div className="pt-8 border-t border-slate-800/60">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Available API Endpoints</p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-500">
            <div className="bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800/40 text-left">
              <span className="text-emerald-500 font-bold">POST</span> /api/v1/auth/register
            </div>
            <div className="bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800/40 text-left">
              <span className="text-emerald-500 font-bold">POST</span> /api/v1/auth/login
            </div>
            <div className="bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800/40 text-left">
              <span className="text-blue-400 font-bold">GET</span> /api/v1/reports
            </div>
            <div className="bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800/40 text-left">
              <span className="text-blue-400 font-bold">GET</span> /api/v1/alerts
            </div>
            <div className="bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800/40 text-left">
              <span className="text-blue-400 font-bold">GET</span> /api/v1/emergency-services
            </div>
            <div className="bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800/40 text-left">
              <span className="text-blue-400 font-bold">GET</span> /api/v1/safety-tips
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-xs text-slate-600">
        Safety Road GH &mdash; Ghana National Road Safety Authority &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}
