"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  Car,
  FileText,
  HeartPulse,
  ImageOff,
  MapPin,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import {
  Button,
  EmptyState,
  FilterChip,
  Metric,
  PageHeader,
  SearchInput,
  Skeleton,
  StatusPill,
  sentenceCase,
  Surface,
  TypeTag,
} from '@/components/ui';

interface ReportItem {
  id: string;
  type: string;
  hazardCategory?: string;
  title: string;
  description: string;
  injuredCount: number;
  vehicleCount: number;
  latitude: number;
  longitude: number;
  locationName: string;
  photoUrl?: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string; phone?: string };
}

type StatusFilter = 'ALL' | 'PENDING' | 'VERIFIED' | 'DISPATCHED' | 'RESOLVED' | 'REJECTED';
type TypeFilter = 'ALL' | 'ACCIDENT' | 'HAZARD';

function ReportCardSkeleton() {
  return (
    <Surface className="overflow-hidden">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="p-4">
        <Skeleton className="h-5 w-20 rounded-xs" />
        <Skeleton className="mt-3 h-4 w-3/4" />
        <Skeleton className="mt-2 h-3 w-full" />
        <Skeleton className="mt-4 h-3 w-1/2" />
      </div>
    </Surface>
  );
}

/* Photos come from user uploads, so a dead URL is normal. Show a labelled
   placeholder rather than a broken-image icon with alt text spilling out. */
