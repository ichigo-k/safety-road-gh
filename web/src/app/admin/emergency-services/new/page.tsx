"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone } from 'lucide-react';
import { Button, Surface } from '@/components/ui';

/* ── Add an emergency contact ─────────────────────────────────────────────────
 *
 * Was a dialog on the services page. This record is what someone taps when
 * they are standing at a crash: a wrong number here is not a cosmetic bug.
 * It deserves a full page with room to check the details rather than a box a
 * stray click can dismiss halfway through.
 * -------------------------------------------------------------------------- */

const CATEGORIES = [
  { value: 'HOSPITAL', label: 'Hospital', hint: 'Accident and emergency units.' },
  { value: 'POLICE', label: 'Police', hint: 'MTTD and district commands.' },
  { value: 'FIRE_AMBULANCE', label: 'Fire and ambulance', hint: 'Fire service and ambulance dispatch.' },
];

const fieldClass =
  'w-full rounded-sm border border-line bg-surface px-3 py-2.5 text-body text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand';

const labelClass = 'text-body font-medium text-ink-800';

export default function NewEmergencyServicePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('HOSPITAL');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState('Greater Accra');
  const [latitude, setLatitude] = useState('5.5560');
  const [longitude, setLongitude] = useState('-0.1969');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const coordsValid =
    Number.isFinite(parseFloat(latitude)) && Number.isFinite(parseFloat(longitude));
  const canSubmit =
    name.trim() && phone.trim() && address.trim() && coordsValid && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/v1/emergency-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          category,
          phone: phone.trim(),
          altPhone: altPhone.trim(),
          address: address.trim(),
          region: region.trim(),
          latitude,
          longitude,
        }),
      });
      if (res.ok) {
        router.push('/admin/emergency-services');
      } else {
        setError('Could not save this contact. Your session may have expired — sign in again.');
      }
    } catch {
      setError('Network error. The contact was not saved.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link
        href="/admin/emergency-services"
        className="mb-4 inline-flex items-center gap-1.5 text-caption font-semibold text-ink-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Emergency contacts
      </Link>

      <div className="mb-5 border-b border-line pb-5">
        <h1 className="text-display font-semibold text-ink-900">Add emergency contact</h1>
        <p className="mt-1 text-body text-ink-500">
          Shown in the app's Emergency tab and dialled directly from it.
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
              <label htmlFor="svc-name" className={labelClass}>
                Facility / unit name
              </label>
              <input
                id="svc-name"
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ridge Hospital Emergency Unit"
                className={`mt-2 ${fieldClass}`}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="svc-phone" className={labelClass}>
                  Phone
                </label>
                <input
                  id="svc-phone"
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="193 or +233…"
                  className={`tabular mt-2 ${fieldClass}`}
                />
              </div>
              <div>
                <label htmlFor="svc-alt" className={labelClass}>
                  Alt phone <span className="font-normal text-ink-400">(optional)</span>
                </label>
                <input
                  id="svc-alt"
                  type="tel"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  placeholder="Second line"
                  className={`tabular mt-2 ${fieldClass}`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="svc-address" className={labelClass}>
                Address
              </label>
              <input
                id="svc-address"
                required
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Castle Road, Ridge, Accra"
                className={`mt-2 ${fieldClass}`}
              />
            </div>

            <div>
              <label htmlFor="svc-region" className={labelClass}>
                Region
              </label>
              <input
                id="svc-region"
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. Greater Accra"
                className={`mt-2 ${fieldClass}`}
              />
            </div>

            <div>
              <p className={labelClass}>Coordinates</p>
              <p className="mt-0.5 text-caption text-ink-500">
                Used to sort contacts by distance when someone opens the Emergency tab.
              </p>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="svc-lat" className="text-caption text-ink-500">
                    Latitude
                  </label>
                  <input
                    id="svc-lat"
                    required
                    type="text"
                    inputMode="decimal"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className={`tabular mt-1 ${fieldClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="svc-lng" className="text-caption text-ink-500">
                    Longitude
                  </label>
                  <input
                    id="svc-lng"
                    required
                    type="text"
                    inputMode="decimal"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className={`tabular mt-1 ${fieldClass}`}
                  />
                </div>
              </div>
              {!coordsValid ? (
                <p className="mt-1.5 text-caption text-danger-dark">
                  Both coordinates must be numbers.
                </p>
              ) : null}
            </div>
          </Surface>

          <div className="space-y-5">
            <Surface className="p-5">
              <fieldset>
                <legend className={labelClass}>Category</legend>
                <div className="mt-3 space-y-2">
                  {CATEGORIES.map((c) => (
                    <label
                      key={c.value}
                      className={`flex cursor-pointer gap-3 rounded-sm border p-3 transition-colors ${
                        category === c.value
                          ? 'border-brand bg-brand-soft'
                          : 'border-line hover:bg-ink-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={c.value}
                        checked={category === c.value}
                        onChange={() => setCategory(c.value)}
                        className="mt-0.5 accent-brand"
                      />
                      <span className="min-w-0">
                        <span className="block text-body font-medium text-ink-900">{c.label}</span>
                        <span className="block text-caption text-ink-500">{c.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </Surface>

            {/* The number is the whole point of the record — show it back
                exactly as it will be dialled. */}
            <Surface className="p-5">
              <h2 className="flex items-center gap-2 text-micro font-medium uppercase tracking-wide text-ink-500">
                <Phone className="h-3.5 w-3.5" />
                Will be dialled as
              </h2>
              <p className="tabular mt-2 text-title font-semibold text-ink-900">
                {phone.trim() || '—'}
              </p>
              {altPhone.trim() ? (
                <p className="tabular mt-1 text-caption text-ink-500">Alt: {altPhone.trim()}</p>
              ) : null}
            </Surface>

            <div className="flex gap-2">
              <Button type="submit" disabled={!canSubmit} className="flex-1">
                {submitting ? 'Saving…' : 'Save contact'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/admin/emergency-services')}
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
