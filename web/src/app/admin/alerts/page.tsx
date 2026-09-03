"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BellRing, MapPin, Plus, Search, X } from 'lucide-react';
import {
  EmptyState,
  FilterChip,
  PageHeader,
  SearchInput,
  sentenceCase,
  Skeleton,
  Surface,
} from '@/components/ui';

interface RoadAlertItem {
  id: string;
  title: string;
  description: string;
  severity: string;
  alertType: string;
  locationName?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: { name: string };
}

type StatusFilter = 'ALL' | 'LIVE' | 'ENDED';

/* Severity is the only place colour carries meaning here, so it gets the
 * strongest treatment and everything else stays neutral. */
const SEVERITY: Record<string, { label: string; className: string }> = {
  CRITICAL: { label: 'Critical', className: 'bg-danger text-white' },
  HIGH: { label: 'High', className: 'bg-danger-soft text-danger-dark' },
  MEDIUM: { label: 'Medium', className: 'bg-warn-soft text-warn-dark' },
  LOW: { label: 'Low', className: 'bg-ink-50 text-ink-600' },
};

const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<RoadAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [query, setQuery] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/alerts');
      const data = await res.json();
      if (Array.isArray(data.alerts)) {
        setAlerts(
          data.alerts.map((item: Record<string, unknown>) => ({
            id: String(item.id ?? ''),
            title: String(item.title ?? 'Untitled alert'),
            description: String(item.description ?? ''),
            severity: String(item.severity ?? 'MEDIUM'),
            alertType: String(item.alertType ?? 'ROAD ALERT'),
            locationName:
              typeof item.locationName === 'string'
                ? item.locationName
                : typeof item.location === 'string'
                ? item.location
                : undefined,
            isActive: Boolean(item.isActive ?? item.active),
            createdAt: String(item.createdAt ?? item.created_at ?? new Date().toISOString()),
            createdBy:
              item.createdBy && typeof item.createdBy === 'object' && 'name' in item.createdBy
                ? { name: String((item.createdBy as { name?: unknown }).name ?? 'MTTD Command') }
                : { name: 'MTTD Command' },
          }))
        );
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const liveCount = alerts.filter((a) => a.isActive).length;

  const filtered = alerts
    .filter((a) => {
      if (status === 'LIVE' && !a.isActive) return false;
      if (status === 'ENDED' && a.isActive) return false;
      const q = query.toLowerCase().trim();
      return (
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        (a.locationName ?? '').toLowerCase().includes(q)
      );
    })
    // Live first, then by severity, then newest — the order an operator scans in.
    .sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      const sev = (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
      if (sev !== 0) return sev;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div>
      <PageHeader
        title="Alerts"
        description="Broadcasts pushed to every active mobile user."
        actions={
          <Link
            href="/admin/alerts/new"
            className="inline-flex h-10 items-center gap-2 rounded-sm bg-brand px-4 text-body font-semibold text-white transition-colors hover:bg-brand-press"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            New broadcast
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by title, road or description"
          icon={Search}
          clearIcon={X}
        />
        <FilterChip
          label="All"
          count={alerts.length}
          active={status === 'ALL'}
          onClick={() => setStatus('ALL')}
        />
        <FilterChip
          label="Live"
          count={liveCount}
          active={status === 'LIVE'}
          onClick={() => setStatus('LIVE')}
        />
        <FilterChip
          label="Ended"
          count={alerts.length - liveCount}
          active={status === 'ENDED'}
          onClick={() => setStatus('ENDED')}
        />
      </div>

      {/* ── List ──────────────────────────────────────────────────────────
          A table, not a stack of full-width cards. Cards forced the eye
          across the whole viewport to connect a title on the left with its
          timestamp on the right; columns keep related values aligned and let
          an operator scan twenty alerts without scrolling. */}
      <Surface className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-ink-50/60">
                <th scope="col" className="px-4 py-3 text-micro font-semibold text-ink-600">
                  Severity
                </th>
                <th scope="col" className="px-4 py-3 text-micro font-semibold text-ink-600">
                  Alert
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-micro font-semibold text-ink-600 md:table-cell"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-micro font-semibold text-ink-600 lg:table-cell"
                >
                  Broadcast by
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-micro font-semibold text-ink-600"
                >
                  Sent
                </th>
                <th scope="col" className="px-4 py-3 text-micro font-semibold text-ink-600">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    <td className="px-4 py-4">
                      <Skeleton className="h-5 w-16 rounded-xs" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-52" />
                      <Skeleton className="mt-2 h-3 w-72" />
                    </td>
                    <td className="hidden px-4 py-4 md:table-cell">
                      <Skeleton className="h-3 w-28" />
                    </td>
                    <td className="hidden px-4 py-4 lg:table-cell">
                      <Skeleton className="h-3 w-24" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-3 w-20" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-12" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={BellRing}
                      title={alerts.length === 0 ? 'No alerts broadcast yet' : 'Nothing matches'}
                      description={
                        alerts.length === 0
                          ? 'Broadcasts you send reach every active mobile user immediately.'
                          : 'Try a different search or status.'
                      }
                      action={
                        alerts.length === 0 ? (
                          <Link
                            href="/admin/alerts/new"
                            className="inline-flex h-10 items-center gap-2 rounded-sm bg-brand px-4 text-body font-semibold text-white transition-colors hover:bg-brand-press"
                          >
                            <Plus className="h-4 w-4" />
                            New broadcast
                          </Link>
                        ) : null
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((alert) => {
                  const sev = SEVERITY[alert.severity] ?? {
                    label: sentenceCase(alert.severity),
                    className: 'bg-ink-50 text-ink-600',
                  };
                  const sent = new Date(alert.createdAt);
                  return (
                    <tr
                      key={alert.id}
                      className="border-b border-line align-top transition-colors last:border-0 hover:bg-ink-50/60"
                    >
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-xs px-2 py-1 text-micro font-semibold ${sev.className}`}
                        >
                          {sev.label}
                        </span>
                      </td>

                      <td className="max-w-md px-4 py-4">
                        <p className="text-body font-semibold text-ink-900">{alert.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-caption text-ink-500">
                          {alert.description}
                        </p>
                        <p className="mt-1.5 text-micro text-ink-400 md:hidden">
                          {alert.locationName ?? 'Network-wide'} · {sentenceCase(alert.alertType)}
                        </p>
                        <p className="mt-1.5 hidden text-micro text-ink-400 md:block">
                          {sentenceCase(alert.alertType)}
                        </p>
                      </td>

                      <td className="hidden px-4 py-4 md:table-cell">
                        {alert.locationName ? (
                          <span className="flex items-start gap-1.5 text-caption text-ink-600">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
                            {alert.locationName}
                          </span>
                        ) : (
                          <span className="text-caption text-ink-400">Network-wide</span>
                        )}
                      </td>

                      <td className="hidden whitespace-nowrap px-4 py-4 text-caption text-ink-600 lg:table-cell">
                        {alert.createdBy.name}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <p className="tabular text-caption text-ink-700">
                          {sent.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="tabular text-micro text-ink-400">
                          {sent.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        {alert.isActive ? (
                          <span className="flex items-center gap-1.5 whitespace-nowrap text-caption font-medium text-ok">
                            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                            Live
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 whitespace-nowrap text-caption text-ink-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
                            Ended
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Surface>
    </div>
  );
}
