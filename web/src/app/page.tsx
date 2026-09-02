import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Safety Road GH',
  description: 'Road safety operations platform for Ghana.',
};

export default function RootHomePage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#f7f8f7] px-5">
      <div className="flex flex-col items-center text-center">
        {/* Brand mark */}
        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#102018] shadow-[0_8px_32px_rgba(16,32,24,0.18)]">
          <ShieldCheck className="h-8 w-8 text-[#2fdf76]" strokeWidth={2} />
        </div>

        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[#17b85a]">
          Safety Road GH
        </p>

        <h1 className="mt-3 text-[2rem] font-extrabold leading-tight tracking-[-0.04em] text-[#102018]">
          The app is running.
        </h1>

        <p className="mt-3 max-w-xs text-sm leading-6 text-[#6d7d73]">
          Ghana road safety operations network — live and operational.
        </p>

        <Link
          href="/admin/login"
          className="mt-8 inline-flex h-12 items-center gap-2.5 rounded-xl bg-[#102018] px-7 text-sm font-bold text-white shadow-[0_4px_20px_rgba(16,32,24,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1e3a2a] active:scale-[0.97]"
        >
          Go to admin portal
        </Link>

        <div className="mt-8 flex items-center gap-2 text-[11px] text-[#a2b0a7]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2fdf76]" />
          Network online
        </div>
      </div>
    </main>
  );
}
