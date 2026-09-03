"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Car,
  ChevronRight,
  FileText,
  HeartPulse,
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
import { formatReportDate, ReportPhoto, type ReportItem } from './shared';

type StatusFilter = 'ALL' | 'PENDING' | 'VERIFIED' | 'DISPATCHED' | 'RESOLVED' | 'REJECTED';
type TypeFilter = 'ALL' | 'ACCIDENT' | 'HAZARD';

/* One row per report.
 *
 * This was a three-column grid of cards. Cards gave each report a big photo
 * and a lot of padding, which meant three or four reports filled the screen
 * and comparing them meant scrolling. A queue that gets worked top to bottom
 * reads better as a list: same fields, aligned in columns, many more visible
 * at once. */
function ReportRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <Skeleton className="h-12 w-12 shrink-0 rounded-sm" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="mt-2 h-3 w-2/3" />
      </div>
      <Skeleton className="hidden h-5 w-20 rounded-xs sm:block" />
    </div>
  );
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('ALL');
  const [filterType, setFilterType] = useState<TypeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
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

      {/* ── List ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <Surface className="divide-y divide-line">
          {Array.from({ length: 8 }).map((_, i) => (
            <ReportRowSkeleton key={i} />
          ))}
        </Surface>
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
        <Surface className="divide-y divide-line overflow-hidden">
          {filtered.map((report) => (
            <Link
              key={report.id}
              href={`/admin/reports/${report.id}`}
              className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-ink-50 focus:bg-ink-50 focus:outline-none"
            >
              {/* Thumbnail: enough to recognise the scene, not enough to
                  dominate the row. */}
              {report.photoUrl ? (
                <ReportPhoto
                  src={report.photoUrl}
                  alt=""
                  compact
                  className="h-12 w-12 shrink-0 rounded-sm bg-ink-50"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-ink-50">
                  <FileText className="h-4 w-4 text-ink-400" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-body font-semibold text-ink-900">
                    {sentenceCase(report.title)}
                  </span>
                  <TypeTag type={report.type} />
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-caption text-ink-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                  <span className="truncate">{report.locationName}</span>
                </p>
              </div>

              {/* Casualty counts: the number that decides how urgent this is,
                  so it gets its own aligned column instead of being buried in
                  a paragraph. */}
              <div className="hidden w-32 shrink-0 items-center gap-4 md:flex">
                <span className="flex items-center gap-1.5 text-caption text-ink-500">
                  <HeartPulse className="h-3.5 w-3.5 text-danger" />
                  <span className="tabular">{report.injuredCount}</span>
                </span>
                <span className="flex items-center gap-1.5 text-caption text-ink-500">
                  <Car className="h-3.5 w-3.5 text-ink-400" />
                  <span className="tabular">{report.vehicleCount}</span>
                </span>
              </div>

              <div className="hidden w-40 shrink-0 lg:block">
                <p className="truncate text-caption font-medium text-ink-800">
                  {report.user.name}
                </p>
                <p className="tabular text-micro text-ink-400">
                  {formatReportDate(report.createdAt)}
                </p>
              </div>

              <div className="shrink-0">
                <StatusPill status={report.status} />
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-ink-400" />
            </Link>
          ))}
        </Surface>
      )}
    </div>
  );
}
