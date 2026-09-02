"use client";

import React, { useEffect, useState } from 'react';
import { BellRing, MapPin, Plus, X } from 'lucide-react';

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

/* ── Skeleton: matches a single alert row ────────────────────────── */
function AlertRowSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[#e5e5e5] bg-white p-4">
      {/* icon placeholder */}
      <div className="skeleton h-10 w-10 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="skeleton h-4 w-14 rounded-full" />
          <div className="skeleton h-4 w-20 rounded-full" />
        </div>
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-4/5" />
      </div>
      <div className="shrink-0 space-y-1.5 text-right">
        <div className="skeleton h-3 w-20 ml-auto" />
        <div className="skeleton h-3 w-16 ml-auto" />
      </div>
    </div>
  );
}

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: 'bg-red-600   text-white',
  HIGH: 'bg-red-50    text-red-700  border border-red-200',
  MEDIUM: 'bg-amber-50  text-amber-700 border border-amber-200',
  LOW: 'bg-[#f0f0f0] text-[#555555] border border-[#e5e5e5]',
};

const SEVERITY_ICON: Record<string, string> = {
  CRITICAL: 'bg-red-50   text-red-600',
  HIGH: 'bg-red-50   text-red-500',
  MEDIUM: 'bg-amber-50 text-amber-500',
  LOW: 'bg-[#f7f7f7] text-[#999999]',
};

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<RoadAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('HIGH');
  const [alertType, setAlertType] = useState('TRAFFIC');
  const [locationName, setLocationName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/alerts');
      const data = await res.json();
      if (Array.isArray(data.alerts)) {
        setAlerts(data.alerts.map((item: Record<string, unknown>) => ({
          id: String(item.id ?? ''),
          title: String(item.title ?? 'Untitled alert'),
          description: String(item.description ?? ''),
          severity: String(item.severity ?? 'MEDIUM'),
          alertType: String(item.alertType ?? 'ROAD ALERT'),
          locationName: typeof item.locationName === 'string' ? item.locationName : typeof item.location === 'string' ? item.location : undefined,
          isActive: Boolean(item.isActive ?? item.active),
          createdAt: String(item.createdAt ?? item.created_at ?? new Date().toISOString()),
          createdBy: item.createdBy && typeof item.createdBy === 'object' && 'name' in item.createdBy
            ? { name: String((item.createdBy as { name?: unknown }).name ?? 'MTTD Command') }
            : { name: 'MTTD Command' },
        })));
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/api/v1/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, description, severity, alertType, locationName }),
      });
      if (res.ok) {
        setShowDrawer(false);
        setTitle(''); setDescription(''); setLocationName('');
        fetchAlerts();
      } else {
        alert('Failed. Are you logged in as admin?');
      }
    } catch { alert('Network error'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e5e5e5] pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-[#111111]">Alerts</h1>
          <p className="mt-1 text-sm text-[#999999]">Broadcast emergency traffic, weather, and accident alerts.</p>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#111111] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#333333] active:scale-[0.97]"
        >
          <Plus className="h-3.5 w-3.5" />
          New broadcast
        </button>
      </div>

      {/* ── Alert list ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <AlertRowSkeleton key={i} />)
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#e5e5e5] bg-white py-16 text-center">
            <BellRing className="mb-3 h-8 w-8 text-[#e5e5e5]" />
            <p className="text-[14px] font-semibold text-[#555555]">No alerts broadcast yet</p>
            <p className="mt-1 text-[12px] text-[#999999]">Create the first one above</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-4 rounded-xl border border-[#e5e5e5] bg-white p-4 transition hover:border-[#d1d1d1]"
            >
              {/* Icon */}
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${SEVERITY_ICON[alert.severity] ?? 'bg-[#f7f7f7] text-[#999999]'}`}>
                <BellRing className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SEVERITY_STYLES[alert.severity] ?? 'bg-[#f0f0f0] text-[#555555]'}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c4c4c4]">
                    {alert.alertType}
                  </span>
                  {alert.isActive && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#16a34a]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                      Live
                    </span>
                  )}
                </div>

                <h3 className="mt-1.5 text-[14px] font-bold text-[#111111]">{alert.title}</h3>
                <p className="mt-1 text-[12px] leading-5 text-[#555555]">{alert.description}</p>

                {alert.locationName && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#999999]">
                    <MapPin className="h-3 w-3" />
                    {alert.locationName}
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="shrink-0 text-right text-[11px] text-[#999999]">
                <p className="font-semibold text-[#555555]">{alert.createdBy.name}</p>
                <p className="mt-0.5">
                  {new Date(alert.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
                <p>
                  {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Side drawer ────────────────────────────────────────────── */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-[−8px_0_40px_rgba(0,0,0,0.12)]">

            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4">
              <div>
                <h2 className="text-[15px] font-extrabold tracking-[-0.02em] text-[#111111]">Broadcast alert</h2>
                <p className="mt-0.5 text-[12px] text-[#999999]">Push to all active mobile users</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="rounded-lg p-1.5 text-[#999999] hover:bg-[#f7f7f7] hover:text-[#111111]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-4 px-5 py-5">

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#999999]">
                    Alert title *
                  </label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Heavy flooding on Weija-Kasoa Highway"
                    className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2.5 text-[13px] text-[#111111] outline-none placeholder:text-[#c4c4c4] focus:border-[#111111] transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#999999]">
                      Category
                    </label>
                    <select
                      value={alertType}
                      onChange={(e) => setAlertType(e.target.value)}
                      className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2.5 text-[13px] text-[#111111] outline-none focus:border-[#111111] transition"
                    >
                      <option value="TRAFFIC">Traffic</option>
                      <option value="ACCIDENT">Accident</option>
                      <option value="FLOODING">Flooding</option>
                      <option value="HAZARD">Hazard</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#999999]">
                      Severity
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2.5 text-[13px] text-[#111111] outline-none focus:border-[#111111] transition"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#999999]">
                    Affected location
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Accra-Tema Motorway"
                    className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2.5 text-[13px] text-[#111111] outline-none placeholder:text-[#c4c4c4] focus:border-[#111111] transition"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#999999]">
                    Description *
                  </label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Provide traffic advice and detour routes…"
                    className="w-full resize-none rounded-lg border border-[#e5e5e5] px-3 py-2.5 text-[13px] text-[#111111] outline-none placeholder:text-[#c4c4c4] focus:border-[#111111] transition"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-[#e5e5e5] px-5 py-4">
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="rounded-lg border border-[#e5e5e5] px-4 py-2 text-[13px] font-medium text-[#555555] transition hover:bg-[#f7f7f7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-[#111111] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#333333] disabled:opacity-50 active:scale-[0.97]"
                >
                  {submitting ? 'Broadcasting…' : 'Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
