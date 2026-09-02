"use client";

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Car,
  HeartPulse,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

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

/* ── Skeleton: matches report card layout ─────────────────────────── */
function ReportCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#e5e5e5] bg-white">
      {/* image placeholder */}
      <div className="skeleton h-40 w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <div className="skeleton h-4 w-16 rounded-full" />
          <div className="skeleton h-4 w-14 rounded-full" />
        </div>
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-7 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/* ── Status pill ──────────────────────────────────────────────────── */
const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50   text-amber-700  border border-amber-200',
  VERIFIED: 'bg-blue-50    text-blue-700   border border-blue-200',
  DISPATCHED: 'bg-purple-50  text-purple-700 border border-purple-200',
  RESOLVED: 'bg-[#f0f0f0]  text-[#555555]  border border-[#e5e5e5]',
  REJECTED: 'bg-red-50     text-red-700    border border-red-200',
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[status] ?? 'bg-[#f0f0f0] text-[#555555]'}`}>
      {status}
    </span>
  );
}

/* ── Type badge ───────────────────────────────────────────────────── */
function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${type === 'ACCIDENT'
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}>
      {type}
    </span>
  );
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<ReportItem | null>(null);
  const [updateNotes, setUpdateNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/reports');
      const data = await res.json();
      if (data.reports) setReports(data.reports);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdating(true);
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
      if (res.ok) { setUpdateNotes(''); setSelected(null); fetchReports(); }
      else alert('Update failed. Are you signed in?');
    } catch { alert('Network error'); }
    finally { setUpdating(false); }
  };

  const filtered = reports.filter((r) => {
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (filterType !== 'ALL' && r.type !== filterType) return false;
    const q = searchQuery.toLowerCase();
    return !q || r.title.toLowerCase().includes(q) || r.locationName.toLowerCase().includes(q) || r.user.name.toLowerCase().includes(q);
  });

  const counts = {
    all: reports.length,
    pending: reports.filter(r => r.status === 'PENDING').length,
    verified: reports.filter(r => r.status === 'VERIFIED').length,
    resolved: reports.filter(r => r.status === 'RESOLVED').length,
  };

  const activeFilters = Number(filterStatus !== 'ALL') + Number(filterType !== 'ALL');

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e5e5e5] pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-[#111111]">Reports</h1>
          <p className="mt-1 text-sm text-[#999999]">Accident and hazard submissions from the public.</p>
        </div>
        <button
          onClick={fetchReports}
          className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] font-medium text-[#555555] transition hover:bg-[#f7f7f7] active:scale-[0.97]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* ── Stat strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: counts.all, sub: 'submissions' },
          { label: 'Pending', value: counts.pending, sub: 'need review' },
          { label: 'Verified', value: counts.verified, sub: 'ready' },
          { label: 'Resolved', value: counts.resolved, sub: 'closed' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-3">
            {loading
              ? <div className="skeleton h-7 w-10" />
              : <p className="text-[26px] font-extrabold tracking-[-0.05em] text-[#111111]">{value}</p>
            }
            <p className="mt-0.5 text-[11px] font-semibold text-[#111111]">{label}</p>
            <p className="text-[10px] text-[#999999]">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white">
        <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#c4c4c4]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, location, user…"
              className="w-full rounded-lg border border-[#e5e5e5] py-2 pl-8 pr-3 text-[13px] text-[#111111] outline-none placeholder:text-[#c4c4c4] focus:border-[#111111] transition"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition ${showFilters || activeFilters > 0
                ? 'border-[#111111] bg-[#111111] text-white'
                : 'border-[#e5e5e5] text-[#555555] hover:bg-[#f7f7f7]'
              }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilters > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#111111]">
                {activeFilters}
              </span>
            )}
          </button>
          <span className="text-[12px] text-[#999999] sm:ml-auto">
            {filtered.length} of {reports.length}
          </span>
        </div>

        {showFilters && (
          <div className="border-t border-[#e5e5e5] bg-[#f7f7f7] px-4 py-3">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#999999]">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="rounded-lg border border-[#e5e5e5] bg-white px-2.5 py-1.5 text-[13px] text-[#111111] outline-none focus:border-[#111111]"
                >
                  <option value="ALL">All types</option>
                  <option value="ACCIDENT">Accidents</option>
                  <option value="HAZARD">Hazards</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#999999]">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-[#e5e5e5] bg-white px-2.5 py-1.5 text-[13px] text-[#111111] outline-none focus:border-[#111111]"
                >
                  <option value="ALL">All statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="DISPATCHED">Dispatched</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              {activeFilters > 0 && (
                <button
                  onClick={() => { setFilterType('ALL'); setFilterStatus('ALL'); setSearchQuery(''); }}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#555555] hover:text-[#111111]"
                >
                  <X className="h-3.5 w-3.5" /> Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Card grid ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <ReportCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#e5e5e5] bg-white py-16 text-center">
          <AlertTriangle className="mb-3 h-8 w-8 text-[#e5e5e5]" />
          <p className="text-[14px] font-semibold text-[#555555]">No reports found</p>
          <p className="mt-1 text-[12px] text-[#999999]">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((report) => (
            <div
              key={report.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#e5e5e5] bg-white transition hover:border-[#d1d1d1] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            >
              {report.photoUrl ? (
                <div className="relative h-40 overflow-hidden bg-[#f0f0f0]">
                  <img src={report.photoUrl} alt={report.title} className="h-full w-full object-cover" />
                  <div className="absolute right-2.5 top-2.5">
                    <StatusPill status={report.status} />
                  </div>
                </div>
              ) : (
                <div className={`flex h-12 items-center px-4 ${report.type === 'ACCIDENT' ? 'bg-red-50' : 'bg-amber-50'}`}>
                  <AlertTriangle className={`h-4 w-4 ${report.type === 'ACCIDENT' ? 'text-red-500' : 'text-amber-500'}`} />
                </div>
              )}

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between gap-2">
                  <TypeBadge type={report.type} />
                  {!report.photoUrl && <StatusPill status={report.status} />}
                </div>

                <h3 className="mt-2.5 text-[13px] font-bold leading-snug text-[#111111]">{report.title}</h3>
                <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#999999]">{report.description}</p>

                <div className="mt-3 space-y-1 text-[11px] text-[#999999]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{report.locationName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <HeartPulse className="h-3 w-3 text-red-400" />
                      {report.injuredCount} injured
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="h-3 w-3 text-[#c4c4c4]" />
                      {report.vehicleCount} vehicles
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] pt-3">
                  <div>
                    <p className="text-[11px] font-semibold text-[#111111]">{report.user.name}</p>
                    <p className="text-[10px] text-[#999999]">
                      {new Date(report.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(report)}
                    className="rounded-lg border border-[#e5e5e5] px-2.5 py-1.5 text-[11px] font-semibold text-[#111111] transition hover:bg-[#111111] hover:text-white active:scale-[0.97]"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Detail drawer ───────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/30 backdrop-blur-[2px] sm:items-center sm:justify-center p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.14)]">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#f0f0f0] px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <TypeBadge type={selected.type} />
                  <StatusPill status={selected.status} />
                </div>
                <h2 className="mt-2 text-[15px] font-extrabold tracking-[-0.02em] text-[#111111]">{selected.title}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-[#999999] hover:bg-[#f7f7f7] hover:text-[#111111]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {selected.photoUrl && (
              <div className="overflow-hidden bg-[#f0f0f0]">
                <img src={selected.photoUrl} alt={selected.title} className="h-52 w-full object-cover" />
              </div>
            )}

            <div className="p-5 space-y-4">
              <p className="rounded-xl bg-[#f7f7f7] px-4 py-3 text-[13px] leading-6 text-[#555555]">{selected.description}</p>

              <div className="grid gap-3 sm:grid-cols-2 text-[12px]">
                <div className="rounded-xl border border-[#e5e5e5] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#999999]">Location</p>
                  <p className="mt-1.5 font-semibold text-[#111111]">{selected.locationName}</p>
                  <p className="mt-0.5 text-[#999999]">{selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}</p>
                </div>
                <div className="rounded-xl border border-[#e5e5e5] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#999999]">Reporter</p>
                  <p className="mt-1.5 font-semibold text-[#111111]">{selected.user.name}</p>
                  <p className="mt-0.5 text-[#999999]">{selected.user.phone ?? selected.user.email}</p>
                </div>
              </div>

              {/* Status update */}
              <div className="rounded-xl border border-[#e5e5e5] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#999999]">Update status</p>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  rows={2}
                  placeholder="Add dispatch or verification notes…"
                  className="mt-2.5 w-full resize-none rounded-lg border border-[#e5e5e5] px-3 py-2 text-[13px] text-[#111111] outline-none placeholder:text-[#c4c4c4] focus:border-[#111111] transition"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { status: 'VERIFIED', label: 'Verify' },
                    { status: 'DISPATCHED', label: 'Dispatch' },
                    { status: 'RESOLVED', label: 'Resolve' },
                    { status: 'REJECTED', label: 'Reject' },
                  ].map(({ status, label }) => (
                    <button
                      key={status}
                      disabled={updating}
                      onClick={() => handleStatusUpdate(selected.id, status)}
                      className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition active:scale-[0.97] disabled:opacity-50 ${status === 'REJECTED'
                          ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                          : status === 'RESOLVED'
                            ? 'border border-[#e5e5e5] bg-[#f7f7f7] text-[#555555] hover:bg-[#efefef]'
                            : 'bg-[#111111] text-white hover:bg-[#333333]'
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
