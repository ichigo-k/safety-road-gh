import React from 'react';
import Link from 'next/link';
import { 
  Shield, 
  FileText, 
  BellRing, 
  PhoneCall, 
  BookOpen, 
  LayoutDashboard,
  LogOut
} from 'lucide-react';

export const metadata = {
  title: 'Safety Road GH — Admin Portal',
  description: 'Road Accident and Hazard Management Dashboard for Ghana',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Header Branding */}
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-900/40">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-wide text-white">SAFETY ROAD GH</h1>
              <p className="text-xs text-amber-400 font-medium">MTTD Admin Console</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <Link
              href="/admin"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 font-medium transition-colors"
            >
              <LayoutDashboard className="w-5 h-5 text-amber-400" />
              <span>Overview</span>
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 font-medium transition-colors"
            >
              <FileText className="w-5 h-5 text-red-400" />
              <span>Accident & Hazard Reports</span>
            </Link>
            <Link
              href="/admin/alerts"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 font-medium transition-colors"
            >
              <BellRing className="w-5 h-5 text-orange-400" />
              <span>Broadcast Road Alerts</span>
            </Link>
            <Link
              href="/admin/emergency-services"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 font-medium transition-colors"
            >
              <PhoneCall className="w-5 h-5 text-emerald-400" />
              <span>Emergency Services</span>
            </Link>
            <Link
              href="/admin/safety-tips"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 font-medium transition-colors"
            >
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>Safety Tips</span>
            </Link>
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-400 text-sm">
                A
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-200 truncate">MTTD Command</p>
                <p className="text-xs text-slate-400 truncate">admin@safetyroad.gov.gh</p>
              </div>
            </div>
            <Link href="/admin/login" className="text-slate-400 hover:text-red-400 p-1" title="Logout">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
