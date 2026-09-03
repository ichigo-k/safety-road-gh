'use client';

/* ─── Location picker ──────────────────────────────────────────────────────
 *
 * Turns a place into coordinates, explicitly.
 *
 * The field this replaces was a plain text input that geocoded on a debounce
 * and silently adopted the first result. Two problems with that: the operator
 * never saw which of several "Tema"s it had chosen, and a typo that matched
 * nothing produced a broadcast the form implied was targeted but which
 * actually went out network-wide.
 *
 * Here, a location is only set by an explicit choice — picking a search
 * result or using the current position — and the resolved coordinates are
 * shown back. Nothing is targeted by accident.
 * ------------------------------------------------------------------------ */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Crosshair, Loader2, MapPin, Search, X } from 'lucide-react';

export interface PickedLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  /** How it was resolved — shown so the operator can trust the value. */
  source: 'search' | 'device';
}

interface Result {
  id: string;
  name: string;
  address: string;
  municipality: string;
  latitude: number;
  longitude: number;
}

export default function LocationPicker({
  value,
  onChange,
  label = 'Affected location',
  hint = 'Leave empty to send network-wide.',
}: {
  value: PickedLocation | null;
  onChange: (next: PickedLocation | null) => void;
  label?: string;
  hint?: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Close the dropdown on an outside click, like any other combobox.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const search = useCallback((text: string) => {
    setQuery(text);
    setError('');
    if (timer.current) clearTimeout(timer.current);

    if (text.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    // Debounced: geocoding is billed per call.
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/v1/maps/search?q=${encodeURIComponent(text.trim())}`);
        const data = await res.json();
        setResults(Array.isArray(data.results) ? data.results : []);
        setOpen(true);
      } catch {
        setError('Search failed. Check your connection.');
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const pick = (r: Result) => {
    onChange({
      name: r.name,
      address: r.address || r.municipality || '',
      latitude: r.latitude,
      longitude: r.longitude,
      source: 'search',
    });
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const useDevice = () => {
    if (!navigator.geolocation) {
      setError('This browser cannot report a location.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/v1/maps/reverse?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();
          onChange({
            name: data.name ?? 'Current location',
            address: data.label ?? '',
            latitude,
            longitude,
            source: 'device',
          });
        } catch {
          // Still usable without a name — the coordinates are the point.
          onChange({
            name: 'Current location',
            address: '',
            latitude,
            longitude,
            source: 'device',
          });
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setError('Could not get this device location. Check browser permissions.');
      },
      { enableHighAccuracy: false, timeout: 10_000 }
    );
  };

  /* ── Chosen state ─────────────────────────────────────────────────────── */
  if (value) {
    return (
      <div>
        <span className="mb-1.5 block text-body font-medium text-ink-800">{label}</span>
        <div className="flex items-start gap-3 rounded-sm border border-brand bg-brand-soft px-3 py-2.5">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2.4} />
          <div className="min-w-0 flex-1">
            <p className="text-body font-semibold text-ink-900">{value.name}</p>
            {value.address ? (
              <p className="truncate text-micro text-ink-600">{value.address}</p>
            ) : null}
            {/* Show the stored value, so what is saved is never a mystery. */}
            <p className="tabular mt-1 text-micro text-ink-500">
              {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
              {value.source === 'device' ? ' · from this device' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Clear location"
            className="shrink-0 rounded-xs p-1 text-ink-500 transition-colors hover:bg-surface hover:text-ink-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  /* ── Picking state ────────────────────────────────────────────────────── */
  return (
    <div ref={boxRef}>
      <span className="mb-1.5 block text-body font-medium text-ink-800">
        {label} <span className="font-normal text-ink-400">— optional</span>
      </span>

      <div className="relative">
        <div className="flex h-11 items-center gap-2.5 rounded-sm border border-line bg-surface px-3 focus-within:border-brand">
          <Search className="h-4 w-4 shrink-0 text-ink-400" strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => search(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search for a road, town or landmark"
            aria-label="Search for a location"
            aria-expanded={open}
            role="combobox"
            aria-controls="location-results"
            className="min-w-0 flex-1 bg-transparent text-body text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
          {searching ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink-400" /> : null}
        </div>

        {open && results.length > 0 ? (
          <ul
            id="location-results"
            role="listbox"
            className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-sm border border-line bg-surface shadow-float"
          >
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => pick(r)}
                  className="flex w-full items-start gap-2.5 border-b border-line px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-ink-50"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-medium text-ink-900">{r.name}</span>
                    {r.address ? (
                      <span className="block truncate text-micro text-ink-500">{r.address}</span>
                    ) : null}
                  </span>
                  <span className="tabular shrink-0 text-micro text-ink-400">
                    {r.latitude.toFixed(3)}, {r.longitude.toFixed(3)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {open && !searching && query.trim().length >= 3 && results.length === 0 ? (
          <div className="absolute z-20 mt-1 w-full rounded-sm border border-line bg-surface px-3 py-3 text-body text-ink-500 shadow-float">
            No places found for “{query.trim()}”.
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={useDevice}
          disabled={locating}
          className="inline-flex items-center gap-1.5 text-caption font-semibold text-brand transition-colors hover:text-brand-press disabled:opacity-50"
        >
          {locating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Crosshair className="h-3.5 w-3.5" strokeWidth={2.2} />
          )}
          Use my current location
        </button>
        <span className="text-micro text-ink-500">{hint}</span>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-micro font-medium text-danger-dark">
          {error}
        </p>
      ) : null}
    </div>
  );
}
