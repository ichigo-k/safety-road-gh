'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BellRing,
  BookOpen,
  ChevronsLeft,
  FileText,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  PhoneCall,
  Shield,
  X,
} from 'lucide-react';

/* ── Navigation ───────────────────────────────────────────────────────────
 * Grouped by what an operator is doing, not by data model. "Live" is the
 * triage loop they sit in all shift; "Network" is reference they visit
 * occasionally. Labels name their contents rather than vague umbrellas.
 * ---------------------------------------------------------------------- */

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Live',
    items: [
      { href: '/admin', label: 'Overview', icon: LayoutDashboard },
      { href: '/admin/reports', label: 'Reports', icon: FileText },
      { href: '/admin/alerts', label: 'Alerts', icon: BellRing },
    ],
  },
  {
    title: 'Network',
    items: [
      { href: '/admin/hotspots', label: 'Hotspots', icon: Flame },
      { href: '/admin/emergency-services', label: 'Response teams', icon: PhoneCall },
      { href: '/admin/safety-tips', label: 'Safety library', icon: BookOpen },
    ],
  },
];

function BrandMark({ onDark = false, compact = false }: { onDark?: boolean; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-brand">
        <Shield className="h-4 w-4 text-white" strokeWidth={2.2} />
      </span>
      {!compact ? (
        <span
          className={`text-base font-semibold tracking-[-0.02em] ${
            onDark ? 'text-panel-text' : 'text-ink-900'
          }`}
        >
          Safety Road
        </span>
      ) : null}
    </div>
  );
}

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;

  const isDashboard = pathname === '/admin';

  return (
    <div className="flex min-h-[100dvh] bg-canvas">
      {/* ══ Sidebar ═══════════════════════════════════════════════════════ */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-panel-line bg-panel',
          collapsed ? 'w-[72px]' : 'w-[248px]',
          'transition-[transform,width] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
          'md:sticky md:top-0 md:h-[100dvh] md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div
          className={`flex items-center px-4 py-5 ${collapsed ? 'justify-center' : 'justify-between'}`}
        >
          <BrandMark onDark compact={collapsed} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="rounded-xs p-1.5 text-panel-dim transition-colors hover:bg-panel-raised hover:text-panel-text md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Admin sections">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="mb-5 last:mb-0">
              {/* Sparing use of a caps label: it separates groups without
                  competing with the item text underneath. */}
              {!collapsed ? (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-panel-dim">
                  {group.title}
                </p>
              ) : (
                <div className="mx-3 mb-3 h-px bg-panel-line" />
              )}

              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? label : undefined}
                      className={[
                        'flex items-center rounded-sm py-2.5 text-body font-medium transition-colors duration-150',
                        collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                        active
                          ? 'bg-panel-raised text-brand-on-dark'
                          : 'text-panel-text/80 hover:bg-panel-raised hover:text-panel-text',
                      ].join(' ')}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          active ? 'text-brand-on-dark' : 'text-panel-dim'
                        }`}
                        strokeWidth={2}
                      />
                      {!collapsed ? <span className="flex-1">{label}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Desktop only — on mobile the whole panel is already a drawer. */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-pressed={collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`mx-3 mb-2 hidden items-center gap-3 rounded-sm px-3 py-2 text-body font-medium text-panel-dim transition-colors hover:bg-panel-raised hover:text-panel-text md:flex ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <ChevronsLeft
            className={`h-4 w-4 shrink-0 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            strokeWidth={2}
          />
          {!collapsed ? <span>Collapse</span> : null}
        </button>

        {/* ── Operator ───────────────────────────────────────────────────── */}
        <div className="border-t border-panel-line px-4 py-4">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-panel-raised text-caption font-semibold text-brand-on-dark">
              MT
            </span>
            {!collapsed ? (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-medium text-panel-text">MTTD Command</p>
                  <p className="truncate text-micro text-panel-dim">Operations admin</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  className="rounded-xs p-1.5 text-panel-dim transition-colors hover:bg-panel-raised hover:text-danger"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink-900/30 md:hidden"
        />
      )}

      {/* ══ Content ═══════════════════════════════════════════════════════ */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-line text-ink-700"
          >
            <Menu className="h-4 w-4" />
          </button>
          <BrandMark />
        </div>

        <main className={isDashboard ? 'flex-1' : 'flex-1 px-5 py-7 sm:px-8 lg:px-10'} id="main">
          <div className={isDashboard ? 'h-full' : 'page-enter mx-auto max-w-[1280px]'}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
