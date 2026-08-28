"use client";

import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Plus, Shield } from 'lucide-react';

interface TipItem {
  id: string;
  category: string;
  title: string;
  content: string;
  icon?: string;
  createdAt: string;
}

const audienceOptions = [
  { value: 'DRIVER', label: 'Drivers' },
  { value: 'MOTORCYCLIST', label: 'Motorcyclists' },
  { value: 'PEDESTRIAN', label: 'Pedestrians' },
  { value: 'PASSENGER', label: 'Passengers' },
];

export default function AdminSafetyTipsPage() {
  const [tips, setTips] = useState<TipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('DRIVER');
  const [content, setContent] = useState('');

  const fetchTips = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/safety-tips');
      const data = await res.json();
      if (data.tips) setTips(data.tips);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const handleCreateTip = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setTitle('');
        setCategory('DRIVER');
        setContent('');
        fetchTips();
      } else {
        alert('Failed to save safety tip');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
            <Shield className="h-4 w-4" />
            <span>Public education</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Road safety tips</h1>
          <p className="mt-1 text-sm text-slate-600">Publish targeted education for drivers, riders, and pedestrians across Ghana.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          <span>New safety tip</span>
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">Loading road safety tips...</div>
      ) : tips.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">No safety tips published yet.</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tips.map((tip) => (
            <article key={tip.id} className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                    {tip.category}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
                    {new Date(tip.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-slate-900">{tip.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{tip.content}</p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                  Safety guide
                </span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Published
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">Create safety tip</h2>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-900">?</button>
            </div>

            <form onSubmit={handleCreateTip} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Audience</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
                >
                  <option value="DRIVER">Drivers</option>
                  <option value="MOTORCYCLIST">Motorcyclists</option>
                  <option value="PEDESTRIAN">Pedestrians</option>
                  <option value="PASSENGER">Passengers</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Defensive driving during heavy rain"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={4}
                  placeholder="Add actionable advice for this audience..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  Publish tip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
