'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  User, 
  Phone,
  Calendar,
  Clock,
  Car,
  HeartPulse
} from 'lucide-react';

interface ReportItem {
  id: string;
  type: string;
  hazardCategory?: string;
  title: string;
  description: string;
  injuredCount: number;
  vehicleCount: number;
  latitude: number;
  longitude: number;
  locationName: string;
  photoUrl?: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  history?: Array<{
    id: string;
    status: string;
    notes?: string;
    createdAt: string;
    changedBy: { name: string; role: string };
  }>;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [updateNotes, setUpdateNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/reports');
      const data = await res.json();
      if (data.reports) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/v1/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: updateNotes || `Status updated to ${newStatus} by MTTD Admin`,
        }),
      });

      if (res.ok) {
        setUpdateNotes('');
        setSelectedReport(null);
        fetchReports();
      } else {
        alert('Failed to update report status. Ensure you are signed in as Admin.');
      }
    } catch (err) {
      alert('Network error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesType = filterType === 'ALL' || r.type === filterType;
    const matchesQuery =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Accident & Hazard Reports</h1>
          <p className="text-slate-400 text-sm">Review, verify, and update status of crowd-sourced road incidents</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, location, user..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Type:</span>
          </span>
          {['ALL', 'ACCIDENT', 'HAZARD'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === t
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}

          <span className="text-xs font-semibold text-slate-400 ml-2">Status:</span>
          {['ALL', 'PENDING', 'VERIFIED', 'RESOLVED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterStatus === s
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading reports from Neon DB...</div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 bg-slate-950 border border-slate-800 rounded-xl text-center text-slate-400">
          No matching reports found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between transition"
            >
              <div>
                {/* Photo Thumbnail if available */}
                {report.photoUrl && (
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={report.photoUrl}
                      alt={report.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                          report.status === 'PENDING'
                            ? 'bg-amber-500 text-slate-950'
                            : report.status === 'VERIFIED'
                            ? 'bg-blue-600 text-white'
                            : report.status === 'RESOLVED'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-white'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-3">
                  {!report.photoUrl && (
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          report.type === 'ACCIDENT'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {report.type}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          report.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400'
                            : report.status === 'VERIFIED'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  )}

                  <h3 className="font-bold text-white text-base leading-snug">{report.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{report.description}</p>

                  <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{report.locationName}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400 pt-1">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <HeartPulse className="w-3.5 h-3.5 text-red-400" />
                          <span>{report.injuredCount} Injured</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Car className="w-3.5 h-3.5 text-blue-400" />
                          <span>{report.vehicleCount} Vehicles</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action footer */}
              <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  <p className="font-medium text-slate-200">{report.user.name}</p>
                  <p>{new Date(report.createdAt).toLocaleDateString('en-GB')}</p>
                </div>

                <button
                  onClick={() => setSelectedReport(report)}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect & Action Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-6 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Incident Inspection ({selectedReport.type})
                </span>
                <h2 className="text-xl font-extrabold text-white mt-1">{selectedReport.title}</h2>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {selectedReport.photoUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-800 max-h-64">
                <img
                  src={selectedReport.photoUrl}
                  alt={selectedReport.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3 text-sm text-slate-300">
              <p className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200">
                {selectedReport.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 font-medium">Location:</span>
                  <p className="font-bold text-white mt-1">{selectedReport.locationName}</p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    GPS: {selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)}
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 font-medium">Reporter Details:</span>
                  <p className="font-bold text-white mt-1">{selectedReport.user.name}</p>
                  <p className="text-slate-400">{selectedReport.user.phone || selectedReport.user.email}</p>
                </div>
              </div>
            </div>

            {/* Change Status Controls */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Update Report Status
              </h4>
              <textarea
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                placeholder="Add official dispatch or verification notes..."
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                rows={2}
              />

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  disabled={updating}
                  onClick={() => handleStatusUpdate(selectedReport.id, 'VERIFIED')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition"
                >
                  Mark as VERIFIED
                </button>

                <button
                  disabled={updating}
                  onClick={() => handleStatusUpdate(selectedReport.id, 'DISPATCHED')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition"
                >
                  Dispatch Responders
                </button>

                <button
                  disabled={updating}
                  onClick={() => handleStatusUpdate(selectedReport.id, 'RESOLVED')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                >
                  Mark as RESOLVED
                </button>

                <button
                  disabled={updating}
                  onClick={() => handleStatusUpdate(selectedReport.id, 'REJECTED')}
                  className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition"
                >
                  Reject Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
