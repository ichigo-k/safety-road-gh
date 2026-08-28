import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Safety Road GH',
  description: 'Safety Road GH administration portal.',
};

export default function RootHomePage() {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-[#f4f5f2] text-[#17211d]">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17211d] text-[#f4b63f]"><ShieldCheck className="h-5 w-5" strokeWidth={1.8} /></div>
          <span className="text-sm font-semibold tracking-[0.08em]">SAFETY ROAD GH</span>
        </div>
        <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-[#758079] sm:block">Administration portal</span>
      </header>
      <section className="flex flex-1 items-center px-6 pb-20 pt-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-5xl">
          <div className="max-w-3xl">
            <p className="mb-7 text-xs font-semibold uppercase tracking-[0.22em] text-[#a36f16]">Ghana road safety operations</p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl">Safer roads start with a clear response.</h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#59645d]">Safety Road GH is the administration portal for managing road incidents, alerts, and coordinated response.</p>
            <Link href="/admin/login" className="group mt-10 inline-flex items-center gap-4 rounded-xl bg-[#17211d] px-5 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#26342d] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a36f16]">Go to admin login<ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
          </div>
          <div className="mt-24 border-t border-[#d8ddd8] pt-5 text-xs text-[#758079]">Official Ghana road safety administration</div>
        </div>
      </section>
    </main>
  );
}
