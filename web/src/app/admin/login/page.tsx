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

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to sign in');
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
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#f7f7f7] px-5 py-12">
      <div className="w-full max-w-[400px]">

        {/* Brand */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#111111]">
            <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-[14px] font-extrabold leading-none tracking-[-0.02em] text-[#111111]">
              Safety Road
            </p>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#999999]">
              Ghana Admin
            </p>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5e5e5] bg-white">
            <LockKeyhole className="h-4 w-4 text-[#555555]" />
          </div>
          <h1 className="text-[26px] font-extrabold tracking-[-0.04em] text-[#111111]">
            Welcome back.
          </h1>
          <p className="mt-1.5 text-[13px] text-[#999999]">
            Sign in to manage incidents and alerts.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#999999]">
              Email address
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.gov.gh"
              className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3.5 py-3 text-[13px] text-[#111111] outline-none placeholder:text-[#c4c4c4] focus:border-[#111111] transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#999999]">
              Password
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3.5 py-3 text-[13px] text-[#111111] outline-none placeholder:text-[#c4c4c4] focus:border-[#111111] transition"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#111111] py-3 text-[13px] font-semibold text-white transition hover:bg-[#333333] disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'Signing in…' : 'Sign in'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-7 text-center text-[11px] text-[#c4c4c4]">
          Authorized personnel only. Access is monitored.
        </p>
      </div>
    </main>
  );
}
