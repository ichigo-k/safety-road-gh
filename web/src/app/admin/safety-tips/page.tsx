'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Shield, User, Car, Bike, Navigation } from 'lucide-react';

interface TipItem {
  id: string;
  category: string;
  title: string;
  content: string;
  icon?: string;
  createdAt: string;
}

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
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ category, title, content }),
      });

      if (res.ok) {
        setShowModal(false);
        setTitle('');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Road Safety Tips Management</h1>
          <p className="text-slate-400 text-sm">Publish driver, motorcyclist, pedestrian and passenger educational guides</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Safety Tip</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading road safety tips...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tips.map((tip) => (
            <div key={tip.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  {tip.category}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(tip.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-bold text-white text-base">{tip.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{tip.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Create Safety Tip Article</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTip} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                >
                  <option value="DRIVER">Drivers (Commercial & Private)</option>
                  <option value="MOTORCYCLIST">Motorcyclists & Delivery Riders</option>
                  <option value="PEDESTRIAN">Pedestrians</option>
                  <option value="PASSENGER">Passengers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Article Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Defensive Driving in Harmattan Fog"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Educational Content & Guidance</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={4}
                  placeholder="Detailed safety instructions..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
