"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Car, HeartPulse, MapPin, User } from 'lucide-react';
import {
  Button,
  PageHeader,
  Skeleton,
  StatusPill,
  sentenceCase,
  Surface,
  TypeTag,
} from '@/components/ui';
import { formatReportDate, ReportPhoto, type ReportItem } from '../shared';

/* ── Review a single report ───────────────────────────────────────────────────
 *
 * This was a modal over the reports list. Reviewing a report is the main task
 * here, not a glance: it carries the photo, the full description, the
 * reporter's contact details and four status actions that change what happens
 * to a real incident. A dialog gave that a cramped scroll box, no URL to send a
 * colleague, and no browser back button.
 * -------------------------------------------------------------------------- */

const STATUS_ACTIONS = [
  { status: 'VERIFIED', label: 'Verify', variant: 'primary' as const },
  { status: 'DISPATCHED', label: 'Dispatch', variant: 'primary' as const },
  { status: 'RESOLVED', label: 'Resolve', variant: 'secondary' as const },
  { status: 'REJECTED', label: 'Reject', variant: 'danger' as const },
];

function BackLink() {
  return (
    <Link
      href="/admin/reports"
      className="mb-4 inline-flex items-center gap-1.5 text-caption font-semibold text-ink-500 transition-colors hover:text-ink-900"
    >
      <ArrowLeft className="h-4 w-4" />
      All reports
    </Link>
  );
}

export default function AdminReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [report, setReport] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [updateNotes, setUpdateNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/reports/${id}`);
      if (res.status === 404) {
        setMissing(true);
        return;
      }
      const data = await res.json();
      if (data.report) setReport(data.report);
      else setError('Could not load this report.');
    } catch {
      setError('Could not load this report. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleStatusUpdate = async (status: string) => {
    if (!id) return;
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
        // Back to the queue: the next action is almost always the next report.
        router.push('/admin/reports');
      } else {
        setError('Update failed. Your session may have expired — sign in again.');
      }
    } catch {
      setError('Network error. The change was not saved.');
    } finally {
      setUpdating(false);
    }
  };

  if (missing) {
    return (
      <div>
        <BackLink />
        <Surface className="p-8 text-center">
          <h2 className="text-title font-semibold text-ink-900">Report not found</h2>
          <p className="mt-1 text-body text-ink-500">
            It may have been removed, or the link is out of date.
          </p>
        </Surface>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <BackLink />
        <Surface className="p-5">
          <Skeleton className="h-5 w-24 rounded-xs" />
          <Skeleton className="mt-3 h-7 w-2/3" />
          <Skeleton className="mt-5 h-52 w-full" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </Surface>
      </div>
    );
  }

  if (!report) {
    return (
      <div>
        <BackLink />
        <div role="alert" className="rounded-sm bg-danger-soft px-4 py-3 text-body text-danger-dark">
          {error || 'Could not load this report.'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackLink />

      <PageHeader
        title={sentenceCase(report.title)}
        description={`Reported ${formatReportDate(report.createdAt)} by ${report.user.name}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <TypeTag type={report.type} />
            <StatusPill status={report.status} />
          </div>
        }
      />

      {error ? (
        <div
          role="alert"
          className="mb-5 rounded-sm bg-danger-soft px-4 py-3 text-body text-danger-dark"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ── Evidence ─────────────────────────────────────────────────── */}
        <Surface className="overflow-hidden">
          {report.photoUrl ? (
            <ReportPhoto
              src={report.photoUrl}
              alt={report.title}
              className="max-h-[420px] w-full bg-ink-50"
            />
          ) : (
            <div className="flex h-40 items-center justify-center bg-ink-50 text-caption text-ink-400">
              No photo attached
            </div>
          )}
          <div className="p-5">
            <h2 className="text-micro font-medium uppercase tracking-wide text-ink-500">
              Description
            </h2>
            <p className="mt-2 text-body leading-6 text-ink-700">{report.description}</p>

            <div className="mt-5 flex flex-wrap gap-6 border-t border-line pt-4">
              <span className="flex items-center gap-2 text-body text-ink-700">
                <HeartPulse className="h-4 w-4 text-danger" />
                <span className="tabular font-semibold">{report.injuredCount}</span> injured
              </span>
              <span className="flex items-center gap-2 text-body text-ink-700">
                <Car className="h-4 w-4 text-ink-400" />
                <span className="tabular font-semibold">{report.vehicleCount}</span> vehicles
              </span>
            </div>
          </div>
        </Surface>

        {/* ── Context and actions ──────────────────────────────────────── */}
        <div className="space-y-5">
          <Surface className="p-5">
            <h2 className="flex items-center gap-2 text-micro font-medium uppercase tracking-wide text-ink-500">
              <MapPin className="h-3.5 w-3.5" />
              Location
            </h2>
            <p className="mt-2 text-body font-medium text-ink-900">{report.locationName}</p>
            <p className="tabular mt-0.5 text-caption text-ink-500">
              {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
            </p>
          </Surface>

          <Surface className="p-5">
            <h2 className="flex items-center gap-2 text-micro font-medium uppercase tracking-wide text-ink-500">
              <User className="h-3.5 w-3.5" />
              Reporter
            </h2>
            <p className="mt-2 text-body font-medium text-ink-900">{report.user.name}</p>
            <p className="mt-0.5 text-caption text-ink-500">{report.user.email}</p>
            {report.user.phone ? (
              <a
                href={`tel:${report.user.phone}`}
                className="tabular mt-2 inline-block text-caption font-semibold text-brand hover:underline"
              >
                {report.user.phone}
              </a>
            ) : null}
          </Surface>

          <Surface className="p-5">
            <label htmlFor="update-notes" className="text-body font-medium text-ink-800">
              Update status
            </label>
            <textarea
              id="update-notes"
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              rows={3}
              placeholder="Add dispatch or verification notes"
              className="mt-2 w-full resize-none rounded-sm border border-line px-3 py-2 text-body text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {STATUS_ACTIONS.map(({ status, label, variant }) => (
                <Button
                  key={status}
                  size="sm"
                  variant={variant}
                  disabled={updating || report.status === status}
                  onClick={() => handleStatusUpdate(status)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <p className="mt-3 text-micro text-ink-400">
              The current status is disabled — pick the one you are moving it to.
            </p>
          </Surface>
        </div>
      </div>
    </div>
  );
}
