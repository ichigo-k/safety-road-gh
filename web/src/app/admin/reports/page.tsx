"use client";

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Car,
  Eye,
  Filter,
  HeartPulse,
  MapPin,
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
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  history?: Array<{
    id: string;
    status: string;
    notes?: string;
    createdAt: string;
    changedBy: { name: string; role: string };
  }>;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [updateNotes, setUpdateNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/reports');
      const data = await res.json();
      if (data.reports) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/v1/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: newStatus,
          notes: updateNotes || `Status updated to ${newStatus} by MTTD Admin`,
        }),
      });

      if (res.ok) {
        setUpdateNotes('');
        setSelectedReport(null);
        fetchReports();
      } else {
        alert('Failed to update report status. Ensure you are signed in as Admin.');
      }
    } catch (err) {
      alert('Network error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesType = filterType === 'ALL' || r.type === filterType;
    const matchesQuery =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesQuery;
  });

  const summary = [
    { label: 'All reports', value: reports.length, tone: 'text-slate-900' },
    { label: 'Pending review', value: reports.filter((r) => r.status === 'PENDING').length, tone: 'text-amber-700' },
    { label: 'Verified', value: reports.filter((r) => r.status === 'VERIFIED').length, tone: 'text-blue-700' },
    { label: 'Resolved', value: reports.filter((r) => r.status === 'RESOLVED').length, tone: 'text-emerald-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0f6cbd]">Operations / reports</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em] text-slate-900">Accident &amp; hazard reports</h1>
          <p className="mt-1 text-sm text-slate-600">Review, verify, and update crowd-sourced road incidents.</p>
        </div>
        <button onClick={fetchReports} className="inline-flex items-center gap-2 self-start rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 md:self-auto">Refresh</button>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-4">
        {summary.map((item) => <div key={item.label} className="bg-white px-4 py-3"><p className="text-xs text-slate-500">{item.label}</p><p className={`mt-1 text-2xl font-semibold ${item.tone}`}>{item.value}</p></div>)}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, location, user..."
            className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-[#0f6cbd] focus:ring-1 focus:ring-[#0f6cbd]"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${showFilters ? 'border-[#0f6cbd] bg-[#eff6fc] text-[#0f6cbd]' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}><SlidersHorizontal className="h-4 w-4" /> Filters {(filterStatus !== 'ALL' || filterType !== 'ALL') && <span className="rounded-full bg-[#0f6cbd] px-1.5 text-xs text-white">{Number(filterStatus !== 'ALL') + Number(filterType !== 'ALL')}</span>}</button>
        <span className="text-xs text-slate-500 sm:ml-auto">Showing {filteredReports.length} of {reports.length}</span>
        </div>
        {showFilters && <div className="border-t border-slate-200 bg-slate-50/70 p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-end"><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Report type</label><select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0f6cbd]"><option value="ALL">All types</option><option value="ACCIDENT">Accidents</option><option value="HAZARD">Hazards</option></select></div><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Status</label><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0f6cbd]"><option value="ALL">All statuses</option><option value="PENDING">Pending</option><option value="VERIFIED">Verified</option><option value="DISPATCHED">Dispatched</option><option value="RESOLVED">Resolved</option></select></div><button onClick={() => { setFilterType('ALL'); setFilterStatus('ALL'); setSearchQuery(''); }} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-[#0f6cbd] hover:bg-white"> <X className="h-4 w-4" /> Clear filters</button></div></div>}
        {/* The filter drawer keeps the command bar calm while retaining fast filtering. */}
        <div className="hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Type:</span>
          </span>
          {['ALL', 'ACCIDENT', 'HAZARD'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterType === t ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}

          <span className="ml-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Status:</span>
          {['ALL', 'PENDING', 'VERIFIED', 'RESOLVED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterStatus === s ? 'bg-amber-500 text-slate-950' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div></div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">Loading reports from Neon DB...</div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">No matching reports found.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredReports.map((report) => (
            <div key={report.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              {report.photoUrl && (
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img src={report.photoUrl} alt={report.title} className="h-full w-full object-cover" />
                  <div className="absolute right-3 top-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      report.status === 'PENDING' ? 'bg-amber-500 text-slate-950' :
                      report.status === 'VERIFIED' ? 'bg-blue-600 text-white' :
                      report.status === 'RESOLVED' ? 'bg-emerald-600 text-white' :
                      'bg-slate-700 text-white'}`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-1 flex-col p-5">
                {!report.photoUrl && (
                  <div className="mb-3 flex items-center justify-between">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${
                      report.type === 'ACCIDENT' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}>
                      {report.type}
                    </span>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                      report.status === 'PENDING' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                      report.status === 'VERIFIED' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                      'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                )}

                <h3 className="text-base font-semibold text-slate-900">{report.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{report.description}</p>

                <div className="mt-4 space-y-2 border-t border-slate-200 pt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{report.locationName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <HeartPulse className="h-3.5 w-3.5 text-red-500" />
                      {report.injuredCount} injured
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Car className="h-3.5 w-3.5 text-blue-500" />
                      {report.vehicleCount} vehicles
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs text-slate-500">
                  <p className="font-medium text-slate-800">{report.user.name}</p>
                  <p>{new Date(report.createdAt).toLocaleDateString('en-GB')}</p>
                </div>
                <button onClick={() => setSelectedReport(report)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                  <Eye className="h-3.5 w-3.5 text-amber-600" />
                  Inspect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">Incident inspection ({selectedReport.type})</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">{selectedReport.title}</h2>
              </div>
              <button type="button" onClick={() => setSelectedReport(null)} className="text-slate-500 hover:text-slate-900">?</button>
            </div>

            {selectedReport.photoUrl && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img src={selectedReport.photoUrl} alt={selectedReport.title} className="h-64 w-full object-cover" />
              </div>
            )}

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">{selectedReport.description}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Location</p>
                  <p className="mt-2 font-medium text-slate-900">{selectedReport.locationName}</p>
                  <p className="mt-1 text-xs text-slate-500">GPS: {selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Reporter</p>
                  <p className="mt-2 font-medium text-slate-900">{selectedReport.user.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{selectedReport.user.phone || selectedReport.user.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Update report status</h4>
              <textarea
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                placeholder="Add official dispatch or verification notes..."
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-400"
                rows={2}
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <button disabled={updating} onClick={() => handleStatusUpdate(selectedReport.id, 'VERIFIED')} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60">Mark as VERIFIED</button>
                <button disabled={updating} onClick={() => handleStatusUpdate(selectedReport.id, 'DISPATCHED')} className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60">Dispatch responders</button>
                <button disabled={updating} onClick={() => handleStatusUpdate(selectedReport.id, 'RESOLVED')} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60">Mark as RESOLVED</button>
                <button disabled={updating} onClick={() => handleStatusUpdate(selectedReport.id, 'REJECTED')} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-60">Reject report</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
