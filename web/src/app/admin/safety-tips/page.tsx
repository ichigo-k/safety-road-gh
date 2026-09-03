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

  const inputCls = "w-full rounded-sm border border-line px-3 py-2.5 text-body text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand transition bg-white";

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-display font-semibold text-ink-900">Safety library</h1>
          <p className="mt-1 text-body text-ink-500">Targeted education for drivers, riders, and pedestrians.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-sm bg-brand px-4 py-2.5 text-body font-semibold text-white transition hover:bg-brand-press active:scale-[0.97]"
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
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-caption font-semibold text-ink-900 underline underline-offset-2"
          >
            Add the first one
          </button>
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

      {/* ── Create modal ───────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-line bg-white shadow-overlay">

            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-base font-semibold text-ink-900">New safety tip</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-sm p-1.5 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 px-5 py-5">
              <div>
                <label className="mb-1.5 block text-micro font-semibold text-ink-500">
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
                <label className="mb-1.5 block text-micro font-semibold text-ink-500">
                  Title *
                </label>
                <input
                  required type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Defensive driving in heavy rain"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-micro font-semibold text-ink-500">
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
                  className="rounded-sm border border-line px-4 py-2 text-body font-medium text-ink-600 hover:bg-ink-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="rounded-sm bg-brand px-5 py-2 text-body font-semibold text-white hover:bg-brand-press disabled:opacity-50 active:scale-[0.97] transition">
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
