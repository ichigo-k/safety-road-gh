"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus } from 'lucide-react';

interface TipItem {
  id: string;
  category: string;
  title: string;
  content: string;
  createdAt: string;
}

/* ── Skeleton: matches safety-tip card layout ───────────────────── */
function TipCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border border-line bg-white p-4">
      {/* category + date row */}
      <div className="flex items-center justify-between">
        <div className="skeleton h-4 w-16 rounded-full" />
        <div className="skeleton h-3 w-14 rounded" />
      </div>
      {/* title */}
      <div className="mt-3 skeleton h-4 w-3/4" />
      {/* body lines */}
      <div className="mt-2 space-y-1.5">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-4/5" />
      </div>
      {/* footer */}
      <div className="mt-auto pt-4 border-t border-line">
        <div className="skeleton h-3 w-20" />
      </div>
    </div>
  );
}

const AUDIENCE_META: Record<string, { label: string; pill: string }> = {
  DRIVER: { label: 'Drivers', pill: 'bg-brand-soft text-brand-dark' },
  MOTORCYCLIST: { label: 'Motorcyclists', pill: 'bg-info-soft text-info-dark' },
  PEDESTRIAN: { label: 'Pedestrians', pill: 'bg-warn-soft text-warn-dark' },
  PASSENGER: { label: 'Passengers', pill: 'bg-ink-50 text-ink-600' },
};

const AUDIENCE_TABS = ['ALL', 'DRIVER', 'MOTORCYCLIST', 'PEDESTRIAN', 'PASSENGER'];

export default function AdminSafetyTipsPage() {
  const [tips, setTips] = useState<TipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchTips = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/safety-tips');
      const data = await res.json();
      if (data.tips) setTips(data.tips);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTips(); }, []);

  const filtered = activeTab === 'ALL' ? tips : tips.filter((t) => t.category === activeTab);

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-display font-semibold text-ink-900">Safety library</h1>
          <p className="mt-1 text-body text-ink-500">Targeted education for drivers, riders, and pedestrians.</p>
        </div>
        <Link
          href="/admin/safety-tips/new"
          className="inline-flex items-center gap-2 rounded-sm bg-brand px-4 py-2.5 text-body font-semibold text-white transition hover:bg-brand-press active:scale-[0.97]"
        >
          <Plus className="h-3.5 w-3.5" />
          New tip
        </Link>
      </div>

      {/* ── Audience filter tabs ────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {AUDIENCE_TABS.map((tab) => {
          const count = tab === 'ALL' ? tips.length : tips.filter((t) => t.category === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-caption font-semibold transition active:scale-[0.97] ${activeTab === tab ? 'bg-brand text-white' : 'border border-line text-ink-600 hover:bg-ink-50' }`}
            >
              {tab === 'ALL' ? 'All' : AUDIENCE_META[tab]?.label ?? tab}
              {!loading && (
                <span className={`rounded-xs px-1.5 py-0.5 text-micro font-semibold ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-ink-50 text-ink-500' }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Card grid ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <TipCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-line bg-white py-16 text-center">
          <BookOpen className="mb-3 h-8 w-8 text-ink-300" />
          <p className="text-base font-semibold text-ink-600">
            {activeTab === 'ALL' ? 'No tips published yet' : `No tips for ${AUDIENCE_META[activeTab]?.label ?? activeTab}`}
          </p>
          <Link
            href="/admin/safety-tips/new"
            className="mt-4 text-caption font-semibold text-ink-900 underline underline-offset-2"
          >
            Add the first one
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tip) => {
            const meta = AUDIENCE_META[tip.category] ?? { label: tip.category, pill: 'bg-ink-50 text-ink-600' };
            return (
              <article
                key={tip.id}
                className="flex flex-col rounded-lg border border-line bg-white p-4 transition hover:border-line-strong hover:shadow-card"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex rounded-xs px-2 py-1 text-micro font-semibold ${meta.pill}`}>
                    {meta.label}
                  </span>
                  <span className="text-micro text-ink-500">
                    {new Date(tip.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </span>
                </div>

                <h3 className="mt-3 text-body font-semibold leading-snug text-ink-900">{tip.title}</h3>
                <p className="mt-1.5 flex-1 text-caption leading-5 text-ink-600">{tip.content}</p>

                <div className="mt-4 flex items-center gap-1.5 border-t border-line pt-3 text-micro text-ink-500">
                  <BookOpen className="h-3 w-3" />
                  Published
                </div>
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
}
