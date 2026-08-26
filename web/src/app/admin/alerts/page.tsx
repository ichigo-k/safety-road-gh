'use client';

import React, { useState, useEffect } from 'react';
import { BellRing, Plus, AlertTriangle, CheckCircle, ShieldAlert, MapPin } from 'lucide-react';

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

  // Form state
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
      if (data.alerts) setAlerts(data.alerts);
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
          Authorization: token ? `Bearer ${token}` : '',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Broadcast Road Alerts</h1>
          <p className="text-slate-400 text-sm">Create and push emergency traffic, weather & accident alerts to mobile users</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-amber-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Alert Broadcast</span>
        </button>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading active road alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="p-12 bg-slate-950 border border-slate-800 rounded-xl text-center text-slate-400">
          No active road alerts broadcasted.
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.severity === 'CRITICAL' || alert.severity === 'HIGH'
                      ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                      : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                  }`}
                >
                  <BellRing className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : alert.severity === 'HIGH'
                          ? 'bg-orange-500 text-slate-950'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {alert.severity} SEVERITY
                    </span>
                    <span className="text-xs font-bold text-slate-400">[{alert.alertType}]</span>
                  </div>

                  <h3 className="font-bold text-white text-base">{alert.title}</h3>
                  <p className="text-xs text-slate-300 max-w-3xl">{alert.description}</p>

                  {alert.locationName && (
                    <div className="flex items-center space-x-1 text-xs text-amber-400 pt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{alert.locationName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right text-xs text-slate-500 shrink-0">
                <p>Issued by {alert.createdBy.name}</p>
                <p>{new Date(alert.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Broadcast New Emergency Alert</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Heavy Flooding on Weija-Kasoa Highway"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Category</label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  >
                    <option value="TRAFFIC">Traffic Congestion</option>
                    <option value="ACCIDENT">Major Accident</option>
                    <option value="FLOODING">Flooding / Rain hazard</option>
                    <option value="HAZARD">Road Obstruction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Affected Location / Highway</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Accra-Tema Motorway, Ashaiman stretch"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Driver Advice</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  placeholder="Provide clear traffic advice and detour routes..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-lg text-xs font-bold"
                >
                  Broadcast Alert Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
