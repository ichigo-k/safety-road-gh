"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Flame, MapPin, RefreshCw, Search, X } from 'lucide-react';
import {
  Button,
  EmptyState,
  FilterChip,
  Metric,
  PageHeader,
  SearchInput,
  sentenceCase,
  Skeleton,
  Surface,
} from '@/components/ui';

interface Hotspot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusM: number;
  riskScore: number;
  currentRisk: number;
  severity: string;
  dominantType: string;
  incidentCount: number;
  casualtyCount: number;
  hourProfile: number[];
  status: string;
  source: string;
  notes: string | null;
  lastIncidentAt: string | null;
}

type StatusFilter = 'ALL' | 'ACTIVE' | 'MONITORING' | 'UNDER_REPAIR' | 'MITIGATED';

const STATUS_META: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-danger-soft text-danger-dark' },
  MONITORING: { label: 'Monitoring', className: 'bg-warn-soft text-warn-dark' },
  UNDER_REPAIR: { label: 'Under repair', className: 'bg-info-soft text-info-dark' },
  MITIGATED: { label: 'Mitigated', className: 'bg-ok-soft text-ok' },
};

const SEVERITY_CLASS: Record<string, string> = {
  CRITICAL: 'bg-danger text-white',
  HIGH: 'bg-danger-soft text-danger-dark',
  MEDIUM: 'bg-warn-soft text-warn-dark',
  LOW: 'bg-ink-50 text-ink-600',
};

/* ── Hour profile sparkline ───────────────────────────────────────────────
 * 24 bars, one per hour. This is the whole argument for time-of-day scoring
 * in one glance: a junction whose bars pile up at 22:00 is not the same
 * problem at 09:00, and an operator can see that without reading a number.
 * ---------------------------------------------------------------------- */
function HourProfile({ profile, peakHour }: { profile: number[]; peakHour: number }) {
  if (!Array.isArray(profile) || profile.length !== 24) return null;
  return (
    <div className="flex items-end gap-[2px]" aria-hidden="true">
      {profile.map((v, hour) => (
        <span
          key={hour}
          title={`${String(hour).padStart(2, '0')}:00`}
          className={`w-[3px] rounded-[1px] ${hour === peakHour ? 'bg-danger' : 'bg-ink-300'}`}
          style={{ height: `${Math.max(2, v * 22)}px` }}
        />
      ))}
    </div>
  );
}

