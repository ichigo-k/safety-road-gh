'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Activity, BellRing, BookOpen, FileText, LayoutDashboard, LogOut, Menu, PhoneCall, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/alerts', label: 'Alerts', icon: BellRing },
  { href: '/admin/emergency-services', label: 'Response teams', icon: PhoneCall },
  { href: '/admin/safety-tips', label: 'Safety library', icon: BookOpen },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#2fdf76] text-[#0a3320] shadow-[0_8px_18px_rgba(47,223,118,.24)]">
        <ShieldCheck className="h-5 w-5" strokeWidth={2.4} />
      </div>
      <div>
        <p className="text-[15px] font-extrabold leading-none tracking-[-.03em] text-[#102018]">Safety Road</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[.22em] text-[#17b85a]">Ghana</p>
      </div>
    </div>
  );
}

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="min-h-[100dvh] bg-[#f4f7f4] text-[#102018]">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1680px]">
        <aside className={`fixed inset-y-0 left-0 z-50 w-[276px] border-r border-[#e0e9e2] bg-white px-5 py-6 transition-transform duration-200 md:sticky md:top-0 md:flex md:h-[100dvh] md:translate-x-0 md:flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between px-2">
            <BrandMark />
            <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="rounded-lg p-2 text-[#6d7d73] hover:bg-[#f2f7f3] md:hidden"><X className="h-5 w-5" /></button>
          </div>
          <div className="mt-10 rounded-2xl bg-[#f2fbf4] p-4">
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#0e7a3f]"><span className="h-2 w-2 rounded-full bg-[#2fdf76] shadow-[0_0_0_4px_rgba(47,223,118,.16)]" />Live operations</div>
            <p className="mt-3 text-sm font-semibold leading-5 text-[#203128]">Accra network is being monitored in real time.</p>
          </div>
          <nav aria-label="Admin navigation" className="mt-8 space-y-1">
            <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#a2b0a7]">Workspace</p>
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return <Link key={href} href={href} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition duration-150 active:scale-[.98] ${active ? 'bg-[#102018] text-white shadow-[0_8px_18px_rgba(16,32,24,.16)]' : 'text-[#6d7d73] hover:bg-[#f2f7f3] hover:text-[#102018]'}`}><Icon className={`h-[18px] w-[18px] ${active ? 'text-[#2fdf76]' : 'text-[#8aa096] group-hover:text-[#17b85a]'}`} /><span>{label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#2fdf76]" />}</Link>;
            })}
          </nav>
          <div className="mt-auto rounded-2xl border border-[#e0e9e2] bg-[#fbfdfb] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dff8e8] text-sm font-extrabold text-[#0e7a3f]">MT</div>
              <div className="min-w-0"><p className="truncate text-sm font-bold text-[#203128]">MTTD Command</p><p className="truncate text-xs text-[#8a9a91]">Operations admin</p></div>
              <Link href="/admin/login" aria-label="Log out" className="ml-auto rounded-lg p-2 text-[#8a9a91] transition hover:bg-[#f0f5f1] hover:text-[#102018]"><LogOut className="h-4 w-4" /></Link>
            </div>
          </div>
        </aside>
        {open && <button type="button" aria-label="Close navigation overlay" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-[#102018]/25 md:hidden" />}
        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-[1320px] animate-[page-enter_220ms_cubic-bezier(.23,1,.32,1)]">
            <div className="mb-5 flex items-center justify-between md:hidden"><button type="button" aria-label="Open navigation" onClick={() => setOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#102018] shadow-sm"><Menu className="h-5 w-5" /></button><div className="flex items-center gap-2 text-sm font-bold"><Activity className="h-4 w-4 text-[#17b85a]" /> Command center</div><div className="h-10 w-10 rounded-xl bg-[#dff8e8]" /></div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
