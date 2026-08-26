import React from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Activity, 
  Lock, 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  Database,
  Radio
} from 'lucide-react';

export const metadata = {
  title: 'Safety Road GH — System Operational',
  description: 'Ghana National Road Accident & Hazard Reporting System API and Administration Portal',
};

export default function RootHomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center font-black text-white shadow-lg shadow-red-900/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-white">SAFETY ROAD GH</span>
              <span className="block text-xs font-semibold text-amber-400">National Road Safety Network</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>API & Database Active</span>
            </div>
            <Link
              href="/admin/login"
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-amber-500/20"
            >
              <Lock className="w-4 h-4" />
              <span>Admin Portal Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold tracking-wide uppercase">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Ghana Emergency Response System</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight">
              Safety Road GH Application is <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">Live & Operational</span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl leading-relaxed max-w-2xl font-normal">
              The high-performance REST API, Neon PostgreSQL cloud database, and integrated MTTD Command Center are active and serving live incident reports across Ghana.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                href="/admin/login"
                className="flex items-center justify-center space-x-3 bg-amber-500 hover:bg-amber-400 text-slate-950 px-8 py-4 rounded-xl font-black text-base transition shadow-xl shadow-amber-500/20 group"
              >
                <span>Enter MTTD Admin Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/admin/reports"
                className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-6 py-4 rounded-xl font-bold text-base transition"
              >
                <Activity className="w-5 h-5 text-amber-400" />
                <span>View Live Incidents</span>
              </Link>
            </div>

            {/* Status Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-800/80">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm font-semibold text-slate-300">Neon Cloud DB</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm font-semibold text-slate-300">Gmail SMTP Ready</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm font-semibold text-slate-300">31 Mobile Screens</span>
              </div>
            </div>
          </div>

          {/* Right Column Status Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <Database className="w-6 h-6 text-amber-400" />
                  <h3 className="font-bold text-lg text-white">System Architecture</h3>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                  v1.0.0
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Backend REST API</p>
                    <p className="text-sm font-bold text-white mt-0.5">Next.js 16 App Router</p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Online
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Relational Database</p>
                    <p className="text-sm font-bold text-white mt-0.5">Neon PostgreSQL Cloud</p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Connected
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Mobile Application</p>
                    <p className="text-sm font-bold text-white mt-0.5">Expo SDK 54 (Android & PWA)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Synchronized
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/admin/login"
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-lg shadow-red-900/30"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Access MTTD Admin Portal</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>Safety Road GH — Ghana National Road Safety Authority & MTTD Command Center &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
