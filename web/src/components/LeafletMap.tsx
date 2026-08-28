'use client';

import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { LocateFixed } from 'lucide-react';

type MapPoint = {
  id: string;
  title: string;
  type: string;
  locationName: string;
  status: string;
  latitude: number;
  longitude: number;
};

function RecenterControl({ center }: { center: [number, number] }) {
  const map = useMap();
  return (
    <button
      type="button"
      aria-label="Recenter map"
      onClick={() => map.flyTo(center, 12, { duration: 0.7 })}
      className="absolute right-4 top-4 z-[500] flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe9e1] bg-white text-[#0e7a3f] shadow-[0_8px_22px_rgba(16,32,24,.14)] transition hover:-translate-y-0.5 hover:bg-[#f3fff6] active:scale-95"
    >
      <LocateFixed className="h-4 w-4" />
    </button>
  );
}

function markerColor(point: MapPoint) {
  if (point.status === 'RESOLVED') return '#2fdf76';
  if (point.type === 'ACCIDENT') return '#e95d5d';
  return '#f1a33a';
}

export default function LeafletMap({ points }: { points: MapPoint[] }) {
  const accra: [number, number] = [5.6037, -0.187];
  const validPoints = points.filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));

  return (
    <div className="relative h-full min-h-[360px] overflow-hidden rounded-[24px]">
      <MapContainer center={accra} zoom={12} scrollWheelZoom className="h-full min-h-[360px] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterControl center={accra} />
        {validPoints.map((point) => (
          <CircleMarker
            key={point.id}
            center={[point.latitude, point.longitude]}
            radius={point.status === 'PENDING' ? 10 : 8}
            pathOptions={{ color: '#fff', weight: 3, fillColor: markerColor(point), fillOpacity: 0.95 }}
          >
            <Popup>
              <div className="min-w-[190px] p-1">
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#0e7a3f]">{point.type}</p>
                <p className="mt-1 text-sm font-bold text-[#102018]">{point.title}</p>
                <p className="mt-1 text-xs text-[#6d7d73]">{point.locationName}</p>
                <span className="mt-3 inline-flex rounded-full bg-[#e7f9ed] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0e7a3f]">{point.status}</span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
