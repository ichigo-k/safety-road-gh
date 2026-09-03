'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
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
    <main className="flex min-h-[100dvh] items-center justify-center bg-ink-50 px-5 py-12">
      <div className="w-full max-w-[400px]">

        {/* Brand */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-brand">
            <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-base font-semibold leading-none text-ink-900">
              Safety Road
            </p>
            <p className="mt-0.5 text-caption text-ink-500">
              Ghana Admin
            </p>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <h1 className="text-metric font-semibold tracking-[-0.04em] text-ink-900">
            Welcome back.
          </h1>
          <p className="mt-1.5 text-body text-ink-500">
            Sign in to manage incidents and alerts.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-micro font-semibold text-ink-500">
              Email address
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.gov.gh"
              className="w-full rounded-sm border border-line bg-white px-3.5 py-3 text-body text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-micro font-semibold text-ink-500">
              Password
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-sm border border-line bg-white px-3.5 py-3 text-body text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand transition"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-sm bg-danger-soft px-3.5 py-2.5 text-body font-medium text-danger-dark">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-brand py-3 text-body font-semibold text-white transition hover:bg-brand-press disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'Signing in…' : 'Sign in'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-7 text-center text-micro text-ink-400">
          Authorized personnel only. Access is monitored.
        </p>
      </div>
    </main>
  );
}
