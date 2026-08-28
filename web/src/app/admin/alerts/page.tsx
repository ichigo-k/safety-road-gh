"use client";

import React, { useEffect, useState } from 'react';
import { BellRing, MapPin, Plus } from 'lucide-react';
import { Button, DrawerBody, DrawerFooter, DrawerHeader, DrawerHeaderTitle, Field, Input, OverlayDrawer, Textarea } from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';

interface RoadAlertItem {
  id: string;
  title: string;
  description: string;
  severity: string;
  alertType: string;
  locationName?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: { name: string };
}

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<RoadAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('HIGH');
  const [alertType, setAlertType] = useState('TRAFFIC');
  const [locationName, setLocationName] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/alerts');
      const data = await res.json();
      if (Array.isArray(data.alerts)) {
        setAlerts(data.alerts.map((item: Record<string, unknown>) => ({
          id: String(item.id ?? ''),
          title: String(item.title ?? 'Untitled alert'),
          description: String(item.description ?? ''),
          severity: String(item.severity ?? 'MEDIUM'),
          alertType: String(item.alertType ?? 'ROAD ALERT'),
          locationName: typeof item.locationName === 'string' ? item.locationName : (typeof item.location === 'string' ? item.location : undefined),
          isActive: Boolean(item.isActive ?? item.active),
          createdAt: String(item.createdAt ?? item.created_at ?? new Date().toISOString()),
          createdBy: item.createdBy && typeof item.createdBy === 'object' && 'name' in item.createdBy
            ? { name: String((item.createdBy as { name?: unknown }).name ?? 'MTTD Command') }
            : { name: 'MTTD Command' },
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/api/v1/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          description,
          severity,
          alertType,
          locationName,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setTitle('');
        setDescription('');
        setLocationName('');
        fetchAlerts();
      } else {
        alert('Failed to broadcast alert. Make sure you are logged in as Admin.');
      }
    } catch (err) {
      alert('Error creating alert');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Broadcast road alerts</h1>
          <p className="mt-1 text-sm text-slate-600">Create and push emergency traffic, weather, and accident alerts to mobile users.</p>
        </div>

        <Button appearance="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowModal(true)}>New alert broadcast</Button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">Loading active road alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          No active road alerts broadcasted.
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-start"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                  alert.severity === 'CRITICAL' || alert.severity === 'HIGH'
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-amber-200 bg-amber-50 text-amber-600'
                }`}>
                  <BellRing className="h-5 w-5" />
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-600 text-white'
                        : alert.severity === 'HIGH'
                          ? 'bg-orange-500 text-white'
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {alert.severity} severity
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">[{alert.alertType}]</span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900">{alert.title}</h3>
                  <p className="max-w-3xl text-sm text-slate-600">{alert.description}</p>

                  {alert.locationName && (
                    <div className="flex items-center gap-2 text-xs text-amber-700">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{alert.locationName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 text-right text-xs text-slate-500">
                <p className="font-medium text-slate-700">Issued by {alert.createdBy.name}</p>
                <p className="mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <OverlayDrawer position="end" open={showModal} onOpenChange={(_, data) => setShowModal(data.open)}>
        <DrawerHeader>
          <DrawerHeaderTitle action={<Button appearance="subtle" aria-label="Close alert sheet" icon={<Dismiss24Regular />} onClick={() => setShowModal(false)} />}>Broadcast alert</DrawerHeaderTitle>
        </DrawerHeader>
        <form onSubmit={handleCreateAlert} className="flex min-h-0 flex-1 flex-col">
          <DrawerBody className="space-y-5">
            <p className="text-sm leading-6 text-slate-600">Send a clear, time-sensitive update to road users and responders.</p>
            <Field label="Alert title" required><Input value={title} onChange={(_, data) => setTitle(data.value)} placeholder="Heavy flooding on Weija-Kasoa Highway" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Alert category"><select value={alertType} onChange={(e) => setAlertType(e.target.value)} className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm"><option value="TRAFFIC">Traffic congestion</option><option value="ACCIDENT">Major accident</option><option value="FLOODING">Flooding / rain hazard</option><option value="HAZARD">Road obstruction</option></select></Field>
              <Field label="Severity"><select value={severity} onChange={(e) => setSeverity(e.target.value)} className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical emergency</option></select></Field>
            </div>
            <Field label="Affected location"><Input value={locationName} onChange={(_, data) => setLocationName(data.value)} placeholder="Accra-Tema Motorway" /></Field>
            <Field label="Description" required><Textarea value={description} onChange={(_, data) => setDescription(data.value)} resize="vertical" rows={5} placeholder="Provide traffic advice and detour routes..." /></Field>
          </DrawerBody>
          <DrawerFooter><Button appearance="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button appearance="primary" type="submit">Broadcast alert</Button></DrawerFooter>
        </form>
      </OverlayDrawer>
    </div>
  );
}
