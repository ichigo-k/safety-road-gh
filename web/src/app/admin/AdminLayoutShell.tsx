'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BellRing, BookOpen, FileText, LayoutDashboard, LogOut, PhoneCall } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/alerts', label: 'Alerts', icon: BellRing },
  { href: '/admin/emergency-services', label: 'Emergency services', icon: PhoneCall },
  { href: '/admin/safety-tips', label: 'Safety tips', icon: BookOpen },
];

function SafetyRoadLogo() {
  return (
    <svg viewBox="0 0 236 52" role="img" aria-labelledby="safety-road-logo-title" className="h-10 w-auto">
      <title id="safety-road-logo-title">Safety Road GH</title>
      <rect width="40" height="40" x="1" y="6" rx="10" fill="#f5b335" />
      <path d="M10 38c4-10 7-18 11-18 5 0 8 7 11 18" fill="none" stroke="#1f1f1f" strokeWidth="4" strokeLinecap="round" />
      <path d="M21 24v5m0 6v3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 11h26" stroke="#bd2d3b" strokeWidth="3" /><path d="M8 15h26" stroke="#f7d154" strokeWidth="3" /><path d="M8 19h26" stroke="#25834b" strokeWidth="3" />
      <circle cx="21" cy="13" r="2" fill="#1f1f1f" />
      <text x="54" y="28" fill="#242424" fontSize="17" fontFamily="Segoe UI, sans-serif" fontWeight="600" letterSpacing="-0.4">Safety Road</text>
      <text x="55" y="43" fill="#f5b335" fontSize="10" fontFamily="Segoe UI, sans-serif" fontWeight="700" letterSpacing="3">GH</text>
    </svg>
  );
}

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1600px] flex-col md:flex-row">
        <aside className="w-full border-r border-[#e1e1e1] bg-white text-[#242424] md:sticky md:top-0 md:h-[100dvh] md:w-72 md:shrink-0 md:overflow-hidden">
          <div className="flex h-full flex-col justify-between px-4 py-5">
            <div>
              <div className="border-b border-[#e1e1e1] px-3 pb-5"><SafetyRoadLogo /></div>
              <nav aria-label="Admin navigation" className="mt-6 space-y-1">{navItems.map(({ href, label, icon: Icon }) => { const active = pathname === href; return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`group flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors duration-150 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f6cbd] ${active ? 'border-[#cfe4f7] bg-[#eff6fc] text-[#0f6cbd]' : 'border-transparent text-[#616161] hover:bg-[#f5f5f5] hover:text-[#242424]'}`}><Icon className={`h-4 w-4 ${active ? 'text-[#0f6cbd]' : 'text-[#616161]'}`} /><span>{label}</span></Link>; })}</nav>
            </div>
            <div className="mt-8 border-t border-[#e1e1e1] pt-4"><div className="flex items-center justify-between gap-3 px-2"><div className="flex items-center gap-3 truncate"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f6cbd] text-sm font-semibold text-white">A</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#242424]">MTTD Command</p><p className="truncate text-xs text-[#616161]">admin@safetyroad.gov.gh</p></div></div><Link href="/admin/login" className="rounded-md p-2 text-[#616161] transition hover:bg-[#f5f5f5] hover:text-[#242424]" aria-label="Log out"><LogOut className="h-4 w-4" /></Link></div></div>
          </div>
        </aside>
        <main className="min-h-[100dvh] flex-1 px-4 py-6 md:px-8 lg:px-10"><div className="mx-auto max-w-7xl animate-[page-enter_220ms_cubic-bezier(0.23,1,0.32,1)]">{children}</div></main>
      </div>
    </div>
  );
}