export default function AdminHotspotsPage() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [query, setQuery] = useState('');
  const [hour, setHour] = useState<number>(new Date().getHours());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async (atHour: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/hotspots?includeInactive=true&hour=${atHour}`);
      const data = await res.json();
      setHotspots(Array.isArray(data.hotspots) ? data.hotspots : []);
    } catch {
      setError('Could not load hotspots. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(hour);
  }, [load, hour]);

  const recompute = async () => {
    setBusyId('recompute');
    setError('');
    setNotice('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/v1/hotspots/recompute', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        setNotice(
          `Rebuilt ${data.hotspotsCreated} hotspots from ${data.incidentsProcessed} incidents.` +
            (data.statusPreserved ? ` Kept ${data.statusPreserved} manual status change(s).` : '')
        );
        load(hour);
      } else {
        setError(data.error ?? 'Recompute failed. Your session may have expired.');
      }
    } catch {
      setError('Network error during recompute.');
    } finally {
      setBusyId(null);
    }
  };

  const setHotspotStatus = async (id: string, next: string) => {
    setBusyId(id);
    setError('');
    setNotice('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/v1/hotspots/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        // Optimistic local update — the list is long and a full refetch would
        // scroll the operator away from the row they just changed.
        setHotspots((prev) => prev.map((h) => (h.id === id ? { ...h, status: next } : h)));
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Update failed. Your session may have expired.');
      }
    } catch {
      setError('Network error. The change was not saved.');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = hotspots.filter((h) => {
    if (status !== 'ALL' && h.status !== status) return false;
    const q = query.toLowerCase().trim();
    return !q || h.name.toLowerCase().includes(q);
  });

  const counts = {
    all: hotspots.length,
    active: hotspots.filter((h) => h.status === 'ACTIVE').length,
    critical: hotspots.filter((h) => h.severity === 'CRITICAL').length,
    mitigated: hotspots.filter((h) => h.status === 'MITIGATED').length,
  };

  return (
    <div>
      <PageHeader
        title="Hotspots"
        description="Accident-prone areas scored from incident reports. Drivers are warned before entering an active one."
        actions={
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={recompute}
            disabled={busyId === 'recompute'}
          >
            {busyId === 'recompute' ? 'Rebuilding…' : 'Rebuild from incidents'}
          </Button>
        }
      />

      {error ? (
        <div role="alert" className="mb-5 rounded-sm bg-danger-soft px-4 py-3 text-body text-danger-dark">
          {error}
        </div>
      ) : null}
      {notice ? (
        <div role="status" className="mb-5 rounded-sm bg-ok-soft px-4 py-3 text-body text-ok">
          {notice}
        </div>
      ) : null}

      <Surface className="mb-5 grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
        {[
          { label: 'Total hotspots', value: counts.all, tone: 'neutral' as const },
          { label: 'Actively warning', value: counts.active, tone: 'danger' as const },
          { label: 'Critical', value: counts.critical, tone: 'danger' as const },
          { label: 'Mitigated', value: counts.mitigated, tone: 'ok' as const },
        ].map(({ label, value, tone }) => (
          <div key={label} className="px-5 py-4">
            {loading ? <Skeleton className="h-8 w-12" /> : <Metric label={label} value={value} tone={tone} />}
          </div>
        ))}
      </Surface>

      {/* ── Time-of-day scrubber ──────────────────────────────────────────
          Risk is not constant. Dragging this re-scores every hotspot for that
          hour, so an operator can see which junctions turn dangerous at night
          and plan patrols against it. */}
      <Surface className="mb-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-body font-semibold text-ink-900">Risk at time of day</p>
            <p className="mt-0.5 text-micro text-ink-500">
              Scores below are adjusted for the selected hour.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="tabular w-16 text-title font-semibold text-ink-900">
              {String(hour).padStart(2, '0')}:00
            </span>
            <Button variant="ghost" size="sm" onClick={() => setHour(new Date().getHours())}>
              Now
            </Button>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={23}
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          aria-label="Hour of day"
          className="mt-4 w-full accent-[var(--color-brand)]"
        />
        <div className="mt-1 flex justify-between text-micro text-ink-400">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </Surface>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by place name"
          icon={Search}
          clearIcon={X}
        />
        {(
          [
            ['ALL', 'All', counts.all],
            ['ACTIVE', 'Active', counts.active],
            ['MONITORING', 'Monitoring', undefined],
            ['UNDER_REPAIR', 'Under repair', undefined],
            ['MITIGATED', 'Mitigated', counts.mitigated],
          ] as [StatusFilter, string, number | undefined][]
        ).map(([id, label, count]) => (
          <FilterChip
            key={id}
            label={label}
            count={count}
            active={status === id}
            onClick={() => setStatus(id)}
          />
        ))}
      </div>

      <Surface className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-ink-50/60">
                <th scope="col" className="px-4 py-3 text-micro font-semibold text-ink-600">Severity</th>
                <th scope="col" className="px-4 py-3 text-micro font-semibold text-ink-600">Location</th>
                <th scope="col" className="px-4 py-3 text-micro font-semibold text-ink-600">Risk now</th>
                <th scope="col" className="hidden px-4 py-3 text-micro font-semibold text-ink-600 lg:table-cell">
                  When it happens
                </th>
                <th scope="col" className="hidden px-4 py-3 text-micro font-semibold text-ink-600 md:table-cell">
                  Incidents
                </th>
                <th scope="col" className="px-4 py-3 text-micro font-semibold text-ink-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    <td className="px-4 py-4"><Skeleton className="h-5 w-16 rounded-xs" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="hidden px-4 py-4 lg:table-cell"><Skeleton className="h-5 w-24" /></td>
                    <td className="hidden px-4 py-4 md:table-cell"><Skeleton className="h-4 w-10" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-8 w-32 rounded-sm" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Flame}
                      title={hotspots.length === 0 ? 'No hotspots yet' : 'Nothing matches'}
                      description={
                        hotspots.length === 0
                          ? 'Hotspots are derived from incident reports. Rebuild once you have some.'
                          : 'Try a different status or clear the search.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((h) => {
                  const peakHour = h.hourProfile?.length === 24
                    ? h.hourProfile.indexOf(Math.max(...h.hourProfile))
                    : -1;
                  return (
                    <tr key={h.id} className="border-b border-line align-top last:border-0 hover:bg-ink-50/60">
                      <td className="px-4 py-4">
                        <span className={`inline-flex whitespace-nowrap rounded-xs px-2 py-1 text-micro font-semibold ${SEVERITY_CLASS[h.severity] ?? 'bg-ink-50 text-ink-600'}`}>
                          {sentenceCase(h.severity)}
                        </span>
                      </td>

                      <td className="max-w-xs px-4 py-4">
                        <p className="text-body font-semibold text-ink-900">{h.name}</p>
                        <p className="tabular mt-0.5 flex items-center gap-1 text-micro text-ink-500">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)} · {h.radiusM} m
                        </p>
                        {h.source === 'OFFICIAL' ? (
                          <span className="mt-1.5 inline-flex rounded-xs bg-info-soft px-2 py-0.5 text-micro font-semibold text-info-dark">
                            Official
                          </span>
                        ) : null}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <p className="tabular text-title font-semibold text-ink-900">
                          {Math.round(h.currentRisk)}
                        </p>
                        <p className="tabular text-micro text-ink-400">peak {Math.round(h.riskScore)}</p>
                      </td>

                      <td className="hidden px-4 py-4 lg:table-cell">
                        <HourProfile profile={h.hourProfile} peakHour={peakHour} />
                        <p className="mt-1 text-micro text-ink-500">
                          {peakHour >= 0 ? `worst around ${String(peakHour).padStart(2, '0')}:00` : '—'}
                        </p>
                      </td>

                      <td className="hidden whitespace-nowrap px-4 py-4 md:table-cell">
                        <p className="tabular text-body text-ink-700">{h.incidentCount}</p>
                        {h.casualtyCount > 0 ? (
                          <p className="tabular text-micro text-danger">{h.casualtyCount} injured</p>
                        ) : null}
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={h.status}
                          disabled={busyId === h.id}
                          onChange={(e) => setHotspotStatus(h.id, e.target.value)}
                          aria-label={`Status for ${h.name}`}
                          className={`rounded-xs px-2 py-1.5 text-micro font-semibold outline-none transition-colors disabled:opacity-50 ${
                            STATUS_META[h.status]?.className ?? 'bg-ink-50 text-ink-600'
                          }`}
                        >
                          {Object.entries(STATUS_META).map(([value, meta]) => (
                            <option key={value} value={value}>
                              {meta.label}
                            </option>
                          ))}
                        </select>
                        {h.status === 'MITIGATED' ? (
                          <p className="mt-1 text-micro text-ink-400">Drivers are not warned</p>
                        ) : null}
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
