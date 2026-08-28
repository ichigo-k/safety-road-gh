'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to sign in');
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-[#f4f7f4] text-[#102018]">
      <div className="mx-auto grid min-h-[100dvh] max-w-[1320px] lg:grid-cols-[1.1fr_.9fr]">
        <section className="relative hidden overflow-hidden bg-[#102018] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16"><div className="absolute -right-28 -top-28 h-[460px] w-[460px] rounded-full bg-[#183b28]" /><div className="relative flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#2fdf76] text-[#0a3320]"><ShieldCheck className="h-5 w-5" /></div><div><p className="text-[15px] font-extrabold leading-none tracking-[-.03em]">Safety Road</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.22em] text-[#73ef9c]">Ghana</p></div></div><div className="relative max-w-lg"><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#73ef9c]">MTTD operations</p><h1 className="mt-5 text-6xl font-extrabold leading-[.95] tracking-[-.065em]">A calmer view of a faster response.</h1><p className="mt-6 max-w-md text-base leading-7 text-[#b2c2b8]">The command center for keeping road signals visible, teams aligned, and the public informed.</p><div className="mt-10 flex items-center gap-3 text-xs font-bold text-[#c6d4ca]"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#183b28] text-[#2fdf76]"><LockKeyhole className="h-4 w-4" /></span>Secure operations workspace</div></div><div className="relative flex items-center justify-between border-t border-[#31543f] pt-5 text-[10px] font-bold uppercase tracking-[.14em] text-[#8eaa96]"><span>Ghana road safety network</span><span className="inline-flex items-center gap-2 text-[#73ef9c]"><span className="h-1.5 w-1.5 rounded-full bg-[#2fdf76]" />System online</span></div></section>
        <section className="flex items-center justify-center px-5 py-10 sm:px-10"><div className="w-full max-w-[430px]"><div className="mb-10 flex items-center gap-3 lg:hidden"><div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#2fdf76] text-[#0a3320]"><ShieldCheck className="h-5 w-5" /></div><div><p className="text-[15px] font-extrabold leading-none">Safety Road</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.22em] text-[#17b85a]">Ghana</p></div></div><div className="mb-8"><div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f8eb] text-[#0e7a3f]"><LockKeyhole className="h-5 w-5" /></div><p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-[#17b85a]">Command access</p><h2 className="mt-2 text-4xl font-extrabold tracking-[-.055em]">Welcome back.</h2><p className="mt-3 text-sm leading-6 text-[#6d7d73]">Sign in to manage incidents, alerts, and response coordination.</p></div><form onSubmit={handleLogin} className="space-y-5"><label className="block"><span className="mb-2 block text-xs font-extrabold text-[#203128]">Email address</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@agency.gov.gh" className="h-12 w-full rounded-xl border border-[#dfe9e1] bg-white px-4 text-sm text-[#102018] outline-none transition placeholder:text-[#a2b0a7] focus:border-[#2fdf76] focus:ring-4 focus:ring-[#2fdf76]/15" /></label><label className="block"><span className="mb-2 block text-xs font-extrabold text-[#203128]">Password</span><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="h-12 w-full rounded-xl border border-[#dfe9e1] bg-white px-4 text-sm text-[#102018] outline-none transition placeholder:text-[#a2b0a7] focus:border-[#2fdf76] focus:ring-4 focus:ring-[#2fdf76]/15" /></label>{error && <p role="alert" className="rounded-xl bg-[#ffebeb] px-4 py-3 text-xs font-semibold text-[#b74747]">{error}</p>}<button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2fdf76] text-sm font-extrabold text-[#0a3320] shadow-[0_9px_20px_rgba(47,223,118,.2)] transition hover:-translate-y-0.5 hover:bg-[#45e982] disabled:cursor-wait disabled:opacity-60">{loading ? 'Signing in…' : 'Enter command center'}{!loading && <ArrowRight className="h-4 w-4" />}</button></form><p className="mt-8 text-center text-[11px] leading-5 text-[#a2b0a7]">Authorized operations personnel only. Access is monitored.</p></div></section>
      </div>
    </main>
  );
}
