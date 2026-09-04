"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Plus } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  phone: string;
  altPhone?: string;
  address: string;
  region: string;
}

/* ── Skeleton: matches service card layout ───────────────────────── */
function ServiceCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border border-line bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="skeleton h-4 w-16 rounded-full" />
        <div className="skeleton h-4 w-20 rounded" />
      </div>
      <div className="mt-3 skeleton h-4 w-3/4" />
      <div className="mt-2 skeleton h-3 w-full" />
      <div className="mt-1 skeleton h-3 w-2/3" />
      <div className="mt-4 border-t border-line pt-3">
        <div className="skeleton h-4 w-28" />
      </div>
    </div>
  );
}

const CATEGORY_STYLES: Record<string, { label: string; pill: string; icon: string }> = {
  HOSPITAL: { label: 'Hospital', pill: 'bg-info-soft text-info-dark', icon: '🏥' },
  POLICE: { label: 'Police', pill: 'bg-brand-soft text-brand-dark', icon: '🚔' },
  FIRE_AMBULANCE: { label: 'Fire and ambulance', pill: 'bg-danger-soft text-danger-dark', icon: '🚒' },
};

export default function AdminEmergencyServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/emergency-services');
      const data = await res.json();
      if (data.services) setServices(data.services);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, []);


  /* group by category */
  const byCategory: Record<string, ServiceItem[]> = {};
  services.forEach((s) => {
    if (!byCategory[s.category]) byCategory[s.category] = [];
    byCategory[s.category].push(s);
  });

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="mb-1.5 block text-micro font-semibold text-ink-500">
        {label}
      </label>
      {children}
    </div>
  );

  const inputCls = "w-full rounded-sm border border-line px-3 py-2.5 text-body text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand transition bg-white";

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-display font-semibold text-ink-900">Response teams</h1>
          <p className="mt-1 text-body text-ink-500">Police, ambulance, fire, and hospitals across Ghana.</p>
        </div>
        <Link
          href="/admin/emergency-services/new"
          className="inline-flex items-center gap-2 rounded-sm bg-brand px-4 py-2.5 text-body font-semibold text-white transition hover:bg-brand-press active:scale-[0.97]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add service
        </Link>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-line bg-white p-4">
              <div className="skeleton h-7 w-8 mb-1" />
              <div className="skeleton h-3 w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-line bg-white px-4 py-3">
            <p className="text-metric font-semibold text-ink-900">{services.length}</p>
            <p className="text-micro font-semibold text-ink-900">Total services</p>
          </div>
          {Object.entries(CATEGORY_STYLES).map(([cat, meta]) => (
            <div key={cat} className="rounded-lg border border-line bg-white px-4 py-3">
              <p className="text-metric font-semibold text-ink-900">
                {byCategory[cat]?.length ?? 0}
              </p>
              <p className="text-micro font-semibold text-ink-900">{meta.icon} {meta.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Grouped grid ───────────────────────────────────────────── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-line bg-white py-16 text-center">
          <Phone className="mb-3 h-8 w-8 text-ink-300" />
          <p className="text-base font-semibold text-ink-600">No services added yet</p>
        </div>
      ) : (
        Object.entries(byCategory).map(([cat, items]) => {
          const meta = CATEGORY_STYLES[cat] ?? { label: cat, pill: 'bg-ink-50 text-ink-600', icon: '📍' };
          return (
            <div key={cat}>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-base">{meta.icon}</span>
                <h2 className="text-body font-semibold text-ink-900">{meta.label}</h2>
                <span className="rounded-full bg-ink-50 px-2 py-0.5 text-micro font-semibold text-ink-600">
                  {items.length}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-col rounded-lg border border-line bg-white p-4 transition hover:border-line-strong hover:shadow-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-flex rounded-xs px-2 py-1 text-micro font-semibold ${meta.pill}`}>
                        {meta.label}
                      </span>
                      {/* EmergencyService has no `region` column, so this printed the
                          literal string "undefined" on every card. Render it only if a
                          value ever arrives. See the note on the Region field below. */}
                      {service.region ? (
                        <span className="text-micro text-ink-500">{service.region}</span>
                      ) : null}
                    </div>

                    <h3 className="mt-2.5 text-body font-semibold text-ink-900 leading-snug">{service.name}</h3>

                    <div className="mt-1.5 flex items-start gap-1.5 text-micro text-ink-500">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>{service.address}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                      <div className="flex items-center gap-1.5 text-caption font-semibold text-ink-900">
                        <Phone className="h-3.5 w-3.5 text-ink-500" />
                        {service.phone}
                      </div>
                      {service.altPhone && (
                        <span className="text-micro text-ink-500">Alt: {service.altPhone}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* ── Add modal ──────────────────────────────────────────────── */}
    </div>
  );
}
