import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Radio,
  Siren,
} from 'lucide-react';
import CommandMap from './CommandMap';

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

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
    VERIFIED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    DISPATCHED: 'bg-blue-50 text-blue-700 border border-blue-200',
    RESOLVED: 'bg-slate-100 text-slate-600 border border-slate-200',
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[status] ?? 'bg-slate-100 text-slate-500'}`}
    >
      {status}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const [
    totalAccidents,
    totalHazards,
    pendingAccidents,
    pendingHazards,
    verifiedAccidents,
    verifiedHazards,
    activeAlerts,
    recentAccidents,
    recentHazards,
  ] = await Promise.all([
    prisma.accidentReport.count(),
    prisma.roadHazard.count(),
    prisma.accidentReport.count({ where: { status: 'PENDING' } }),
    prisma.roadHazard.count({ where: { status: 'PENDING' } }),
    prisma.accidentReport.count({ where: { status: 'VERIFIED' } }),
    prisma.roadHazard.count({ where: { status: 'VERIFIED' } }),
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
  const verifiedReports = verifiedAccidents + verifiedHazards;

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

  return (
    // Full-bleed map canvas
    <div className="relative h-[calc(100dvh-57px)] md:h-[100dvh] overflow-hidden">
      {/* ── Map fills entire background ─────────────────────────── */}
      <div className="absolute inset-0">
        <CommandMap points={recentReports} fullscreen />
      </div>

      {/* ── Floating top-left: KPI strip ────────────────────────── */}
      <div className="absolute left-4 top-4 z-[400] flex flex-wrap gap-2 md:left-6 md:top-6">
        {[
          { label: 'Incidents', value: totalReports, icon: FileText, color: '#102018', bg: 'bg-white' },
          { label: 'Pending', value: pendingReports, icon: Clock3, color: '#d97706', bg: 'bg-white' },
          { label: 'Verified', value: verifiedReports, icon: CheckCircle2, color: '#059669', bg: 'bg-white' },
          { label: 'Alerts', value: activeAlerts, icon: Siren, color: '#dc2626', bg: 'bg-white' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className={`flex items-center gap-2 rounded-xl ${bg} px-3 py-2 shadow-[0_2px_12px_rgba(0,0,0,0.10)] backdrop-blur-sm`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
            <div>
              <p className="text-[18px] font-extrabold leading-none tracking-tight" style={{ color: '#111827' }}>
                {value}
              </p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#9ca3af]">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Floating top-right: Broadcast button ────────────────── */}
      <div className="absolute right-4 top-4 z-[400] flex gap-2 md:right-6 md:top-6">
        <Link
          href="/admin/alerts"
          className="flex items-center gap-2 rounded-xl bg-[#2fdf76] px-4 py-2.5 text-[12px] font-extrabold text-[#0a3320] shadow-[0_4px_16px_rgba(47,223,118,0.4)] transition hover:-translate-y-0.5 hover:bg-[#3fef84] active:scale-[0.97]"
        >
          <Radio className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Broadcast alert</span>
        </Link>
      </div>

      {/* ── Floating bottom: side sheet ────────────────────────── */}
      <div className="absolute bottom-4 left-4 right-4 z-[400] md:bottom-6 md:left-6 md:right-auto md:w-[340px]">
        {/* Sheet card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.14)]">
          {/* Sheet header */}
          <div className="flex items-center justify-between border-b border-[#f0f2f0] px-4 py-3">
            <div>
              <p className="text-[13px] font-extrabold tracking-tight text-[#111827]">
                Latest reports
              </p>
              <p className="text-[10px] text-[#9ca3af]">
                {recentReports.length} recent signals
              </p>
            </div>
            <Link
              href="/admin/reports"
              className="flex items-center gap-1 rounded-lg bg-[#f4f7f4] px-2.5 py-1.5 text-[11px] font-bold text-[#0e7a3f] transition hover:bg-[#e5f8eb]"
            >
              All reports
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Report list */}
          <div className="max-h-[220px] overflow-y-auto divide-y divide-[#f4f6f4]">
            {recentReports.length === 0 ? (
              <div className="px-4 py-6 text-center text-[12px] text-[#9ca3af]">
                No reports yet.
              </div>
            ) : (
              recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-[#fbfdfb]"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] ${report.type === 'ACCIDENT'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-amber-50 text-amber-500'
                      }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-[#111827]">
                      {report.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-[#9ca3af]">
                      <MapPin className="h-2.5 w-2.5" />
                      <span className="truncate">{report.locationName}</span>
                    </div>
                  </div>
                  <StatusPill status={report.status} />
                </div>
              ))
            )}
          </div>

          {/* Quick actions strip */}
          <div className="flex items-center gap-1 border-t border-[#f0f2f0] px-3 py-2">
            <Link
              href="/admin/alerts"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold text-[#6b7280] transition hover:bg-[#f9fafb] hover:text-[#111827]"
            >
              <BellRing className="h-3 w-3" />
              Alerts
            </Link>
            <div className="h-4 w-px bg-[#e5e7eb]" />
            <Link
              href="/admin/reports"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold text-[#6b7280] transition hover:bg-[#f9fafb] hover:text-[#111827]"
            >
              <FileText className="h-3 w-3" />
              Reports
            </Link>
            <div className="h-4 w-px bg-[#e5e7eb]" />
            <Link
              href="/admin/emergency-services"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold text-[#6b7280] transition hover:bg-[#f9fafb] hover:text-[#111827]"
            >
              <Siren className="h-3 w-3" />
              Response
            </Link>
          </div>
        </div>
      </div>

      {/* ── Map legend (floating bottom-right) ──────────────────── */}
      <div className="absolute bottom-4 right-4 z-[400] md:bottom-6 md:right-6">
        <div className="flex flex-col gap-1.5 rounded-xl bg-white/90 px-3 py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.10)] backdrop-blur-sm">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9ca3af]">Hotspots</p>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#dc2626] opacity-90" />
            <span className="text-[10px] font-medium text-[#374151]">Accident</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#f97316] opacity-90" />
            <span className="text-[10px] font-medium text-[#374151]">Hazard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#22c55e] opacity-90" />
            <span className="text-[10px] font-medium text-[#374151]">Resolved</span>
          </div>
          <p className="mt-1 text-[9px] text-[#9ca3af]">Bigger = more reports</p>
        </div>
      </div>
    </div>
  );
}
