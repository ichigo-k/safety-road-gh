import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock3, FileText, MapPin, Radio, ShieldCheck, Siren } from 'lucide-react';
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
  const tone = status === 'PENDING' ? 'bg-[#fff4df] text-[#a76513]' : status === 'VERIFIED' || status === 'DISPATCHED' ? 'bg-[#e5f8eb] text-[#0e7a3f]' : status === 'RESOLVED' ? 'bg-[#e7f0ff] text-[#315c9e]' : 'bg-[#eef2ef] text-[#64736a]';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.08em] ${tone}`}>{status}</span>;
}

export default async function AdminDashboardPage() {
  const [totalAccidents, totalHazards, pendingAccidents, pendingHazards, verifiedAccidents, verifiedHazards, activeAlerts, recentAccidents, recentHazards] = await Promise.all([
    prisma.accidentReport.count(),
    prisma.roadHazard.count(),
    prisma.accidentReport.count({ where: { status: 'PENDING' } }),
    prisma.roadHazard.count({ where: { status: 'PENDING' } }),
    prisma.accidentReport.count({ where: { status: 'VERIFIED' } }),
    prisma.roadHazard.count({ where: { status: 'VERIFIED' } }),
    prisma.roadAlert.count({ where: { active: true } }),
    prisma.accidentReport.findMany({ take: 5, orderBy: { created_at: 'desc' }, include: { user: { select: { full_name: true } } } }),
    prisma.roadHazard.findMany({ take: 5, orderBy: { created_at: 'desc' }, include: { user: { select: { full_name: true } } } }),
  ]);

  const totalReports = totalAccidents + totalHazards;
  const pendingReports = pendingAccidents + pendingHazards;
  const verifiedReports = verifiedAccidents + verifiedHazards;
  const recentReports: ReportRow[] = [...recentAccidents.map((a) => ({ id: a.id, title: `${a.accident_type.replaceAll('_', ' ')} incident`, description: a.description, type: 'ACCIDENT' as const, locationName: a.location, status: a.status, createdAt: a.created_at, userName: a.user.full_name, latitude: a.latitude, longitude: a.longitude })), ...recentHazards.map((h) => ({ id: h.id, title: `Road hazard: ${h.hazard_type.replaceAll('_', ' ')}`, description: h.description, type: 'HAZARD' as const, locationName: h.location, status: h.status, createdAt: h.created_at, userName: h.user.full_name, latitude: h.latitude, longitude: h.longitude }))].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8);

  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e5f8eb] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#0e7a3f]"><span className="h-1.5 w-1.5 rounded-full bg-[#2fdf76]" />Live operations</div>
          <h1 className="text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.02] tracking-[-.055em] text-[#102018]">Good morning, Command.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6d7d73]">A clear view of what is happening across Ghana’s roads, so your team can move quickly when it matters.</p>
        </div>
        <Link href="/admin/alerts" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#2fdf76] px-4 py-3 text-sm font-extrabold text-[#0a3320] shadow-[0_8px_18px_rgba(47,223,118,.22)] transition hover:-translate-y-0.5 hover:bg-[#45e982] active:scale-[.98]"><Radio className="h-4 w-4" />Broadcast alert<ArrowUpRight className="h-4 w-4" /></Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total incidents', value: totalReports, note: 'All submissions', icon: FileText, tone: 'bg-[#eef8f0] text-[#0e7a3f]' },
          { label: 'Needs review', value: pendingReports, note: 'Awaiting verification', icon: Clock3, tone: 'bg-[#fff5e2] text-[#a76513]' },
          { label: 'Verified', value: verifiedReports, note: 'Ready for response', icon: CheckCircle2, tone: 'bg-[#e8f1ff] text-[#315c9e]' },
          { label: 'Live alerts', value: activeAlerts, note: 'Public broadcasts', icon: Siren, tone: 'bg-[#ffebeb] text-[#b74747]' },
        ].map(({ label, value, note, icon: Icon, tone }) => <div key={label} className="rounded-2xl border border-[#e0e9e2] bg-white p-5 shadow-[0_6px_22px_rgba(16,32,24,.035)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,32,24,.08)]"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold text-[#6d7d73]">{label}</p><p className="mt-2 text-3xl font-extrabold tracking-[-.06em] text-[#102018]">{value}</p><p className="mt-1 text-xs text-[#96a49b]">{note}</p></div><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div></div></div>)}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(310px,.7fr)]">
        <div className="overflow-hidden rounded-[26px] border border-[#dfe9e1] bg-white shadow-[0_8px_30px_rgba(16,32,24,.045)]">
          <div className="flex items-start justify-between gap-4 border-b border-[#edf2ee] px-5 py-5 sm:px-6"><div><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#17b85a]" /><h2 className="text-base font-extrabold tracking-[-.02em] text-[#102018]">Incident map</h2></div><p className="mt-1 text-xs text-[#8a9a91]">Live reports across the Accra network</p></div><span className="hidden items-center gap-2 rounded-full bg-[#f2f7f3] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#6d7d73] sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-[#2fdf76]" />Street view</span></div>
          <div className="h-[380px] p-3 sm:h-[430px] sm:p-4"><CommandMap points={recentReports} /></div>
          <div className="flex flex-wrap items-center gap-4 border-t border-[#edf2ee] px-5 py-4 text-[10px] font-bold uppercase tracking-[.12em] text-[#8a9a91] sm:px-6"><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#e95d5d]" />Accident</span><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#f1a33a]" />Hazard</span><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#2fdf76]" />Resolved</span></div>
        </div>

        <div className="rounded-[26px] border border-[#dfe9e1] bg-[#102018] p-5 text-white shadow-[0_8px_30px_rgba(16,32,24,.1)] sm:p-6">
          <div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#183b28] text-[#2fdf76]"><ShieldCheck className="h-5 w-5" /></div><span className="rounded-full bg-[#183b28] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#73ef9c]">Response health</span></div>
          <h2 className="mt-7 text-2xl font-extrabold leading-tight tracking-[-.04em]">Keep the network moving.</h2>
          <p className="mt-3 text-sm leading-6 text-[#b2c2b8]">Review pending reports first, then keep public alerts current so drivers get the right information at the right time.</p>
          <div className="mt-8 space-y-4"><div><div className="mb-2 flex justify-between text-xs font-bold"><span className="text-[#c6d4ca]">Verification queue</span><span className="text-[#2fdf76]">{pendingReports > 0 ? 'Needs attention' : 'Clear'}</span></div><div className="h-2 rounded-full bg-[#1d3b29]"><div className="h-2 rounded-full bg-[#2fdf76]" style={{ width: `${Math.min(100, pendingReports * 12 + 6)}%` }} /></div></div><div><div className="mb-2 flex justify-between text-xs font-bold"><span className="text-[#c6d4ca]">Public coverage</span><span className="text-[#73ef9c]">Active</span></div><div className="h-2 rounded-full bg-[#1d3b29]"><div className="h-2 w-[78%] rounded-full bg-[#73ef9c]" /></div></div></div>
          <Link href="/admin/reports" className="mt-9 inline-flex items-center gap-2 text-sm font-extrabold text-[#2fdf76] hover:text-white">Open response queue <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-[26px] border border-[#dfe9e1] bg-white shadow-[0_8px_30px_rgba(16,32,24,.045)]">
        <div className="flex items-center justify-between gap-4 border-b border-[#edf2ee] px-5 py-5 sm:px-6"><div><h2 className="text-base font-extrabold tracking-[-.02em] text-[#102018]">Latest reports</h2><p className="mt-1 text-xs text-[#8a9a91]">The newest citizen signals entering the queue</p></div><Link href="/admin/reports" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0e7a3f] hover:text-[#17b85a]">View all <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
        <div className="divide-y divide-[#edf2ee]">{recentReports.length === 0 ? <div className="px-6 py-12 text-center text-sm text-[#8a9a91]">No reports submitted yet.</div> : recentReports.map((report) => <div key={report.id} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-[#fbfdfb] sm:flex-row sm:items-center sm:px-6"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${report.type === 'ACCIDENT' ? 'bg-[#ffebeb] text-[#b74747]' : 'bg-[#fff5e2] text-[#a76513]'}`}><AlertTriangle className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-bold text-[#203128]">{report.title}</p><span className="rounded-full bg-[#f2f7f3] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[.08em] text-[#6d7d73]">{report.type}</span></div><p className="mt-1 flex items-center gap-1 truncate text-xs text-[#8a9a91]"><MapPin className="h-3 w-3" />{report.locationName}</p></div><div className="flex items-center gap-4 sm:justify-end"><div className="hidden text-right sm:block"><p className="text-xs font-semibold text-[#6d7d73]">{report.userName}</p><p className="mt-1 text-[10px] text-[#a2b0a7]">{new Date(report.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p></div><StatusPill status={report.status} /></div></div>)}</div>
      </section>
    </div>
  );
}
