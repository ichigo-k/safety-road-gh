'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BellRing,
  BookOpen,
  ChevronRight,
  ChevronsLeft,
  FileText,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  PhoneCall,
  Settings,
  Shield,
  X,
} from 'lucide-react';

/* ── Nav structure ─────────────────────────────────────────────────────── */
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

/* ── Brand mark ────────────────────────────────────────────────────────── */
function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-brand shadow-[0_0_0_1px_rgba(255,255,255,0.1)]">
        <Shield className="h-4 w-4 text-white" strokeWidth={2.2} />
      </span>
      {!compact && (
        <div className="leading-none">
          <p className="text-[13px] font-semibold tracking-[-0.01em] text-panel-text">
            Safety Road
          </p>
          <p className="mt-0.5 text-[11px] text-panel-dim">Ghana</p>
        </div>
      )}
    </div>
  );
}

/* ── Nav item ──────────────────────────────────────────────────────────── */
function NavLink({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={[
        'group relative flex items-center rounded-sm transition-all duration-150',
        collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
        active
          ? 'bg-panel-raised text-panel-text'
          : 'text-panel-muted hover:bg-panel-raised/60 hover:text-panel-text',
      ].join(' ')}
    >
      {/* active indicator bar */}
      {active && (
        <span className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-full bg-brand-on-dark" />
      )}
      <Icon
        className={[
          'h-4 w-4 shrink-0 transition-colors',
          active ? 'text-brand-on-dark' : 'text-panel-dim group-hover:text-panel-muted',
        ].join(' ')}
        strokeWidth={active ? 2.2 : 2}
      />
      {!collapsed && (
        <span className="flex-1 text-[13px] font-medium leading-none">{item.label}</span>
      )}
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  /* ── Auth guard ─────────────────────────────────────────────────────────
   * Middleware can't read localStorage (Edge runtime), so we guard here.
   * On every mount we check for a token; missing → kick to login.
   * We also verify the token hasn't expired by peeking at the exp claim.
   * ---------------------------------------------------------------------- */
  useEffect(() => {
    if (pathname === '/admin/login') return;
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    // Decode the JWT payload (no signature check — server does that on each
    // API call; here we just want to catch obviously expired tokens client-side).
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.replace('/admin/login');
      }
    } catch {
      // Malformed token — treat as missing.
      localStorage.removeItem('adminToken');
      router.replace('/admin/login');
    }
  }, [pathname, router]);

  /* read user from localStorage so the sidebar footer stays accurate */
  const [adminUser, setAdminUser] = useState<{ full_name?: string; email?: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('adminUser');
    if (raw) {
      try {
        setAdminUser(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, [pathname]); // re-read after every nav in case profile page updated it

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;

  const isDashboard = pathname === '/admin';

  const displayName = adminUser?.full_name ?? 'MTTD Command';
  const displayInitials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-[100dvh] bg-canvas">

      {/* ══ Sidebar ═══════════════════════════════════════════════════════ */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-panel',
          /* subtle inner border on right edge */
          'border-r border-white/[0.06]',
          collapsed ? 'w-[68px]' : 'w-[240px]',
          'transition-[transform,width] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
          'md:sticky md:top-0 md:h-[100dvh] md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* ── Logo row ─────────────────────────────────────────────────── */}
        <div
          className={[
            'flex items-center px-4 py-5',
            collapsed ? 'justify-center' : 'justify-between',
          ].join(' ')}
        >
          <BrandMark compact={collapsed} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="rounded-xs p-1.5 text-panel-dim transition-colors hover:bg-panel-raised hover:text-panel-text md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Nav ──────────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3" aria-label="Admin navigation">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.title} className={gi > 0 ? 'mt-5' : ''}>
              {collapsed ? (
                <div className="mx-2 mb-3 h-px bg-panel-line" />
              ) : (
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-panel-dim/70">
                  {group.title}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    /* exact match for overview, starts-with for everything else */
                    active={
                      item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href)
                    }
                    collapsed={collapsed}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Collapse toggle (desktop only) ───────────────────────────── */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-pressed={collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={[
            'mx-3 mb-2 hidden items-center gap-3 rounded-sm px-3 py-2 text-[13px] font-medium',
            'text-panel-dim transition-colors hover:bg-panel-raised hover:text-panel-text md:flex',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
        >
          <ChevronsLeft
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            strokeWidth={2}
          />
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* ── Operator footer ───────────────────────────────────────────── */}
        <div className="border-t border-panel-line px-3 py-3">
          {collapsed ? (
            /* collapsed: just the avatar, clicking goes to profile */
            <Link
              href="/admin/profile"
              title="Your profile"
              className="flex justify-center rounded-sm p-1.5 transition-colors hover:bg-panel-raised"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xs bg-panel-raised text-[11px] font-semibold text-brand-on-dark">
                {displayInitials}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/admin/profile"
                title="Your profile"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xs bg-panel-raised text-[11px] font-semibold text-brand-on-dark transition-colors hover:bg-white/10"
              >
                {displayInitials}
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium leading-none text-panel-text">
                  {displayName}
                </p>
                <p className="mt-1 truncate text-[11px] leading-none text-panel-dim">
                  {adminUser?.email ?? 'Operations admin'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Link
                  href="/admin/profile"
                  aria-label="Profile settings"
                  className="rounded-xs p-1.5 text-panel-dim transition-colors hover:bg-panel-raised hover:text-panel-text"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  className="rounded-xs p-1.5 text-panel-dim transition-colors hover:bg-panel-raised hover:text-danger"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* ══ Content ═══════════════════════════════════════════════════════ */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-line text-ink-700 transition-colors hover:bg-ink-50"
          >
            <Menu className="h-4 w-4" />
          </button>
          <BrandMark />
          {/* breadcrumb hint on mobile */}
          {pathname !== '/admin' && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-ink-400" />
              <span className="truncate text-body font-medium text-ink-700">
                {NAV_GROUPS.flatMap((g) => g.items).find((i) =>
                  i.href === '/admin' ? pathname === '/admin' : pathname.startsWith(i.href)
                )?.label ?? 'Admin'}
              </span>
            </>
          )}
        </div>

        <main
          className={isDashboard ? 'flex-1' : 'flex-1 px-5 py-7 sm:px-8 lg:px-10'}
          id="main"
        >
          <div className={isDashboard ? 'h-full' : 'page-enter mx-auto max-w-[1280px]'}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
