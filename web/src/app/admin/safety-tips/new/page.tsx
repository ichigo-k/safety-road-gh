"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button, Surface } from '@/components/ui';

/* ── Publish a safety tip ─────────────────────────────────────────────────────
 *
 * Was a dialog on the library page. Writing guidance that goes out to every
 * driver in the country is composition, not a quick edit: it wants room, a
 * preview of how it will read, and a URL you can come back to. A dialog gave
 * it a cramped box that a stray click outside could discard.
 * -------------------------------------------------------------------------- */

const AUDIENCES = [
  { value: 'DRIVER', label: 'Drivers', hint: 'Behind the wheel of a car, van or truck.' },
  { value: 'MOTORCYCLIST', label: 'Motorcyclists', hint: 'Riders and their pillion passengers.' },
  { value: 'PEDESTRIAN', label: 'Pedestrians', hint: 'On foot, crossing or walking the roadside.' },
  { value: 'PASSENGER', label: 'Passengers', hint: 'In trotros, taxis and private vehicles.' },
];

const fieldClass =
  'w-full rounded-sm border border-line bg-surface px-3 py-2.5 text-body text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand';

export default function NewSafetyTipPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('DRIVER');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/v1/safety-tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ category, title: title.trim(), content: content.trim() }),
      });
      if (res.ok) {
        router.push('/admin/safety-tips');
      } else {
        setError('Could not publish this tip. Your session may have expired — sign in again.');
      }
    } catch {
      setError('Network error. The tip was not published.');
    } finally {
      setSubmitting(false);
    }
  };

  const audience = AUDIENCES.find((a) => a.value === category);

  return (
    <div>
      <Link
        href="/admin/safety-tips"
        className="mb-4 inline-flex items-center gap-1.5 text-caption font-semibold text-ink-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Safety library
      </Link>

      <div className="mb-5 border-b border-line pb-5">
        <h1 className="text-display font-semibold text-ink-900">New safety tip</h1>
        <p className="mt-1 text-body text-ink-500">
          Published straight to the app for the audience you choose.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-5 rounded-sm bg-danger-soft px-4 py-3 text-body text-danger-dark"
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Surface className="space-y-5 p-5">
            <div>
              <label htmlFor="tip-title" className="text-body font-medium text-ink-800">
                Title
              </label>
              <input
                id="tip-title"
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Defensive driving in heavy rain"
                className={`mt-2 ${fieldClass}`}
              />
            </div>

            <div>
              <label htmlFor="tip-content" className="text-body font-medium text-ink-800">
                Guidance
              </label>
              <p className="mt-0.5 text-caption text-ink-500">
                Write what someone should actually do. Specific beats general.
              </p>
              <textarea
                id="tip-content"
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Reduce speed by at least a third on wet tarmac. Double your following distance — braking distance roughly doubles once the surface is wet…"
                className={`mt-2 resize-y ${fieldClass}`}
              />
              <p className="tabular mt-1.5 text-micro text-ink-400">
                {content.trim().length} characters
              </p>
            </div>
          </Surface>

          <div className="space-y-5">
            <Surface className="p-5">
              <fieldset>
                <legend className="text-body font-medium text-ink-800">Audience</legend>
                <p className="mt-0.5 text-caption text-ink-500">
                  Only this group sees the tip in their app.
                </p>
                <div className="mt-3 space-y-2">
                  {AUDIENCES.map((a) => (
                    <label
                      key={a.value}
                      className={`flex cursor-pointer gap-3 rounded-sm border p-3 transition-colors ${
                        category === a.value
                          ? 'border-brand bg-brand-soft'
                          : 'border-line hover:bg-ink-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="audience"
                        value={a.value}
                        checked={category === a.value}
                        onChange={() => setCategory(a.value)}
                        className="mt-0.5 accent-brand"
                      />
                      <span className="min-w-0">
                        <span className="block text-body font-medium text-ink-900">{a.label}</span>
                        <span className="block text-caption text-ink-500">{a.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </Surface>

            {/* How it will read in the app — a tip that looks fine in a form
                can still land badly on a phone. */}
            <Surface className="p-5">
              <h2 className="flex items-center gap-2 text-micro font-medium uppercase tracking-wide text-ink-500">
                <BookOpen className="h-3.5 w-3.5" />
                Preview
              </h2>
              <div className="mt-3 rounded-sm border border-line p-3">
                <span className="inline-flex rounded-xs bg-brand-soft px-2 py-1 text-micro font-semibold text-brand-dark">
                  {audience?.label}
                </span>
                <p className="mt-2 text-body font-semibold text-ink-900">
                  {title.trim() || 'Untitled tip'}
                </p>
                <p className="mt-1 line-clamp-6 text-caption leading-5 text-ink-600">
                  {content.trim() || 'Guidance will appear here as you write it.'}
                </p>
              </div>
            </Surface>

            <div className="flex gap-2">
              <Button type="submit" disabled={!canSubmit} className="flex-1">
                {submitting ? 'Publishing…' : 'Publish'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/admin/safety-tips')}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
