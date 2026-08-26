import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  BellRing, 
  ArrowUpRight,
  Shield,
  Activity,
  MapPin
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
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-sm font-semibold mb-1">
            <Shield className="w-4 h-4" />
            <span>NATIONAL ROAD SAFETY COMMAND CENTER</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Overview</h1>
          <p className="text-slate-400 text-sm">Real-time incident response & hazard dispatch monitoring in Ghana</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/alerts"
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-red-900/30 transition"
          >
            <BellRing className="w-4 h-4" />
            <span>Broadcast Alert</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Incident Reports</p>
            <p className="text-3xl font-black text-white mt-1">{totalReports}</p>
            <p className="text-xs text-slate-500 mt-1">Submitted by citizens</p>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Verification</p>
            <p className="text-3xl font-black text-amber-400 mt-1">{pendingReports}</p>
            <p className="text-xs text-amber-500/80 mt-1">Action required</p>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified & Dispatched</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">{verifiedReports}</p>
            <p className="text-xs text-emerald-500/80 mt-1">Responders assigned</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Road Alerts</p>
            <p className="text-3xl font-black text-red-400 mt-1">{activeAlerts}</p>
            <p className="text-xs text-red-500/80 mt-1">Live broadcast to mobile</p>
          </div>
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Incident Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Road Reports</h2>
            <p className="text-xs text-slate-400">Latest accident and hazard submissions from mobile users</p>
          </div>
          <Link
            href="/admin/reports"
            className="flex items-center space-x-1 text-xs font-bold text-amber-400 hover:text-amber-300"
          >
            <span>View All Reports</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Incident / Title</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Reported By</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No reports submitted yet.
                  </td>
                </tr>
              ) : (
                recentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-900/50 transition">
                    <td className="px-6 py-4 font-semibold text-white">
                      {report.title}
                      <p className="text-xs text-slate-400 line-clamp-1 font-normal">{report.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          report.type === 'ACCIDENT'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[180px]">{report.locationName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          report.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : report.status === 'VERIFIED'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : report.status === 'RESOLVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <p className="text-slate-200 font-medium">{report.userName}</p>
                      <p className="text-slate-500">{report.userPhone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
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
