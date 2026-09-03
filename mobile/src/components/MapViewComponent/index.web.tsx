/* ─── Map (Expo web) ───────────────────────────────────────────────────────
 *
 * Expo resolves this file for the web target and index.native.tsx for iOS and
 * Android, so `azure-maps-control` never reaches a native bundle.
 *
 * What this replaces: the previous web variant drew a fake map — coloured
 * circles positioned by hand inside a plain <View>, with no tiles, no panning
 * and no real projection. It looked like a map and told you nothing about
 * where anything actually was. This is the same Azure basemap the admin
 * console and the native app use.
 * ------------------------------------------------------------------------ */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as atlas from 'azure-maps-control';
import 'azure-maps-control/dist/atlas.min.css';
import { colors, radius, spacing, typography } from '../../theme';

export interface MapMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  locationName?: string;
  type?: string;
  status?: string;
  color?: string;
  clusterCount?: number;
  /** Alert geofence radius in metres, drawn as a real ground circle. */
  radiusM?: number;
}

export interface MapViewComponentProps {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markers?: MapMarkerData[];
  onMarkerPress?: (marker: MapMarkerData) => void;
  style?: any;
  onRegionChange?: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => void;
  draggablePin?: { latitude: number; longitude: number };
  onPinDragEnd?: (coords: { latitude: number; longitude: number }) => void;
  /** Route polyline, drawn beneath the markers. */
  routePoints?: { latitude: number; longitude: number }[];
}

const AZURE_KEY = process.env.EXPO_PUBLIC_AZURE_MAPS_KEY;

/** Latitude span to an Azure zoom level, near enough for an initial view. */
function zoomForDelta(latitudeDelta: number): number {
  if (!latitudeDelta || latitudeDelta <= 0) return 12;
  return Math.max(2, Math.min(18, Math.log2(360 / latitudeDelta)));
}

