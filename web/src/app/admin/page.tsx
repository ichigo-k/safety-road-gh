import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
} from 'lucide-react';

export const revalidate = 0;

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
      take: 4,
      orderBy: { created_at: 'desc' },
      include: { user: { select: { full_name: true, phone: true } } },
    }),
    prisma.roadHazard.findMany({
      take: 4,
      orderBy: { created_at: 'desc' },
      include: { user: { select: { full_name: true, phone: true } } },
    }),
  ]);

  const totalReports = totalAccidents + totalHazards;
  const pendingReports = pendingAccidents + pendingHazards;
  const verifiedReports = verifiedAccidents + verifiedHazards;

  const formattedAccidents = recentAccidents.map((a) => ({
    id: a.id,
    title: `${a.accident_type.replace('_', ' ')} Incident`,
    description: a.description,
    type: 'ACCIDENT',
    locationName: a.location,
    status: a.status,
    createdAt: a.created_at,
    userName: a.user.full_name,
    userPhone: a.user.phone,
  }));

  const formattedHazards = recentHazards.map((h) => ({
    id: h.id,
    title: `Road Hazard: ${h.hazard_type.replace('_', ' ')}`,
    description: h.description,
    type: 'HAZARD',
    locationName: h.location,
    status: h.status,
    createdAt: h.created_at,
    userName: h.user.full_name,
    userPhone: h.user.phone,
  }));

  const recentReports = [...formattedAccidents, ...formattedHazards]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#0f6cbd]"><Shield className="h-4 w-4" /><span>Safety Road GH command center</span></div>
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#242424]">Good morning, Command.</h1>
          <p className="mt-2 text-sm text-[#616161]">Keep pace with new incidents, verification work, and active public alerts.</p>
        </div>

        <Link
          href="/admin/alerts"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0f6cbd] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.18)] transition-[transform,background-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:bg-[#115ea3] hover:shadow-[0_4px_10px_rgba(15,108,189,0.25)] active:translate-y-0 active:scale-[0.98]"
        >
          <BellRing className="h-4 w-4" />
          <span>Broadcast alert</span>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total reported incidents', value: totalReports, sub: 'Submitted by citizens', icon: Activity, tone: 'blue' },
          { label: 'Pending verification', value: pendingReports, sub: 'Action required', icon: Clock, tone: 'amber' },
          { label: 'Verified & dispatched', value: verifiedReports, sub: 'Responders assigned', icon: CheckCircle2, tone: 'emerald' },
          { label: 'Active road alerts', value: activeAlerts, sub: 'Live broadcast to mobile', icon: AlertTriangle, tone: 'red' },
        ].map(({ label, value, sub, icon: Icon, tone }) => (
          <div key={label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
            <div>
              <p className="text-xs font-medium text-slate-600">{label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#242424]">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{sub}</p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
              tone === 'blue' ? 'border-blue-200 bg-blue-50 text-blue-600' :
              tone === 'amber' ? 'border-amber-200 bg-amber-50 text-amber-600' :
              tone === 'emerald' ? 'border-emerald-200 bg-emerald-50 text-emerald-600' :
              'border-red-200 bg-red-50 text-red-600'}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent road reports</h2>
            <p className="text-xs text-slate-500">Latest accident and hazard submissions from mobile users.</p>
          </div>
          <Link href="/admin/reports" className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f6cbd] transition-colors hover:text-[#115ea3]">
            <span>View all reports</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-[#fafafa] text-xs font-medium text-slate-600">
              <tr>
                <th className="px-6 py-3">Incident</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Reported by</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    No reports submitted yet.
                  </td>
                </tr>
              ) : (
                recentReports.map((report) => (
                  <tr key={report.id} className="transition-colors hover:bg-[#f5f9fd]">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{report.title}</p>
                      <p className="mt-1 max-w-md truncate text-xs text-slate-500">{report.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${
                        report.type === 'ACCIDENT' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{report.locationName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                        report.status === 'PENDING' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                        report.status === 'VERIFIED' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                        report.status === 'RESOLVED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                        'border-slate-200 bg-slate-100 text-slate-600'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <p className="font-medium text-slate-800">{report.userName}</p>
                      <p className="text-slate-500">{report.userPhone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(report.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
