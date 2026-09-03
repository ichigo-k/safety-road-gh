import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Radio,
  Siren,
} from 'lucide-react';
import CommandMap from './CommandMap';
import { sentenceCase, StatusPill } from '@/components/ui';
import { MapChromeProvider, MapPanel } from './MapChrome';

export const revalidate = 0;

type ReportRow = {
  id: string;
  title: string;
  description: string;
  type: 'ACCIDENT' | 'HAZARD';
  locationName: string;
  status: string;
  createdAt: Date;
  userName: string;
  latitude: number;
  longitude: number;
};

export default async function AdminDashboardPage() {
  const [
    totalAccidents,
    totalHazards,
    pendingAccidents,
    pendingHazards,
    activeAlerts,
    recentAccidents,
    recentHazards,
  ] = await Promise.all([
    prisma.accidentReport.count(),
    prisma.roadHazard.count(),
    prisma.accidentReport.count({ where: { status: 'PENDING' } }),
    prisma.roadHazard.count({ where: { status: 'PENDING' } }),
    prisma.roadAlert.count({ where: { active: true } }),
    prisma.accidentReport.findMany({
      take: 8,
      orderBy: { created_at: 'desc' },
      include: { user: { select: { full_name: true } } },
    }),
    prisma.roadHazard.findMany({
      take: 8,
      orderBy: { created_at: 'desc' },
      include: { user: { select: { full_name: true } } },
    }),
  ]);

  const totalReports = totalAccidents + totalHazards;
  const pendingReports = pendingAccidents + pendingHazards;

  const recentReports: ReportRow[] = [
    ...recentAccidents.map((a) => ({
      id: a.id,
      title: `${a.accident_type.replaceAll('_', ' ')} incident`,
      description: a.description,
      type: 'ACCIDENT' as const,
      locationName: a.location,
      status: a.status,
      createdAt: a.created_at,
      userName: a.user.full_name,
      latitude: a.latitude,
      longitude: a.longitude,
    })),
    ...recentHazards.map((h) => ({
      id: h.id,
      title: `Road hazard: ${h.hazard_type.replaceAll('_', ' ')}`,
      description: h.description,
      type: 'HAZARD' as const,
      locationName: h.location,
      status: h.status,
      createdAt: h.created_at,
      userName: h.user.full_name,
      latitude: h.latitude,
      longitude: h.longitude,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  const kpis = [
    // "Incidents" previously meant accidents + hazards, which made this read 4
    // while the mobile Accidents filter correctly read 3. Name each for what
    // it actually counts.
    { label: 'Accidents', value: totalAccidents, icon: AlertTriangle, className: 'text-danger' },
    { label: 'Hazards', value: totalHazards, icon: FileText, className: 'text-warn' },
    { label: 'Pending', value: pendingReports, icon: Clock3, className: 'text-ink-700' },
    { label: 'Alerts live', value: activeAlerts, icon: Siren, className: 'text-danger' },
  ];

  return (
    <div className="relative h-[calc(100dvh-57px)] overflow-hidden md:h-[100dvh]">
      <MapChromeProvider>
      <div className="absolute inset-0">
        <CommandMap points={recentReports} fullscreen />
      </div>

      {/* ── KPI strip ────────────────────────────────────────────────────
          One card rather than four floating chips: over a busy map, a single
          opaque surface separates from the background far better than four
          small ones, and the labels are readable instead of 9px caps. */}
      <MapPanel>
      {/* Two-up on small screens so the strip never grows into the action
          button on the opposite corner; a single row once there is width. */}
      <div className="pointer-events-none absolute left-4 top-4 z-[400] mr-16 md:left-6 md:top-6 md:mr-0">
        <div className="pointer-events-auto grid grid-cols-2 gap-px overflow-hidden rounded-md bg-line shadow-float md:flex">
          {kpis.map(({ label, value, icon: Icon, className }) => (
            <div key={label} className="flex items-center gap-2.5 bg-surface px-4 py-3">
              <Icon className={`h-4 w-4 shrink-0 ${className}`} strokeWidth={2.2} />
              <div>
                <p className="tabular text-heading font-semibold leading-none text-ink-900">
                  {value}
                </p>
                <p className="mt-1 text-micro font-medium leading-none text-ink-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </MapPanel>

      {/* ── Broadcast ────────────────────────────────────────────────────── */}
      <MapPanel>
      <div className="absolute right-4 top-4 z-[400] md:right-6 md:top-6">
        <Link
          href="/admin/alerts/new"
          className="inline-flex h-10 items-center gap-2 rounded-sm bg-brand px-4 text-body font-semibold text-white shadow-float transition-colors hover:bg-brand-press"
        >
          <Radio className="h-4 w-4" strokeWidth={2.2} />
          <span className="hidden sm:inline">Broadcast alert</span>
        </Link>
      </div>
      </MapPanel>

      {/* ── Recent reports ───────────────────────────────────────────────── */}
      <MapPanel>
      <div className="absolute bottom-4 left-4 right-4 z-[400] md:bottom-20 md:left-6 md:right-auto md:w-[350px]">
        <div className="overflow-hidden rounded-md bg-surface shadow-float">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <p className="text-base font-semibold text-ink-900">Latest reports</p>
              <p className="tabular text-micro text-ink-500">
                {recentReports.length} in the last batch
              </p>
            </div>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-1 rounded-xs px-2 py-1.5 text-caption font-semibold text-brand transition-colors hover:bg-brand-soft"
            >
              All reports
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="max-h-[240px] divide-y divide-line overflow-y-auto">
            {recentReports.length === 0 ? (
              <p className="px-4 py-8 text-center text-body text-ink-500">No reports yet.</p>
            ) : (
              recentReports.map((report) => (
                <div key={report.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xs ${
                      report.type === 'ACCIDENT'
                        ? 'bg-danger-soft text-danger'
                        : 'bg-warn-soft text-warn'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-medium text-ink-900">
                      {sentenceCase(report.title)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-micro text-ink-500">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{report.locationName}</span>
                    </p>
                  </div>
                  <StatusPill status={report.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      </MapPanel>

      {/* ── Legend ───────────────────────────────────────────────────────── */}
      <MapPanel>
      <div className="absolute bottom-4 right-4 z-[400] hidden md:bottom-20 md:right-6 md:block">
        <div className="rounded-sm bg-surface px-3 py-2.5 shadow-card">
          <p className="mb-2 text-micro font-semibold text-ink-700">Hotspots</p>
          <ul className="space-y-1.5">
            {[
              ['Accident', 'bg-danger'],
              ['Hazard', 'bg-warn'],
              ['Resolved', 'bg-ok'],
            ].map(([label, dot]) => (
              <li key={label} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                <span className="text-micro text-ink-600">{label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 border-t border-line pt-2 text-micro text-ink-400">
            Larger dot = more reports
          </p>
        </div>
      </div>
      </MapPanel>
      </MapChromeProvider>
    </div>
  );
}
