"use client";

import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Plus, X } from 'lucide-react';

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
    <div className="flex flex-col rounded-xl border border-[#e5e5e5] bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="skeleton h-4 w-16 rounded-full" />
        <div className="skeleton h-4 w-20 rounded" />
      </div>
      <div className="mt-3 skeleton h-4 w-3/4" />
      <div className="mt-2 skeleton h-3 w-full" />
      <div className="mt-1 skeleton h-3 w-2/3" />
      <div className="mt-4 border-t border-[#f0f0f0] pt-3">
        <div className="skeleton h-4 w-28" />
      </div>
    </div>
  );
}

const CATEGORY_STYLES: Record<string, { label: string; pill: string; icon: string }> = {
  HOSPITAL: { label: 'Hospital', pill: 'bg-blue-50 text-blue-700 border border-blue-200', icon: '🏥' },
  POLICE: { label: 'Police', pill: 'bg-[#f0f0f0] text-[#555555] border border-[#e5e5e5]', icon: '🚔' },
  FIRE_AMBULANCE: { label: 'Fire/Ambulance', pill: 'bg-red-50 text-red-700 border border-red-200', icon: '🚒' },
};

export default function AdminEmergencyServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('HOSPITAL');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState('Greater Accra');
  const [latitude, setLatitude] = useState('5.5560');
  const [longitude, setLongitude] = useState('-0.1969');

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/api/v1/emergency-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name, category, phone, altPhone, address, region,
          latitude: parseFloat(latitude), longitude: parseFloat(longitude),
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setName(''); setPhone(''); setAltPhone(''); setAddress(''); setRegion('Greater Accra');
        fetchServices();
      } else {
        alert('Failed to add service.');
      }
    } catch { alert('Network error'); }
    finally { setSubmitting(false); }
  };

  /* group by category */
  const byCategory: Record<string, ServiceItem[]> = {};
  services.forEach((s) => {
    if (!byCategory[s.category]) byCategory[s.category] = [];
    byCategory[s.category].push(s);
  });

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#999999]">
        {label}
      </label>
      {children}
    </div>
  );

  const inputCls = "w-full rounded-lg border border-[#e5e5e5] px-3 py-2.5 text-[13px] text-[#111111] outline-none placeholder:text-[#c4c4c4] focus:border-[#111111] transition bg-white";

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e5e5e5] pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-[#111111]">Response teams</h1>
          <p className="mt-1 text-sm text-[#999999]">Police, ambulance, fire, and hospitals across Ghana.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#111111] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#333333] active:scale-[0.97]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add service
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#e5e5e5] bg-white p-4">
              <div className="skeleton h-7 w-8 mb-1" />
              <div className="skeleton h-3 w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[26px] font-extrabold tracking-[-0.05em] text-[#111111]">{services.length}</p>
            <p className="text-[11px] font-semibold text-[#111111]">Total services</p>
          </div>
          {Object.entries(CATEGORY_STYLES).map(([cat, meta]) => (
            <div key={cat} className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-3">
              <p className="text-[26px] font-extrabold tracking-[-0.05em] text-[#111111]">
                {byCategory[cat]?.length ?? 0}
              </p>
              <p className="text-[11px] font-semibold text-[#111111]">{meta.icon} {meta.label}</p>
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
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#e5e5e5] bg-white py-16 text-center">
          <Phone className="mb-3 h-8 w-8 text-[#e5e5e5]" />
          <p className="text-[14px] font-semibold text-[#555555]">No services added yet</p>
        </div>
      ) : (
        Object.entries(byCategory).map(([cat, items]) => {
          const meta = CATEGORY_STYLES[cat] ?? { label: cat, pill: 'bg-[#f0f0f0] text-[#555555]', icon: '📍' };
          return (
            <div key={cat}>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-base">{meta.icon}</span>
                <h2 className="text-[13px] font-bold text-[#111111]">{meta.label}</h2>
                <span className="rounded-full bg-[#f0f0f0] px-2 py-0.5 text-[10px] font-semibold text-[#555555]">
                  {items.length}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-col rounded-xl border border-[#e5e5e5] bg-white p-4 transition hover:border-[#d1d1d1] hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.pill}`}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-[#999999]">{service.region}</span>
                    </div>

                    <h3 className="mt-2.5 text-[13px] font-bold text-[#111111] leading-snug">{service.name}</h3>

                    <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-[#999999]">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>{service.address}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#f0f0f0] pt-3">
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#111111]">
                        <Phone className="h-3.5 w-3.5 text-[#999999]" />
                        {service.phone}
                      </div>
                      {service.altPhone && (
                        <span className="text-[10px] text-[#999999]">Alt: {service.altPhone}</span>
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
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.14)]">

            <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4">
              <h2 className="text-[14px] font-extrabold tracking-[-0.02em] text-[#111111]">Add emergency contact</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-[#999999] hover:bg-[#f7f7f7] hover:text-[#111111]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 px-5 py-5">
              <Field label="Facility / unit name">
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ridge Hospital Emergency Unit" className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                    <option value="HOSPITAL">Hospital</option>
                    <option value="POLICE">Police</option>
                    <option value="FIRE_AMBULANCE">Fire / Ambulance</option>
                  </select>
                </Field>
                <Field label="Region">
                  <input required type="text" value={region} onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. Ashanti" className={inputCls} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone">
                  <input required type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="193 or +233…" className={inputCls} />
                </Field>
                <Field label="Alt phone">
                  <input type="text" value={altPhone} onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="Optional" className={inputCls} />
                </Field>
              </div>

              <Field label="Address">
                <input required type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Castle Road, Ridge, Accra" className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Latitude">
                  <input required type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Longitude">
                  <input required type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)} className={inputCls} />
                </Field>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="rounded-lg border border-[#e5e5e5] px-4 py-2 text-[13px] font-medium text-[#555555] hover:bg-[#f7f7f7]">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="rounded-lg bg-[#111111] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#333333] disabled:opacity-50 active:scale-[0.97] transition">
                  {submitting ? 'Saving…' : 'Save contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
