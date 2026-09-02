"use client";

import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, X } from 'lucide-react';

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
    <div className="flex flex-col rounded-xl border border-[#e5e5e5] bg-white p-4">
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
      <div className="mt-auto pt-4 border-t border-[#f0f0f0]">
        <div className="skeleton h-3 w-20" />
      </div>
    </div>
  );
}

const AUDIENCE_META: Record<string, { label: string; pill: string }> = {
  DRIVER: { label: 'Drivers', pill: 'bg-[#111111] text-white' },
  MOTORCYCLIST: { label: 'Motorcyclists', pill: 'bg-[#f0f0f0] text-[#555555] border border-[#e5e5e5]' },
  PEDESTRIAN: { label: 'Pedestrians', pill: 'bg-[#f0f0f0] text-[#555555] border border-[#e5e5e5]' },
  PASSENGER: { label: 'Passengers', pill: 'bg-[#f0f0f0] text-[#555555] border border-[#e5e5e5]' },
};

const AUDIENCE_TABS = ['ALL', 'DRIVER', 'MOTORCYCLIST', 'PEDESTRIAN', 'PASSENGER'];

export default function AdminSafetyTipsPage() {
  const [tips, setTips] = useState<TipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('DRIVER');
  const [content, setContent] = useState('');

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/api/v1/safety-tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ category, title, content }),
      });
      if (res.ok) {
        setShowModal(false);
        setTitle(''); setCategory('DRIVER'); setContent('');
        fetchTips();
      } else {
        alert('Failed to save safety tip');
      }
    } catch { alert('Network error'); }
    finally { setSubmitting(false); }
  };

  const filtered = activeTab === 'ALL' ? tips : tips.filter((t) => t.category === activeTab);

  const inputCls = "w-full rounded-lg border border-[#e5e5e5] px-3 py-2.5 text-[13px] text-[#111111] outline-none placeholder:text-[#c4c4c4] focus:border-[#111111] transition bg-white";

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e5e5e5] pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-[#111111]">Safety library</h1>
          <p className="mt-1 text-sm text-[#999999]">Targeted education for drivers, riders, and pedestrians.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#111111] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#333333] active:scale-[0.97]"
        >
          <Plus className="h-3.5 w-3.5" />
          New tip
        </button>
      </div>

      {/* ── Audience filter tabs ────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {AUDIENCE_TABS.map((tab) => {
          const count = tab === 'ALL' ? tips.length : tips.filter((t) => t.category === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition active:scale-[0.97] ${activeTab === tab
                  ? 'bg-[#111111] text-white'
                  : 'border border-[#e5e5e5] text-[#555555] hover:bg-[#f7f7f7]'
                }`}
            >
              {tab === 'ALL' ? 'All' : AUDIENCE_META[tab]?.label ?? tab}
              {!loading && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-[#f0f0f0] text-[#999999]'
                  }`}>
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
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#e5e5e5] bg-white py-16 text-center">
          <BookOpen className="mb-3 h-8 w-8 text-[#e5e5e5]" />
          <p className="text-[14px] font-semibold text-[#555555]">
            {activeTab === 'ALL' ? 'No tips published yet' : `No tips for ${AUDIENCE_META[activeTab]?.label ?? activeTab}`}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-[12px] font-semibold text-[#111111] underline underline-offset-2"
          >
            Add the first one
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tip) => {
            const meta = AUDIENCE_META[tip.category] ?? { label: tip.category, pill: 'bg-[#f0f0f0] text-[#555555]' };
            return (
              <article
                key={tip.id}
                className="flex flex-col rounded-xl border border-[#e5e5e5] bg-white p-4 transition hover:border-[#d1d1d1] hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.pill}`}>
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-[#999999]">
                    {new Date(tip.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </span>
                </div>

                <h3 className="mt-3 text-[13px] font-bold leading-snug text-[#111111]">{tip.title}</h3>
                <p className="mt-1.5 flex-1 text-[12px] leading-5 text-[#555555]">{tip.content}</p>

                <div className="mt-4 flex items-center gap-1.5 border-t border-[#f0f0f0] pt-3 text-[11px] text-[#999999]">
                  <BookOpen className="h-3 w-3" />
                  Published
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Create modal ───────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.14)]">

            <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4">
              <h2 className="text-[14px] font-extrabold tracking-[-0.02em] text-[#111111]">New safety tip</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-[#999999] hover:bg-[#f7f7f7] hover:text-[#111111]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 px-5 py-5">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#999999]">
                  Audience
                </label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                  <option value="DRIVER">Drivers</option>
                  <option value="MOTORCYCLIST">Motorcyclists</option>
                  <option value="PEDESTRIAN">Pedestrians</option>
                  <option value="PASSENGER">Passengers</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#999999]">
                  Title *
                </label>
                <input
                  required type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Defensive driving in heavy rain"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#999999]">
                  Content *
                </label>
                <textarea
                  required value={content} onChange={(e) => setContent(e.target.value)}
                  rows={4} placeholder="Add actionable advice for this audience…"
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="rounded-lg border border-[#e5e5e5] px-4 py-2 text-[13px] font-medium text-[#555555] hover:bg-[#f7f7f7]">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="rounded-lg bg-[#111111] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#333333] disabled:opacity-50 active:scale-[0.97] transition">
                  {submitting ? 'Publishing…' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
