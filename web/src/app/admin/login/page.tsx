'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Lock, Mail, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@safetyroad.gov.gh');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const responseText = await res.text();
      let data: { error?: string; token?: string; user?: unknown } = {};
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error('The login service returned an invalid response. Please try again.');
        }
      }
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (!data.token || !data.user) {
        throw new Error('Login service did not return account details. Please try again.');
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      router.push('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#f5f7fa] px-5 py-10 text-[#242424]">
      <div className="w-full max-w-[420px] rounded-2xl border border-[#d8ddd8] bg-white p-8 shadow-[0_24px_70px_rgba(23,33,29,0.08)] sm:p-10">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f6cbd] text-white">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#242424]">Admin login</h1>
          <p className="text-sm text-[#616161]">Safety Road GH administration portal</p>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-[#59645d]">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-[#d1d1d1] bg-[#fafafa] py-3 pl-10 pr-3 text-sm text-[#242424] outline-none transition placeholder:text-[#8a8a8a] focus:border-[#0f6cbd] focus:bg-white focus:ring-2 focus:ring-[#0f6cbd]/15"
                placeholder="admin@safetyroad.gov.gh"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[#59645d]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-[#d1d1d1] bg-[#fafafa] py-3 pl-10 pr-3 text-sm text-[#242424] outline-none transition placeholder:text-[#8a8a8a] focus:border-[#0f6cbd] focus:bg-white focus:ring-2 focus:ring-[#0f6cbd]/15"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0f6cbd] px-4 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#115ea3] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Authenticating...' : 'Sign in to admin portal'}
          </button>
        </form>

      </div>
    </main>
  );
}
