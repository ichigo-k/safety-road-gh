'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Activity, Flame, Loader2, MapPin, Siren } from 'lucide-react';
import type { MapHotspot, MapIncident, MapService } from '@/components/AzureMap';
import { useMapChromeVisible } from './MapChrome';

// Azure Maps touches `window` at import time, so it must stay out of SSR.
const AzureMap = dynamic(() => import('@/components/AzureMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-sunken">
      <span className="flex items-center gap-2 text-caption text-ink-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading map
      </span>
    </div>
  ),
});

interface CommandMapProps {
  points: MapIncident[];
  fullscreen?: boolean;
}

export default function CommandMap({ points, fullscreen }: CommandMapProps) {
  // Same visibility state as the server-rendered overlays, so "hide panels"
  // clears the layer toggles too rather than leaving a stray row behind.
  const chromeVisible = useMapChromeVisible();
  const [hotspots, setHotspots] = useState<MapHotspot[]>([]);
  const [services, setServices] = useState<MapService[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showTraffic, setShowTraffic] = useState(false);
  // Individual incidents are off by default: each hotspot currently sits on
  // the incidents it was derived from, so showing both at once is mostly
  // redundant. It matters once several incidents feed one hotspot.
  const [showIncidents, setShowIncidents] = useState(false);
  const [showServices, setShowServices] = useState(true);

  // Hotspots are server-scored, so the map just renders what the API says
  // rather than re-clustering raw pins in the browser.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/v1/hotspots')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && Array.isArray(d.hotspots)) setHotspots(d.hotspots);
      })
      .catch(() => {
        /* the map still renders incidents without hotspots */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/v1/emergency-services')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && Array.isArray(d.services)) setServices(d.services);
      })
      .catch(() => {
        /* the map is still useful without the response-team layer */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={fullscreen ? 'relative h-full w-full' : 'relative h-full min-h-[360px] w-full'}>
      <AzureMap
        hotspots={hotspots}
        incidents={points}
        services={services}
        showHeatmap={showHeatmap}
        showTraffic={showTraffic}
        showIncidents={showIncidents}
        showServices={showServices}
      />

      {/* Layer toggles. Bottom-left on desktop keeps them clear of the KPI
          strip, the broadcast button and Azure's own zoom/style controls. */}
      {chromeVisible ? (
      <div className="absolute bottom-4 left-4 right-4 z-[450] flex flex-wrap gap-2 md:bottom-auto md:right-auto md:left-6 md:top-[104px]">
        <ToggleChip
          active={showHeatmap}
          onClick={() => setShowHeatmap((v) => !v)}
          icon={<Flame className="h-3.5 w-3.5" strokeWidth={2.2} />}
          label="Heatmap"
        />
        <ToggleChip
          active={showTraffic}
          onClick={() => setShowTraffic((v) => !v)}
          icon={<Activity className="h-3.5 w-3.5" strokeWidth={2.2} />}
          label="Traffic"
        />
        <ToggleChip
          active={showServices}
          onClick={() => setShowServices((v) => !v)}
          icon={<Siren className="h-3.5 w-3.5" strokeWidth={2.2} />}
          label="Response teams"
        />
        <ToggleChip
          active={showIncidents}
          onClick={() => setShowIncidents((v) => !v)}
          icon={<MapPin className="h-3.5 w-3.5" strokeWidth={2.2} />}
          label="Incidents"
        />
      </div>
      ) : null}
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 items-center gap-2 rounded-sm px-3 text-caption font-semibold shadow-card transition-colors ${
        active ? 'bg-brand text-white' : 'bg-surface text-ink-600 hover:bg-ink-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
