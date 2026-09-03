'use client';

/* ─── Azure Maps command map ───────────────────────────────────────────────
 *
 * Replaces the Leaflet + CARTO map. Three things this buys that Leaflet did
 * not: real traffic flow and incident layers, a heatmap that weights by risk
 * score rather than raw pin count, and hotspot geofences drawn at their true
 * radius in metres instead of a fixed pixel circle that lied at every zoom.
 *
 * The subscription key here is NEXT_PUBLIC_ and therefore visible in the
 * client bundle — unavoidable for browser-rendered tiles. It is deliberately
 * the secondary key, so it can be rotated without taking the routing proxy
 * (which uses the primary, server-side) down with it.
 * ------------------------------------------------------------------------ */

import React, { useEffect, useRef, useState } from 'react';
import * as atlas from 'azure-maps-control';
import 'azure-maps-control/dist/atlas.min.css';
import { AlertTriangle, Layers, Loader2, Navigation, Route } from 'lucide-react';

export interface MapHotspot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusM: number;
  riskScore: number;
  currentRisk?: number;
  severity: string;
  dominantType: string;
  incidentCount: number;
  casualtyCount?: number;
  status?: string;
}

export interface MapIncident {
  id: string;
  title: string;
  type: string;
  status: string;
  latitude: number;
  longitude: number;
  locationName: string;
}

export interface MapService {
  id: string;
  name: string;
  type: string;
  phone: string;
  latitude: number;
  longitude: number;
}

interface AzureMapProps {
  hotspots?: MapHotspot[];
  incidents?: MapIncident[];
  services?: MapService[];
  showIncidents?: boolean;
  showServices?: boolean;
  center?: [number, number];
  zoom?: number;
  showHeatmap?: boolean;
  showTraffic?: boolean;
  onSelectHotspot?: (id: string) => void;
  className?: string;
}

const ACCRA: [number, number] = [-0.187, 5.6037];

/* Severity fills, drawn from the same tokens the rest of the console uses. */
const SEVERITY_FILL: Record<string, string> = {
  CRITICAL: '#BC3B2F',
  HIGH: '#C4522F',
  MEDIUM: '#B4661C',
  LOW: '#9A7016',
};

