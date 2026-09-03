/* ─── Safety Road Ghana — Admin UI kit ─────────────────────────────────────
 *
 * Every admin page was defining its own StatusPill, skeleton and card shell,
 * which is why five pages drifted into five different looks. These are the
 * shared primitives; pages should compose them rather than restyle.
 * ------------------------------------------------------------------------ */

import React from 'react';
import { LucideIcon } from 'lucide-react';

/* Enum values arrive SCREAMING from the database (VEHICLE_COLLISION,
 * FIRE_AMBULANCE). Operators read these all day — present them as words. */
export function sentenceCase(value: string) {
  if (!value) return '';
  const words = value.replaceAll('_', ' ').toLowerCase().trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export type Tone = 'neutral' | 'brand' | 'danger' | 'warn' | 'info' | 'ok';

const TONE: Record<Tone, { text: string; bg: string; dot: string }> = {
  neutral: { text: 'text-ink-600', bg: 'bg-ink-50', dot: 'bg-ink-400' },
  brand: { text: 'text-brand-dark', bg: 'bg-brand-soft', dot: 'bg-brand' },
  danger: { text: 'text-danger-dark', bg: 'bg-danger-soft', dot: 'bg-danger' },
  warn: { text: 'text-warn-dark', bg: 'bg-warn-soft', dot: 'bg-warn' },
  info: { text: 'text-info-dark', bg: 'bg-info-soft', dot: 'bg-info' },
  ok: { text: 'text-ok', bg: 'bg-ok-soft', dot: 'bg-ok' },
};

/* ── Status vocabulary ─────────────────────────────────────────────────────
 * One mapping for the whole console. Labels are sentence case: an operator
 * reads these hundreds of times a shift and SHOUTING EVERY CELL is noise. */

export const STATUS: Record<string, { tone: Tone; label: string }> = {
  PENDING: { tone: 'warn', label: 'Pending' },
  VERIFIED: { tone: 'info', label: 'Verified' },
  DISPATCHED: { tone: 'brand', label: 'Dispatched' },
  RESOLVED: { tone: 'ok', label: 'Resolved' },
  REJECTED: { tone: 'neutral', label: 'Rejected' },
};

export function StatusPill({ status }: { status: string }) {
  const s = STATUS[status] ?? { tone: 'neutral' as Tone, label: status };
  const t = TONE[s.tone];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-xs px-2 py-1 text-micro font-semibold ${t.bg} ${t.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {s.label}
    </span>
  );
}

/* ── Tag ───────────────────────────────────────────────────────────────────
 * Squared, not a pill — reads as a system label rather than a marketing badge. */

export function Tag({
  label,
  tone = 'neutral',
  icon: Icon,
}: {
  label: string;
  tone?: Tone;
  icon?: LucideIcon;
}) {
  const t = TONE[tone];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-xs px-2 py-1 text-micro font-semibold ${t.bg} ${t.text}`}
    >
      {Icon ? <Icon className="h-3 w-3" strokeWidth={2.2} /> : null}
      {label}
    </span>
  );
}

export function TypeTag({ type }: { type: string }) {
  const accident = type === 'ACCIDENT';
  return <Tag label={accident ? 'Accident' : 'Hazard'} tone={accident ? 'danger' : 'warn'} />;
}

/* ── Surface ───────────────────────────────────────────────────────────────
 * Flat by default. A border OR a shadow, never both on the same box. */

export function Surface({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <Tag className={`rounded-lg border border-line bg-surface ${className}`}>{children}</Tag>
  );
}

/* ── Page header ───────────────────────────────────────────────────────── */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-display font-semibold text-ink-900">{title}</h1>
        {description ? <p className="mt-1 text-body text-ink-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/* ── Button ────────────────────────────────────────────────────────────── */

type ButtonProps = {
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const BUTTON_VARIANT: Record<string, string> = {
  primary: 'bg-brand text-white hover:bg-brand-press',
  secondary: 'bg-surface text-ink-800 border border-line-strong hover:bg-ink-50',
  ghost: 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
  danger: 'bg-danger text-white hover:bg-danger-dark',
};

export function Button({
  children,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const sizing = size === 'sm' ? 'h-8 px-3 text-caption gap-1.5' : 'h-10 px-4 text-body gap-2';
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-sm font-semibold transition-colors duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${sizing} ${BUTTON_VARIANT[variant]} ${className}`}
    >
      {Icon ? <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={2.2} /> : null}
      {children}
    </button>
  );
}

/* ── Filter chip ───────────────────────────────────────────────────────── */

export function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 items-center gap-2 rounded-sm border px-3 text-body font-medium transition-colors duration-150 ${
        active
          ? 'border-brand bg-brand text-white'
          : 'border-line bg-surface text-ink-600 hover:bg-ink-50 hover:text-ink-900'
      }`}
    >
      {label}
      {typeof count === 'number' ? (
        <span className={`tabular text-caption ${active ? 'text-white/75' : 'text-ink-400'}`}>
          {count}
        </span>
      ) : null}
    </button>
  );
}

/* ── Search ────────────────────────────────────────────────────────────── */

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search',
  icon: Icon,
  clearIcon: ClearIcon,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: LucideIcon;
  clearIcon?: LucideIcon;
}) {
  return (
    <div className="flex h-10 flex-1 items-center gap-2.5 rounded-sm border border-line bg-surface px-3">
      {Icon ? <Icon className="h-4 w-4 shrink-0 text-ink-400" strokeWidth={2} /> : null}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-body text-ink-900 placeholder:text-ink-400 focus:outline-none"
      />
      {value && ClearIcon ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="shrink-0 rounded-xs p-0.5 text-ink-400 transition-colors hover:text-ink-700"
        >
          <ClearIcon className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

/* ── Metric ────────────────────────────────────────────────────────────── */

export function Metric({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
}) {
  const t = TONE[tone];
  return (
    <div className="flex items-center gap-3">
      {Icon ? (
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${t.bg}`}>
          <Icon className={`h-4 w-4 ${t.text}`} strokeWidth={2.2} />
        </span>
      ) : null}
      <div>
        <p className="tabular text-metric font-semibold text-ink-900">{value}</p>
        <p className="text-micro font-medium text-ink-500">{label}</p>
      </div>
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────────────────────── */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {Icon ? (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-ink-50">
          <Icon className="h-5 w-5 text-ink-400" strokeWidth={2} />
        </span>
      ) : null}
      <p className="text-title font-semibold text-ink-900">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-body text-ink-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* ── Skeleton ──────────────────────────────────────────────────────────── */

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-sm" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="mt-2 h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-20 rounded-xs" />
    </div>
  );
}
