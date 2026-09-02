'use client';

import { useMemo } from 'react';
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
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

// ─── Snap-map hotspot logic ───────────────────────────────────────────────────
// Cluster points that are within ~0.008° of each other (≈ 900 m radius)
const CLUSTER_RADIUS = 0.008;

interface Cluster {
  lat: number;
  lng: number;
  count: number;
  points: MapPoint[];
  dominantType: string;
}

function clusterPoints(points: MapPoint[]): Cluster[] {
  const visited = new Set<number>();
  const clusters: Cluster[] = [];

  for (let i = 0; i < points.length; i++) {
    if (visited.has(i)) continue;
    const group: MapPoint[] = [points[i]];
    visited.add(i);

    for (let j = i + 1; j < points.length; j++) {
      if (visited.has(j)) continue;
      const dLat = points[i].latitude - points[j].latitude;
      const dLng = points[i].longitude - points[j].longitude;
      if (Math.sqrt(dLat * dLat + dLng * dLng) < CLUSTER_RADIUS) {
        group.push(points[j]);
        visited.add(j);
      }
    }

    const lat = group.reduce((s, p) => s + p.latitude, 0) / group.length;
    const lng = group.reduce((s, p) => s + p.longitude, 0) / group.length;
    const accidentCount = group.filter((p) => p.type === 'ACCIDENT').length;
    clusters.push({
      lat,
      lng,
      count: group.length,
      points: group,
      dominantType: accidentCount >= group.length / 2 ? 'ACCIDENT' : 'HAZARD',
    });
  }

  return clusters;
}

// ─── Snap-map style sizing & colour ──────────────────────────────────────────
// count 1 → small muted dot; count 5+ → large vivid hotspot blob
function hotspotStyle(cluster: Cluster) {
  const { count, dominantType, points } = cluster;

  // Has any unresolved reports?
  const hasActive = points.some((p) => p.status !== 'RESOLVED');
  const allResolved = points.every((p) => p.status === 'RESOLVED');

  if (allResolved) {
    // Resolved cluster — small calm green
    const r = 7 + Math.min(count, 5) * 1.5;
    return { radius: r, fillColor: '#22c55e', fillOpacity: 0.75, color: '#fff', weight: 2 };
  }

  // Intensity scale: 1 → 0.55 opacity/small; 10+ → 1.0 opacity/large
  const intensity = Math.min(count / 10, 1); // 0–1
  const baseRadius = dominantType === 'ACCIDENT' ? 12 : 10;
  const radius = baseRadius + intensity * 22; // 12–34 for accidents, 10–32 for hazards

  if (dominantType === 'ACCIDENT') {
    // Snap map red-orange heat
    const r = Math.round(220 + intensity * 35).toString(16).padStart(2, '0');
    const g = Math.round(60 - intensity * 40).toString(16).padStart(2, '0');
    const b = Math.round(60 - intensity * 40).toString(16).padStart(2, '0');
    const fill = `#${r}${g}${b}`;
    return {
      radius,
      fillColor: fill,
      fillOpacity: 0.55 + intensity * 0.45,
      color: '#fff',
      weight: count > 3 ? 0 : 2,
    };
  } else {
    // Amber-orange for hazard clusters
    const fill = intensity > 0.5 ? '#f97316' : '#f59e0b';
    return {
      radius,
      fillColor: fill,
      fillOpacity: 0.55 + intensity * 0.45,
      color: '#fff',
      weight: count > 3 ? 0 : 2,
    };
  }
}

// ─── Recenter button ──────────────────────────────────────────────────────────
function RecenterControl({ center }: { center: [number, number] }) {
  const map = useMap();
  return (
    <button
      type="button"
      aria-label="Recenter map"
      onClick={() => map.flyTo(center, 12, { duration: 0.7 })}
      className="absolute right-4 top-4 z-[500] flex h-10 w-10 items-center justify-center rounded-xl border border-white/80 bg-white text-[#0e7a3f] shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition hover:bg-[#f3fff6] active:scale-95"
    >
      <LocateFixed className="h-4 w-4" />
    </button>
  );
}

// ─── Popup content ────────────────────────────────────────────────────────────
function ClusterPopup({ cluster }: { cluster: Cluster }) {
  const pendingCount = cluster.points.filter((p) => p.status === 'PENDING').length;
  const resolvedCount = cluster.points.filter((p) => p.status === 'RESOLVED').length;

  return (
    <div className="min-w-[200px] p-1.5">
      {cluster.count > 1 ? (
        <>
          <p
            className="text-[10px] font-bold uppercase tracking-[.14em]"
            style={{ color: cluster.dominantType === 'ACCIDENT' ? '#dc2626' : '#f97316' }}
          >
            {cluster.count} incidents in area
          </p>
          <div className="mt-2 space-y-1 text-xs text-[#374151]">
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {pendingCount} pending review
              </div>
            )}
            {resolvedCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {resolvedCount} resolved
              </div>
            )}
          </div>
          <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-2">
            {cluster.points.slice(0, 3).map((p) => (
              <p key={p.id} className="truncate text-xs font-medium text-[#111827]">
                {p.title}
              </p>
            ))}
            {cluster.points.length > 3 && (
              <p className="text-[10px] text-[#6b7280]">+{cluster.points.length - 3} more</p>
            )}
          </div>
        </>
      ) : (
        <>
          <p
            className="text-[10px] font-bold uppercase tracking-[.14em]"
            style={{ color: cluster.dominantType === 'ACCIDENT' ? '#dc2626' : '#f97316' }}
          >
            {cluster.points[0].type}
          </p>
          <p className="mt-1 text-sm font-bold text-[#111827]">{cluster.points[0].title}</p>
          <p className="mt-0.5 text-xs text-[#6b7280]">{cluster.points[0].locationName}</p>
          <span
            className="mt-2.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{
              background: cluster.points[0].status === 'RESOLVED' ? '#dcfce7' : '#fef3c7',
              color: cluster.points[0].status === 'RESOLVED' ? '#15803d' : '#92400e',
            }}
          >
            {cluster.points[0].status}
          </span>
        </>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LeafletMap({
  points,
  fullscreen,
}: {
  points: MapPoint[];
  fullscreen?: boolean;
}) {
  const accra: [number, number] = [5.6037, -0.187];

  const validPoints = points.filter(
    (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude)
  );

  const clusters = useMemo(() => clusterPoints(validPoints), [validPoints]);

  return (
    <div
      className={
        fullscreen
          ? 'relative h-full w-full overflow-hidden'
          : 'relative h-full min-h-[360px] overflow-hidden rounded-[20px]'
      }
    >
      <MapContainer
        center={accra}
        zoom={12}
        scrollWheelZoom
        className={fullscreen ? 'h-full w-full' : 'h-full min-h-[360px] w-full'}
      >
        {/* Light, clean CartoDB Positron tiles — no dark mode */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <RecenterControl center={accra} />

        {clusters.map((cluster, idx) => {
          const style = hotspotStyle(cluster);
          return (
            <CircleMarker
              key={idx}
              center={[cluster.lat, cluster.lng]}
              radius={style.radius}
              pathOptions={{
                color: style.color,
                weight: style.weight,
                fillColor: style.fillColor,
                fillOpacity: style.fillOpacity,
              }}
            >
              <Popup>
                <ClusterPopup cluster={cluster} />
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