export default function AzureMap({
  hotspots = [],
  incidents = [],
  services = [],
  center = ACCRA,
  zoom = 11,
  showHeatmap = true,
  showTraffic = false,
  showIncidents = false,
  showServices = true,
  onSelectHotspot,
  className = '',
}: AzureMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<atlas.Map | null>(null);
  const hotspotSourceRef = useRef<atlas.source.DataSource | null>(null);
  const incidentSourceRef = useRef<atlas.source.DataSource | null>(null);
  const serviceSourceRef = useRef<atlas.source.DataSource | null>(null);
  const heatLayerRef = useRef<atlas.layer.HeatMapLayer | null>(null);
  const incidentLayerRef = useRef<atlas.layer.BubbleLayer | null>(null);
  const serviceLayerRef = useRef<atlas.layer.SymbolLayer | null>(null);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const key = process.env.NEXT_PUBLIC_AZURE_MAPS_KEY;

  // ── Create the map once ───────────────────────────────────────────────
  useEffect(() => {
    if (!key || !containerRef.current || mapRef.current) return;

    let map: atlas.Map;
    try {
      map = new atlas.Map(containerRef.current, {
        center,
        zoom,
        style: 'road',
        language: 'en-US',
        showLogo: true,
        showFeedbackLink: false,
        authOptions: {
          authType: atlas.AuthenticationType.subscriptionKey,
          subscriptionKey: key,
        },
      });
    } catch (e) {
      setFailed(e instanceof Error ? e.message : 'Map failed to initialise');
      return;
    }

    mapRef.current = map;

    map.events.add('error', (e: { error?: { message?: string } }) => {
      setFailed(e?.error?.message ?? 'Azure Maps returned an error');
    });

    map.events.add('ready', () => {
      map.controls.add(
        [
          new atlas.control.ZoomControl(),
          new atlas.control.StyleControl({
            mapStyles: ['road', 'satellite_road_labels', 'grayscale_light', 'night'],
          }),
        ],
        { position: atlas.ControlPosition.TopRight }
      );

      // ── Hotspot geofences ──────────────────────────────────────────────
      // Azure renders a Point feature tagged subType "Circle" as a true
      // ground circle, so the ring on screen is the actual alert radius at
      // every zoom level rather than a fixed number of pixels.
      const hotspotSource = new atlas.source.DataSource();
      map.sources.add(hotspotSource);
      hotspotSourceRef.current = hotspotSource;

      const fillExpression: atlas.Expression = [
        'match',
        ['get', 'severity'],
        'CRITICAL', SEVERITY_FILL.CRITICAL,
        'HIGH', SEVERITY_FILL.HIGH,
        'MEDIUM', SEVERITY_FILL.MEDIUM,
        'LOW', SEVERITY_FILL.LOW,
        SEVERITY_FILL.MEDIUM,
      ];

      const geofenceFill = new atlas.layer.PolygonLayer(hotspotSource, 'hotspot-fill', {
        fillColor: fillExpression,
        // Risk drives opacity, so a glance shows where the danger concentrates.
        fillOpacity: ['interpolate', ['linear'], ['get', 'risk'], 0, 0.08, 100, 0.3],
        filter: ['==', ['geometry-type'], 'Polygon'],
      });

      const geofenceLine = new atlas.layer.LineLayer(hotspotSource, 'hotspot-line', {
        strokeColor: fillExpression,
        strokeWidth: 1.5,
        strokeOpacity: 0.7,
        filter: ['==', ['geometry-type'], 'Polygon'],
      });

      const heat = new atlas.layer.HeatMapLayer(hotspotSource, 'hotspot-heat', {
        weight: ['interpolate', ['linear'], ['get', 'risk'], 0, 0, 100, 1],
        radius: ['interpolate', ['exponential', 2], ['zoom'], 8, 12, 16, 60],
        opacity: 0.55,
        filter: ['==', ['geometry-type'], 'Point'],
      });
      heatLayerRef.current = heat;

      const bubbles = new atlas.layer.BubbleLayer(hotspotSource, 'hotspot-bubble', {
        radius: ['interpolate', ['linear'], ['get', 'risk'], 0, 6, 100, 20],
        color: fillExpression,
        strokeColor: '#FFFFFF',
        strokeWidth: 2,
        opacity: 0.9,
        filter: ['==', ['geometry-type'], 'Point'],
      });

      const labels = new atlas.layer.SymbolLayer(hotspotSource, 'hotspot-label', {
        iconOptions: { image: 'none' },
        textOptions: {
          textField: ['to-string', ['get', 'incidentCount']],
          color: '#FFFFFF',
          font: ['SegoeUi-Bold'],
          size: 11,
          offset: [0, 0.1],
          allowOverlap: true,
        },
        filter: ['==', ['geometry-type'], 'Point'],
      });

      // ── Incident pins ──────────────────────────────────────────────────
      const incidentSource = new atlas.source.DataSource();
      map.sources.add(incidentSource);
      incidentSourceRef.current = incidentSource;

      // Small and stroked so it reads as a distinct pin sitting *inside* a
      // hotspot rather than being swallowed by it. Previously this was drawn
      // beneath the hotspot bubble and was therefore permanently invisible:
      // every hotspot sits exactly on the incidents it was derived from.
      const incidentLayer = new atlas.layer.BubbleLayer(incidentSource, 'incident-bubble', {
        radius: 4,
        color: ['case', ['==', ['get', 'type'], 'ACCIDENT'], '#8F2A21', '#8A4E15'],
        strokeColor: '#FFFFFF',
        strokeWidth: 1.5,
        opacity: 0.95,
      });
      incidentLayerRef.current = incidentLayer;

      // Emergency services. A dispatcher deciding where to send help needs to
      // see where the teams actually are; the mobile app has always shown
      // these and the console did not, which had it backwards.
      const serviceSource = new atlas.source.DataSource();
      map.sources.add(serviceSource);
      serviceSourceRef.current = serviceSource;

      const serviceLayer = new atlas.layer.SymbolLayer(serviceSource, 'service-symbol', {
        iconOptions: { image: 'none' },
        textOptions: {
          // Emoji keeps hospital/police/fire distinguishable without shipping
          // a sprite sheet, and stays legible against any basemap style.
          textField: ['get', 'glyph'],
          size: 17,
          allowOverlap: true,
        },
      });
      serviceLayerRef.current = serviceLayer;

      // Order matters: heat underneath, then geofence rings, then hotspot
      // bubbles, then individual incidents drawn on top of them, then
      // services, and finally the count labels.
      map.layers.add([
        heat,
        geofenceFill,
        geofenceLine,
        bubbles,
        incidentLayer,
        serviceLayer,
        labels,
      ]);

      // ── Popups ─────────────────────────────────────────────────────────
      const popup = new atlas.Popup({ pixelOffset: [0, -12], closeButton: true });

      map.events.add('click', bubbles, (e) => {
        const shape = e.shapes?.[0];
        if (!shape || !('getProperties' in shape)) return;
        const p = shape.getProperties() as Record<string, unknown>;
        const coord = (shape as atlas.Shape).getCoordinates() as atlas.data.Position;

        popup.setOptions({
          position: coord,
          content: `
            <div style="font:14px/1.4 system-ui,sans-serif;padding:12px 14px;min-width:200px">
              <div style="font-weight:600;color:#14181D;margin-bottom:2px">${escapeHtml(String(p.name ?? 'Hotspot'))}</div>
              <div style="color:#69727D;font-size:12px;margin-bottom:8px">${escapeHtml(String(p.severity ?? ''))} &middot; ${escapeHtml(String(p.status ?? 'ACTIVE'))}</div>
              <div style="display:flex;gap:14px;font-size:12px;color:#3D444D">
                <span><strong style="color:#14181D">${Number(p.risk ?? 0).toFixed(0)}</strong> risk</span>
                <span><strong style="color:#14181D">${Number(p.incidentCount ?? 0)}</strong> incidents</span>
                <span><strong style="color:#14181D">${Number(p.radiusM ?? 0)}</strong> m</span>
              </div>
            </div>`,
        });
        popup.open(map);
        if (p.id) onSelectHotspot?.(String(p.id));
      });

      map.events.add('click', incidentLayer, (e) => {
        const shape = e.shapes?.[0];
        if (!shape || !('getProperties' in shape)) return;
        const p = shape.getProperties() as Record<string, unknown>;
        const coord = (shape as atlas.Shape).getCoordinates() as atlas.data.Position;
        popup.setOptions({
          position: coord,
          content: `
            <div style="font:14px/1.4 system-ui,sans-serif;padding:12px 14px;min-width:180px">
              <div style="font-weight:600;color:#14181D">${escapeHtml(String(p.title ?? 'Incident'))}</div>
              <div style="color:#69727D;font-size:12px;margin-top:2px">${escapeHtml(String(p.locationName ?? ''))}</div>
            </div>`,
        });
        popup.open(map);
      });

      map.events.add('click', serviceLayer, (e) => {
        const shape = e.shapes?.[0];
        if (!shape || !('getProperties' in shape)) return;
        const p = shape.getProperties() as Record<string, unknown>;
        const coord = (shape as atlas.Shape).getCoordinates() as atlas.data.Position;
        const phone = escapeHtml(String(p.phone ?? ''));
        popup.setOptions({
          position: coord,
          content: `
            <div style="font:14px/1.4 system-ui,sans-serif;padding:12px 14px;min-width:190px">
              <div style="font-weight:600;color:#14181D">${escapeHtml(String(p.name ?? 'Service'))}</div>
              <div style="color:#69727D;font-size:12px;margin-top:2px">${escapeHtml(String(p.type ?? ''))}</div>
              <a href="tel:${phone}" style="display:inline-block;margin-top:8px;color:#146B45;font-weight:600;font-size:13px;text-decoration:none">${phone}</a>
            </div>`,
        });
        popup.open(map);
      });

      // Pointer affordance — without it nothing signals the pins are clickable.
      for (const layer of [bubbles, incidentLayer, serviceLayer]) {
        map.events.add('mouseenter', layer, () => {
          map.getCanvasContainer().style.cursor = 'pointer';
        });
        map.events.add('mouseleave', layer, () => {
          map.getCanvasContainer().style.cursor = 'grab';
        });
      }

      setReady(true);
    });

    return () => {
      map.dispose();
      mapRef.current = null;
      hotspotSourceRef.current = null;
      incidentSourceRef.current = null;
      heatLayerRef.current = null;
    };
    // Deliberately mount-only: re-creating the map on every prop change would
    // reset the operator's pan and zoom mid-task.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // ── Feed hotspots in ──────────────────────────────────────────────────
  useEffect(() => {
    const source = hotspotSourceRef.current;
    if (!ready || !source) return;

    source.clear();
    for (const h of hotspots) {
      if (!Number.isFinite(h.latitude) || !Number.isFinite(h.longitude)) continue;
      const props = {
        id: h.id,
        name: h.name,
        risk: h.currentRisk ?? h.riskScore,
        severity: h.severity,
        status: h.status ?? 'ACTIVE',
        incidentCount: h.incidentCount,
        radiusM: h.radiusM,
      };

      // The circle carries the geofence; the point carries the marker, label
      // and heat weight. Two features so each layer can filter on geometry.
      source.add(
        new atlas.data.Feature(new atlas.data.Point([h.longitude, h.latitude]), {
          ...props,
          subType: 'Circle',
          radius: h.radiusM,
        })
      );
      source.add(
        new atlas.data.Feature(new atlas.data.Point([h.longitude, h.latitude]), props)
      );
    }
  }, [hotspots, ready]);

  // ── Feed incidents in ─────────────────────────────────────────────────
  useEffect(() => {
    const source = incidentSourceRef.current;
    if (!ready || !source) return;

    source.clear();
    for (const i of incidents) {
      if (!Number.isFinite(i.latitude) || !Number.isFinite(i.longitude)) continue;
      source.add(
        new atlas.data.Feature(new atlas.data.Point([i.longitude, i.latitude]), {
          id: i.id,
          title: i.title,
          type: i.type,
          status: i.status,
          locationName: i.locationName,
        })
      );
    }
  }, [incidents, ready]);

  // ── Feed services in ───────────────────────────
  useEffect(() => {
    const source = serviceSourceRef.current;
    if (!ready || !source) return;

    const glyphFor = (type: string) =>
      type === 'HOSPITAL' ? '🏥' : type === 'POLICE' ? '🚓' : '🚒';

    source.clear();
    for (const svc of services) {
      if (!Number.isFinite(svc.latitude) || !Number.isFinite(svc.longitude)) continue;
      source.add(
        new atlas.data.Feature(new atlas.data.Point([svc.longitude, svc.latitude]), {
          id: svc.id,
          name: svc.name,
          type: svc.type,
          phone: svc.phone,
          glyph: glyphFor(svc.type),
        })
      );
    }
  }, [services, ready]);

  // ── Layer toggles ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !heatLayerRef.current) return;
    heatLayerRef.current.setOptions({ visible: showHeatmap });
  }, [showHeatmap, ready]);

  useEffect(() => {
    if (!ready || !incidentLayerRef.current) return;
    incidentLayerRef.current.setOptions({ visible: showIncidents });
  }, [showIncidents, ready]);

  useEffect(() => {
    if (!ready || !serviceLayerRef.current) return;
    serviceLayerRef.current.setOptions({ visible: showServices });
  }, [showServices, ready]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    mapRef.current.setTraffic(
      showTraffic ? { flow: 'relative', incidents: true } : { flow: 'none', incidents: false }
    );
  }, [showTraffic, ready]);

  // ── Missing key ───────────────────────────────────────────────────────
  if (!key) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-sunken ${className}`}>
        <div className="max-w-sm px-6 text-center">
          <Layers className="mx-auto mb-3 h-6 w-6 text-ink-400" />
          <p className="text-body font-semibold text-ink-800">Map not configured</p>
          <p className="mt-1 text-caption text-ink-500">
            Set <code className="rounded-xs bg-ink-100 px-1">NEXT_PUBLIC_AZURE_MAPS_KEY</code> in
            web/.env and restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div ref={containerRef} className="h-full w-full" />

      {!ready && !failed ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-sunken">
          <span className="flex items-center gap-2 text-caption text-ink-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading map
          </span>
        </div>
      ) : null}

      {failed ? (
        <div className="absolute inset-x-4 top-4 z-[500] rounded-sm bg-danger-soft px-4 py-3">
          <p className="flex items-start gap-2 text-caption text-danger-dark">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{failed}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* Popup content is built as an HTML string, so anything interpolated into it
   must be escaped — hotspot names come from user-submitted location text. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export { Navigation, Route };