function ReportPhoto({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-ink-50 ${className}`}>
        <span className="flex items-center gap-2 text-caption text-ink-400">
          <ImageOff className="h-4 w-4" />
          Photo unavailable
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('ALL');
  const [filterType, setFilterType] = useState<TypeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<ReportItem | null>(null);
  const [updateNotes, setUpdateNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/reports');
      const data = await res.json();
      if (data.reports) setReports(data.reports);
    } catch {
      setError('Could not load reports. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Escape closes the detail dialog — never trap the operator inside it.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdating(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/v1/reports/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status, notes: updateNotes || `Updated to ${status}` }),
      });
      if (res.ok) {
        setUpdateNotes('');
        setSelected(null);
        fetchReports();
      } else {
        setError('Update failed. Your session may have expired — sign in again.');
      }
    } catch {
      setError('Network error. The change was not saved.');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = reports.filter((r) => {
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (filterType !== 'ALL' && r.type !== filterType) return false;
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.locationName.toLowerCase().includes(q) ||
      r.user.name.toLowerCase().includes(q)
    );
  });

  const counts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === 'PENDING').length,
    verified: reports.filter((r) => r.status === 'VERIFIED').length,
    resolved: reports.filter((r) => r.status === 'RESOLVED').length,
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Accident and hazard submissions from the public."
        actions={
          <Button variant="secondary" icon={RefreshCw} onClick={fetchReports} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {error ? (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-sm bg-danger-soft px-4 py-3 text-body text-danger-dark"
        >
          {error}
        </div>
      ) : null}

      {/* ── Counters ─────────────────────────────────────────────────────── */}
      <Surface className="mb-5 grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
        {[
          { label: 'Total submissions', value: counts.all, tone: 'neutral' as const },
          { label: 'Pending review', value: counts.pending, tone: 'warn' as const },
          { label: 'Verified', value: counts.verified, tone: 'info' as const },
          { label: 'Resolved', value: counts.resolved, tone: 'ok' as const },
        ].map(({ label, value, tone }) => (
          <div key={label} className="px-5 py-4">
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <Metric label={label} value={value} tone={tone} />
            )}
          </div>
        ))}
      </Surface>

      {/* ── Filters ──────────────────────────────────────────────────────
          Chips instead of a collapsible panel of selects: the whole filter
          state is visible at a glance and one click wide. */}
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, location or reporter"
            icon={Search}
            clearIcon={X}
          />
          <span className="tabular shrink-0 text-body text-ink-500">
            {filtered.length} of {reports.length}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ['ALL', 'All', counts.all],
              ['PENDING', 'Pending', counts.pending],
              ['VERIFIED', 'Verified', counts.verified],
              ['DISPATCHED', 'Dispatched', undefined],
              ['RESOLVED', 'Resolved', counts.resolved],
              ['REJECTED', 'Rejected', undefined],
            ] as [StatusFilter, string, number | undefined][]
          ).map(([id, label, count]) => (
            <FilterChip
              key={id}
              label={label}
              count={count}
              active={filterStatus === id}
              onClick={() => setFilterStatus(id)}
            />
          ))}

          <span className="mx-1 hidden w-px self-stretch bg-line sm:block" />

          {(
            [
              ['ALL', 'Both types'],
              ['ACCIDENT', 'Accidents'],
              ['HAZARD', 'Hazards'],
            ] as [TypeFilter, string][]
          ).map(([id, label]) => (
            <FilterChip
              key={id}
              label={label}
              active={filterType === id}
              onClick={() => setFilterType(id)}
            />
          ))}
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ReportCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Surface>
          <EmptyState
            icon={FileText}
            title={reports.length === 0 ? 'No reports yet' : 'Nothing matches those filters'}
            description={
              reports.length === 0
                ? 'Submissions from the public app will appear here as they arrive.'
                : 'Try a different status, type, or clear the search.'
            }
            action={
              reports.length > 0 ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFilterStatus('ALL');
                    setFilterType('ALL');
                    setSearchQuery('');
                  }}
                >
                  Clear filters
                </Button>
              ) : null
            }
          />
        </Surface>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((report) => (
            <Surface
              key={report.id}
              as="article"
              className="flex flex-col overflow-hidden transition-shadow duration-150 hover:shadow-card"
            >
              {report.photoUrl ? (
                <ReportPhoto src={report.photoUrl} alt={report.title} className="h-36 w-full" />
              ) : null}

              <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <TypeTag type={report.type} />
                  <StatusPill status={report.status} />
                </div>

                <h3 className="mt-3 text-base font-semibold text-ink-900">
                  {sentenceCase(report.title)}
                </h3>
                <p className="mt-1 line-clamp-2 text-body text-ink-500">{report.description}</p>

                <div className="mt-3 space-y-1.5 text-caption text-ink-500">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                    <span className="truncate">{report.locationName}</span>
                  </p>
                  <p className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <HeartPulse className="h-3.5 w-3.5 text-danger" />
                      <span className="tabular">{report.injuredCount}</span> injured
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Car className="h-3.5 w-3.5 text-ink-400" />
                      <span className="tabular">{report.vehicleCount}</span> vehicles
                    </span>
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <div className="min-w-0">
                    <p className="truncate text-caption font-medium text-ink-800">
                      {report.user.name}
                    </p>
                    <p className="tabular text-micro text-ink-400">
                      {new Date(report.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setSelected(report)}>
                    Review
                  </Button>
                </div>
              </div>
            </Surface>
          ))}
        </div>
      )}

      {/* ── Detail dialog ────────────────────────────────────────────────── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-4 sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-xl bg-surface shadow-overlay"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <TypeTag type={selected.type} />
                  <StatusPill status={selected.status} />
                </div>
                <h2 className="mt-2 text-title font-semibold text-ink-900">
                  {sentenceCase(selected.title)}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="shrink-0 rounded-xs p-1.5 text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {selected.photoUrl ? (
              <ReportPhoto src={selected.photoUrl} alt={selected.title} className="h-52 w-full" />
            ) : null}

            <div className="space-y-4 p-5">
              <p className="rounded-sm bg-ink-50 px-4 py-3 text-body leading-6 text-ink-700">
                {selected.description}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-sm border border-line p-3">
                  <p className="text-micro font-medium text-ink-500">Location</p>
                  <p className="mt-1 text-body font-medium text-ink-900">
                    {selected.locationName}
                  </p>
                  <p className="tabular mt-0.5 text-caption text-ink-500">
                    {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}
                  </p>
                </div>
                <div className="rounded-sm border border-line p-3">
                  <p className="text-micro font-medium text-ink-500">Reporter</p>
                  <p className="mt-1 text-body font-medium text-ink-900">{selected.user.name}</p>
                  <p className="mt-0.5 text-caption text-ink-500">
                    {selected.user.phone ?? selected.user.email}
                  </p>
                </div>
              </div>

              <div className="rounded-sm border border-line p-4">
                <label
                  htmlFor="update-notes"
                  className="text-body font-medium text-ink-800"
                >
                  Update status
                </label>
                <textarea
                  id="update-notes"
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  rows={2}
                  placeholder="Add dispatch or verification notes"
                  className="mt-2 w-full resize-none rounded-sm border border-line px-3 py-2 text-body text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={updating}
                    onClick={() => handleStatusUpdate(selected.id, 'VERIFIED')}
                  >
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    disabled={updating}
                    onClick={() => handleStatusUpdate(selected.id, 'DISPATCHED')}
                  >
                    Dispatch
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={updating}
                    onClick={() => handleStatusUpdate(selected.id, 'RESOLVED')}
                  >
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={updating}
                    onClick={() => handleStatusUpdate(selected.id, 'REJECTED')}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