export default function MapViewComponent({
  region,
  markers = [],
  onMarkerPress,
  style,
  draggablePin,
  onPinDragEnd,
  routePoints,
}: MapViewComponentProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const routeSourceRef = useRef<atlas.source.DataSource | null>(null);
  const mapRef = useRef<atlas.Map | null>(null);
  const sourceRef = useRef<atlas.source.DataSource | null>(null);
  const pinRef = useRef<atlas.HtmlMarker | null>(null);
  const markersRef = useRef<MapMarkerData[]>(markers);
  const [ready, setReady] = useState(false);

  markersRef.current = markers;

  // ── Create once ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!AZURE_KEY || !hostRef.current || mapRef.current) return;

    const map = new atlas.Map(hostRef.current, {
      center: [region.longitude, region.latitude],
      zoom: zoomForDelta(region.latitudeDelta),
      style: 'road',
      language: 'en-US',
      showFeedbackLink: false,
      authOptions: {
        authType: atlas.AuthenticationType.subscriptionKey,
        subscriptionKey: AZURE_KEY,
      },
    });
    mapRef.current = map;

    map.events.add('ready', () => {
      // The route lives in its own source so redrawing it never disturbs the
      // hotspot layer, and it is added first so the line sits underneath.
      const routeSource = new atlas.source.DataSource();
      map.sources.add(routeSource);
      routeSourceRef.current = routeSource;
      map.layers.add(
        new atlas.layer.LineLayer(routeSource, undefined, {
          strokeColor: '#2B5F9E',
          strokeWidth: 5,
          strokeOpacity: 0.85,
          lineJoin: 'round',
          lineCap: 'round',
        })
      );

      const source = new atlas.source.DataSource();
      map.sources.add(source);
      sourceRef.current = source;

      // Geofence rings. Azure renders a Point tagged subType "Circle" as a
      // true ground circle, so the ring is the real alert radius at every
      // zoom rather than a fixed pixel size that lies as you zoom out.
      map.layers.add(
        new atlas.layer.PolygonLayer(source, undefined, {
          fillColor: ['get', 'color'],
          fillOpacity: 0.15,
          filter: ['==', ['geometry-type'], 'Polygon'],
        })
      );
      map.layers.add(
        new atlas.layer.LineLayer(source, undefined, {
          strokeColor: ['get', 'color'],
          strokeWidth: 1.5,
          strokeOpacity: 0.6,
          filter: ['==', ['geometry-type'], 'Polygon'],
        })
      );

      const bubbles = new atlas.layer.BubbleLayer(source, undefined, {
        radius: [
          'interpolate',
          ['linear'],
          ['get', 'count'],
          1, 7,
          20, 20,
        ],
        color: ['get', 'color'],
        strokeColor: '#FFFFFF',
        strokeWidth: 2,
        filter: ['==', ['geometry-type'], 'Point'],
      });
      map.layers.add(bubbles);

      map.layers.add(
        new atlas.layer.SymbolLayer(source, undefined, {
          iconOptions: { image: 'none' },
          textOptions: {
            textField: ['case', ['>', ['get', 'count'], 1], ['to-string', ['get', 'count']], ''],
            color: '#FFFFFF',
            size: 11,
            offset: [0, 0.1],
            allowOverlap: true,
          },
          filter: ['==', ['geometry-type'], 'Point'],
        })
      );

      map.events.add('click', bubbles, (e) => {
        const shape = e.shapes?.[0];
        if (!shape || !('getProperties' in shape)) return;
        const id = (shape.getProperties() as { id?: string }).id;
        const hit = markersRef.current.find((m) => m.id === id);
        if (hit) onMarkerPress?.(hit);
      });

      map.events.add('mouseenter', bubbles, () => {
        map.getCanvasContainer().style.cursor = 'pointer';
      });
      map.events.add('mouseleave', bubbles, () => {
        map.getCanvasContainer().style.cursor = 'grab';
      });

      setReady(true);
    });

    return () => {
      map.dispose();
      mapRef.current = null;
      sourceRef.current = null;
      pinRef.current = null;
    };
    // Mount-only: rebuilding on prop changes would reset the user's pan/zoom.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Feed markers ──────────────────────────────────────────────────────
  useEffect(() => {
    const source = sourceRef.current;
    if (!ready || !source) return;

    source.clear();
    for (const m of markers) {
      if (!Number.isFinite(m.latitude) || !Number.isFinite(m.longitude)) continue;
      const props = {
        id: m.id,
        color: m.color ?? colors.danger,
        count: m.clusterCount ?? 1,
        title: m.title,
      };
      if (m.radiusM && m.radiusM > 0) {
        source.add(
          new atlas.data.Feature(new atlas.data.Point([m.longitude, m.latitude]), {
            ...props,
            subType: 'Circle',
            radius: m.radiusM,
          })
        );
      }
      source.add(
        new atlas.data.Feature(new atlas.data.Point([m.longitude, m.latitude]), props)
      );
    }
  }, [markers, ready]);

  // ── Route polyline ────────────────────────────────────────────────────
  useEffect(() => {
    const source = routeSourceRef.current;
    const map = mapRef.current;
    if (!ready || !source || !map) return;

    source.clear();
    if (!routePoints || routePoints.length < 2) return;

    source.add(
      new atlas.data.Feature(
        new atlas.data.LineString(routePoints.map((p) => [p.longitude, p.latitude]))
      )
    );

    // Frame the whole journey — a route preview that opens zoomed to the
    // start tells you nothing about what is further along it.
    map.setCamera({
      bounds: atlas.data.BoundingBox.fromPositions(
        routePoints.map((p) => [p.longitude, p.latitude])
      ),
      padding: 48,
    });
  }, [routePoints, ready]);

  // ── Draggable pin (location picker) ───────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;

    if (!draggablePin) {
      if (pinRef.current) {
        map.markers.remove(pinRef.current);
        pinRef.current = null;
      }
      return;
    }

    if (!pinRef.current) {
      const marker = new atlas.HtmlMarker({
        draggable: true,
        color: colors.primary,
        position: [draggablePin.longitude, draggablePin.latitude],
      });
      map.markers.add(marker);
      map.events.add('dragend', marker, () => {
        const [lng, lat] = marker.getOptions().position as atlas.data.Position;
        onPinDragEnd?.({ latitude: lat, longitude: lng });
      });
      pinRef.current = marker;
    } else {
      pinRef.current.setOptions({
        position: [draggablePin.longitude, draggablePin.latitude],
      });
    }
  }, [draggablePin, ready, onPinDragEnd]);

  if (!AZURE_KEY) {
    return (
      <View style={[s.fallback, style]}>
        <Text style={s.fallbackTitle}>Map not configured</Text>
        <Text style={s.fallbackBody}>
          Set EXPO_PUBLIC_AZURE_MAPS_KEY in mobile/.env and restart Expo.
        </Text>
      </View>
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      {/* react-native-web renders View as a div, so the Azure control can be
          mounted into a plain child element. */}
      <div ref={hostRef} style={{ width: '100%', height: '100%' }} />
      {!ready ? (
        <View style={s.loading} pointerEvents="none">
          <Text style={s.fallbackBody}>Loading map…</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  fallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSunken,
    padding: spacing.xl,
    borderRadius: radius.md,
  },
  fallbackTitle: { ...typography.title, marginBottom: 4 },
  fallbackBody: { ...typography.callout, textAlign: 'center', color: colors.textSubtle },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSunken,
  },
});
