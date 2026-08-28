import Link from 'next/link';
import { AlertTriangle, ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Page not found | Safety Road GH',
  description: 'The requested page could not be found.',
};

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle className="h-9 w-9" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Error 404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Page not found</h1>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
          The route you requested does not exist or may have moved. Head back to the dashboard or the public home page.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin login
          </Link>
        </div>
      </div>
    </main>
  );
}
