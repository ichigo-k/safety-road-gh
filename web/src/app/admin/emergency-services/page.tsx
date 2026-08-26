'use client';

import React, { useState, useEffect } from 'react';
import { PhoneCall, Plus, MapPin, Building, Shield } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  phone: string;
  altPhone?: string;
  address: string;
  region: string;
}

export default function AdminEmergencyServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/api/v1/emergency-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          name,
          category,
          phone,
          altPhone,
          address,
          region,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName('');
        setPhone('');
        fetchServices();
      } else {
        alert('Failed to add emergency service.');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Emergency Services Directory</h1>
          <p className="text-slate-400 text-sm">Manage emergency contact numbers (Police, Ambulance, Fire, Hospitals) for Ghana</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-lg font-bold text-sm transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Emergency Service</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading emergency directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      service.category === 'HOSPITAL'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : service.category === 'POLICE'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {service.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{service.region}</span>
                </div>

                <h3 className="font-bold text-white text-base leading-snug">{service.name}</h3>

                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{service.address}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <PhoneCall className="w-4 h-4" />
                  <span>{service.phone}</span>
                </div>
                {service.altPhone && <span className="text-xs text-slate-500">Alt: {service.altPhone}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Add Emergency Contact</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddService} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Facility / Unit Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Ridge Hospital Emergency Unit"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  >
                    <option value="HOSPITAL">Hospital</option>
                    <option value="POLICE">Police</option>
                    <option value="FIRE_AMBULANCE">Fire & Ambulance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Region</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    required
                    placeholder="e.g. Ashanti"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="193 or +233..."
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Alt Phone</label>
                  <input
                    type="text"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="Optional..."
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Address Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="e.g. Castle Road, Ridge, Accra"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
