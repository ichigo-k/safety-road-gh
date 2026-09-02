'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  BellRing,
  BookOpen,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PhoneCall,
  Radio,
  Shield,
  X,
} from 'lucide-react';

/* ── Nav items ────────────────────────────────────────────────────────── */
const navItems = [
  {
    href: '/admin',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'Live map & metrics',
  },
  {
    href: '/admin/reports',
    label: 'Reports',
    icon: FileText,
    description: 'Accidents & hazards',
    badge: null as string | null,
  },
  {
    href: '/admin/alerts',
    label: 'Alerts',
    icon: BellRing,
    description: 'Broadcast to public',
  },
  {
    href: '/admin/emergency-services',
    label: 'Response teams',
    icon: PhoneCall,
    description: 'Hospitals & police',
  },
  {
    href: '/admin/safety-tips',
    label: 'Safety library',
    icon: BookOpen,
    description: 'Public education',
  },
];

/* ── Live status dot ──────────────────────────────────────────────────── */
function PulseDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span
        className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"
        style={{ animation: 'ping 1.6s cubic-bezier(0,0,0.2,1) infinite' }}
      />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
    </span>
  );
}

/* ── Brand mark ───────────────────────────────────────────────────────── */
function BrandMark({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {/* Shield logo */}
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-[11px] bg-white/10 ring-1 ring-white/20" />
        {/* Inner core */}
        <div className="relative flex h-7 w-7 items-center justify-center rounded-[8px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          <Shield className="h-4 w-4 text-[#111111]" strokeWidth={2.2} />
        </div>
      </div>

      {!collapsed && (
        <div>
          <p className="text-[14px] font-extrabold leading-none tracking-[-0.03em] text-white">
            Safety Road
          </p>
          <p className="mt-[3px] text-[9px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Ghana
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === '/admin/login') return <>{children}</>;

  const isDashboard = pathname === '/admin';

  return (
    <div className="flex min-h-[100dvh] bg-[#f4f4f4]">

      {/* ════════════════════════════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════════════════════════════ */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col',
          /* dark background with subtle noise texture via gradient */
          'bg-[#111111]',
          'transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
          'md:sticky md:top-0 md:h-[100dvh] md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.04) 0%, transparent 70%),
            radial-gradient(circle at 0% 100%, rgba(255,255,255,0.02) 0%, transparent 60%)
          `,
        }}
      >
        {/* ── Top: Brand + close ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <BrandMark />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-white/30 hover:bg-white/10 hover:text-white/70 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Live status banner ──────────────────────────────────────── */}
        <div className="mx-4 mb-5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PulseDot />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-400">
                Live
              </span>
            </div>
            <Radio className="h-3.5 w-3.5 text-white/20" />
          </div>
          <p className="mt-1.5 text-[11px] font-medium leading-[1.4] text-white/50">
            Accra network — all channels active
          </p>
        </div>

        {/* ── Section label ───────────────────────────────────────────── */}
        <div className="px-5 pb-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/20">
            Workspace
          </p>
        </div>

        {/* ── Nav ─────────────────────────────────────────────────────── */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {navItems.map(({ href, label, icon: Icon, description, badge }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={[
                  'group relative flex items-center gap-3 rounded-[10px] px-3 py-3 transition-all duration-150',
                  'active:scale-[0.98]',
                  active
                    ? 'bg-white text-[#111111] shadow-[0_2px_12px_rgba(0,0,0,0.25)]'
                    : 'text-white/60 hover:bg-white/[0.07] hover:text-white/90',
                ].join(' ')}
              >
                {/* Icon container */}
                <div
                  className={[
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] transition-colors duration-150',
                    active
                      ? 'bg-[#111111] shadow-[0_1px_4px_rgba(0,0,0,0.2)]'
                      : 'bg-white/[0.06] group-hover:bg-white/[0.1]',
                  ].join(' ')}
                >
                  <Icon
                    className={[
                      'h-[15px] w-[15px]',
                      active ? 'text-white' : 'text-white/50 group-hover:text-white/80',
                    ].join(' ')}
                    strokeWidth={2}
                  />
                </div>

                {/* Label + description */}
                <div className="min-w-0 flex-1">
                  <p
                    className={[
                      'text-[13px] font-semibold leading-none',
                      active ? 'text-[#111111]' : '',
                    ].join(' ')}
                  >
                    {label}
                  </p>
                  <p
                    className={[
                      'mt-[3px] truncate text-[10px] leading-none',
                      active ? 'text-[#111111]/50' : 'text-white/30',
                    ].join(' ')}
                  >
                    {description}
                  </p>
                </div>

                {/* Active chevron / badge */}
                {active ? (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#111111]/30" />
                ) : badge ? (
                  <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div className="mx-4 h-px bg-white/[0.07]" />

        {/* ── System status strip ─────────────────────────────────────── */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 text-[10px] text-white/25">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>API</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>DB</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Alerts</span>
            </div>
            <span className="ml-auto">v1.0</span>
          </div>
        </div>

        {/* ── User footer ─────────────────────────────────────────────── */}
        <div className="border-t border-white/[0.07] px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Avatar with online ring */}
            <div className="relative shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/10 text-[12px] font-bold text-white ring-1 ring-white/20">
                MT
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#111111] bg-emerald-400" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold text-white/90">MTTD Command</p>
              <p className="truncate text-[10px] text-white/30">Operations admin</p>
            </div>

            <Link
              href="/admin/login"
              aria-label="Log out"
              className="rounded-lg p-1.5 text-white/25 transition hover:bg-white/10 hover:text-white/70"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 rounded-b-none bg-gradient-to-t from-black/20 to-transparent" />
      </aside>

      {/* Mobile backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* ════════════════════════════════════════════════════════════════
          CONTENT AREA
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Mobile topbar */}
        <div className="flex items-center gap-3 border-b border-[#e5e5e5] bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#111111]"
          >
            <Menu className="h-4 w-4 text-white" />
          </button>

          {/* Mobile brand (light version) */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#111111]">
              <Shield className="h-[14px] w-[14px] text-white" strokeWidth={2.2} />
            </div>
            <p className="text-[13px] font-extrabold tracking-[-0.02em] text-[#111111]">
              Safety Road
            </p>
          </div>

          {/* Live indicator */}
          <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </div>
        </div>

        {/* Page */}
        <main className={isDashboard ? 'flex-1' : 'flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-8'}>
          <div className={isDashboard ? 'h-full' : 'mx-auto max-w-[1280px] page-enter'}>
            {children}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
