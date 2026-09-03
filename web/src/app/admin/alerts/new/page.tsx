"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, MapPin, Radio } from 'lucide-react';
import { Button, Surface } from '@/components/ui';
import LocationPicker, { type PickedLocation } from '@/components/LocationPicker';

const CATEGORIES = [
  { value: 'TRAFFIC', label: 'Traffic' },
  { value: 'ACCIDENT', label: 'Accident' },
  { value: 'FLOODING', label: 'Flooding' },
  { value: 'HAZARD', label: 'Hazard' },
];

const SEVERITIES = [
  { value: 'LOW', label: 'Low', hint: 'Informational. No action needed.' },
  { value: 'MEDIUM', label: 'Medium', hint: 'Drivers should plan around it.' },
  { value: 'HIGH', label: 'High', hint: 'Avoid the area if possible.' },
  { value: 'CRITICAL', label: 'Critical', hint: 'Immediate danger to life.' },
];

const PREVIEW_TONE: Record<string, string> = {
  CRITICAL: 'bg-danger text-white',
  HIGH: 'bg-danger-soft text-danger-dark',
  MEDIUM: 'bg-warn-soft text-warn-dark',
  LOW: 'bg-ink-50 text-ink-600',
};

const fieldClass =
  'w-full rounded-sm border border-line bg-surface px-3 py-2.5 text-body text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand';

export default function NewBroadcastPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('HIGH');
  const [alertType, setAlertType] = useState('TRAFFIC');
  // An explicitly chosen place, or null for a network-wide broadcast. The
  // form can no longer end up "sort of" targeted: either coordinates were
  // picked or they were not.
  const [place, setPlace] = useState<PickedLocation | null>(null);
  const [radiusKm, setRadiusKm] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/v1/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          description,
          severity,
          alertType,
          locationName: place?.name ?? '',
          latitude: place?.latitude,
          longitude: place?.longitude,
          radiusKm: place ? radiusKm : undefined,
        }),
      });
      if (res.ok) {
        router.push('/admin/alerts');
        router.refresh();
      } else {
        setError('Broadcast failed. Your session may have expired — sign in again.');
      }
    } catch {
      setError('Network error. Nothing was sent.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeSeverity = SEVERITIES.find((s) => s.value === severity);

  return (
    <div>
      {/* Back out of the flow without losing your place. */}
      <Link
        href="/admin/alerts"
        className="mb-5 inline-flex items-center gap-1.5 text-body text-ink-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Alerts
      </Link>

      <header className="mb-6">
        <h1 className="text-display font-semibold text-ink-900">New broadcast</h1>
        <p className="mt-1 text-body text-ink-500">
          This goes to every active mobile user immediately. There is no recall.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ── Composer ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <Surface className="p-5 sm:p-6">
            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-body font-medium text-ink-800">
                  Alert title
                </label>
                <input
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Heavy flooding on Weija-Kasoa Highway"
                  className={fieldClass}
                />
                <p className="mt-1.5 text-micro text-ink-500">
                  Lead with the road and the problem — this is all most people read.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-1.5 block text-body font-medium text-ink-800"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value)}
                    className={fieldClass}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="severity"
                    className="mb-1.5 block text-body font-medium text-ink-800"
                  >
                    Severity
                  </label>
                  <select
                    id="severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className={fieldClass}
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {activeSeverity ? (
                    <p className="mt-1.5 text-micro text-ink-500">{activeSeverity.hint}</p>
                  ) : null}
                </div>
              </div>

              <div>
                <LocationPicker value={place} onChange={setPlace} />

                {place ? (
                  <div className="mt-3 rounded-sm bg-ink-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label htmlFor="radius" className="text-body font-medium text-ink-800">
                        Only alert drivers within
                      </label>
                      <span className="tabular text-body font-semibold text-ink-900">
                        {radiusKm} km
                      </span>
                    </div>
                    <input
                      id="radius"
                      type="range"
                      min={1}
                      max={100}
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      className="mt-2 w-full accent-[var(--color-brand)]"
                    />
                    <p className="mt-1.5 text-micro text-ink-500">
                      Devices outside this radius will not be interrupted, though the
                      alert stays visible to them under &ldquo;elsewhere&rdquo;.
                    </p>
                  </div>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-body font-medium text-ink-800"
                >
                  Details
                </label>
                <textarea
                  id="description"
                  required
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is happening, and what should drivers do instead?"
                  className={`${fieldClass} resize-none`}
                />
              </div>

              {error ? (
                <p
                  role="alert"
                  className="rounded-sm bg-danger-soft px-3.5 py-2.5 text-body font-medium text-danger-dark"
                >
                  {error}
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-5">
              <Link
                href="/admin/alerts"
                className="inline-flex h-10 items-center rounded-sm border border-line-strong px-4 text-body font-semibold text-ink-800 transition-colors hover:bg-ink-50"
              >
                Cancel
              </Link>
              <Button type="submit" icon={Radio} disabled={submitting}>
                {submitting ? 'Broadcasting…' : 'Send broadcast'}
              </Button>
            </div>
          </Surface>
        </form>

        {/* ── Preview ──────────────────────────────────────────────────────
            A broadcast is irreversible and public, so showing what it will
            look like on a phone is part of the task, not decoration. */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Surface className="p-5">
            <p className="text-body font-semibold text-ink-900">Preview</p>
            <p className="mt-0.5 text-micro text-ink-500">How this appears in the mobile app.</p>

            <div className="mt-4 rounded-sm border border-line p-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-xs px-2 py-1 text-micro font-semibold ${
                    PREVIEW_TONE[severity] ?? 'bg-ink-50 text-ink-600'
                  }`}
                >
                  {activeSeverity?.label ?? severity}
                </span>
                <span className="text-micro text-ink-500">
                  {CATEGORIES.find((c) => c.value === alertType)?.label}
                </span>
              </div>

              <p className="mt-2.5 text-body font-semibold text-ink-900">
                {title || 'Alert title appears here'}
              </p>
              <p className="mt-1 line-clamp-3 text-caption text-ink-500">
                {description || 'The details you write will show underneath the title.'}
              </p>

              <p className="mt-2.5 flex items-center gap-1.5 text-micro text-ink-400">
                <MapPin className="h-3.5 w-3.5" />
                {place ? `${place.name} · within ${radiusKm} km` : 'Network-wide'}
              </p>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-sm bg-warn-soft px-3 py-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" strokeWidth={2.2} />
              <p className="text-micro text-warn-dark">
                Sending cannot be undone. Check the road name and the advice before you send.
              </p>
            </div>
          </Surface>
        </aside>
      </div>
    </div>
  );
}
