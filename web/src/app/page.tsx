import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Safety Road GH',
  description: 'Ghana National Road Accident & Hazard Reporting System',
};

export default function RootHomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 font-sans">
      <main className="flex w-full max-w-lg flex-col items-center text-center">
        <div className="mb-10 flex items-center gap-3">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <rect width="40" height="40" rx="10" fill="#0f172a" />
            <path
              d="M20 10L28 26H12L20 10Z"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="20" cy="22" r="1.5" fill="#f59e0b" />
            <line x1="20" y1="16" x2="20" y2="20" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-xl font-semibold tracking-tight text-zinc-900">
            Safety Road GH
          </span>
        </div>

        <h1 className="mb-3 text-3xl font-semibold leading-tight tracking-tight text-zinc-900">
          Your application is running.
        </h1>

        <p className="mb-10 max-w-sm text-base leading-relaxed text-zinc-500">
          The REST API and admin dashboard are live. Sign in to the command center to manage incident reports, broadcast road alerts, and coordinate emergency response across Ghana.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/login"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-all hover:bg-zinc-700 active:scale-[0.97]"
            style={{ transitionProperty: 'background-color, transform', transitionDuration: '200ms', transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
          >
            Open Admin Dashboard
          </Link>

          <Link
            href="/api/v1/reports"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 px-5 text-sm font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.97]"
            style={{ transitionProperty: 'background-color, border-color, transform', transitionDuration: '200ms', transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
          >
            API Reference
          </Link>
        </div>
      </main>
    </div>
  );
}
