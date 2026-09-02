import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Alert,
  Animated,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { apiFetch } from '../services/api';
import MapViewComponent, { MapMarkerData } from '../components/MapViewComponent';

// ─── Design tokens (no external theme dep) ───────────────────────────────────
const C = {
  bg: '#ffffff',
  surface: '#ffffff',
  border: '#e5e5e5',
  ink: '#111111',
  inkSec: '#555555',
  inkTer: '#999999',
  red: '#dc2626',
  redLight: '#fef2f2',
  amber: '#d97706',
  amberLight: '#fffbeb',
  blue: '#1d4ed8',
  green: '#16a34a',
  resolved: '#22c55e',
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCRA = { latitude: 5.6037, longitude: -0.187, latitudeDelta: 0.18, longitudeDelta: 0.18 };
const PROXIMITY_DEG = 0.015; // ~1.5 km
const CLUSTER_R = 0.008; // ~900 m cluster radius

// ─── Types ────────────────────────────────────────────────────────────────────
type Filter = 'ALL' | 'ACCIDENT' | 'HAZARD';

type Report = {
  id: string;
  title: string;
  type: 'ACCIDENT' | 'HAZARD';
  status: string;
  latitude: number;
  longitude: number;
  locationName: string;
  description?: string;
  createdAt?: string;
};

type Service = {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  phone?: string;
};

type Cluster = {
  lat: number;
  lng: number;
  count: number;
  points: Report[];
  dominantType: 'ACCIDENT' | 'HAZARD';
};

// ─── Clustering (Snap-map style) ──────────────────────────────────────────────
function clusterReports(reports: Report[]): Cluster[] {
  const visited = new Set<number>();
  const clusters: Cluster[] = [];

  for (let i = 0; i < reports.length; i++) {
    if (visited.has(i)) continue;
    const group: Report[] = [reports[i]];
    visited.add(i);

    for (let j = i + 1; j < reports.length; j++) {
      if (visited.has(j)) continue;
      const dLat = reports[i].latitude - reports[j].latitude;
      const dLng = reports[i].longitude - reports[j].longitude;
      if (Math.sqrt(dLat * dLat + dLng * dLng) < CLUSTER_R) {
        group.push(reports[j]);
        visited.add(j);
      }
    }

    const lat = group.reduce((s, p) => s + p.latitude, 0) / group.length;
    const lng = group.reduce((s, p) => s + p.longitude, 0) / group.length;
    const accCount = group.filter((p) => p.type === 'ACCIDENT').length;

    clusters.push({
      lat,
      lng,
      count: group.length,
      points: group,
      dominantType: accCount >= group.length / 2 ? 'ACCIDENT' : 'HAZARD',
    });
  }

  return clusters;
}

// ─── Hotspot color (intensity → deeper red / brighter amber) ─────────────────
function clusterColor(c: Cluster): string {
  if (c.points.every((p) => p.status === 'RESOLVED')) return C.resolved;
  const intensity = Math.min(c.count / 8, 1);
  if (c.dominantType === 'ACCIDENT') {
    const r = Math.round(220 + intensity * 35);
    const g = Math.round(50 - intensity * 40);
    const b = Math.round(50 - intensity * 40);
    return `rgb(${r},${g},${b})`;
  }
  return intensity > 0.5 ? '#f97316' : '#f59e0b';
}

// ─── Distance helper ──────────────────────────────────────────────────────────
function dist(lat1: number, lng1: number, lat2: number, lng2: number) {
  return Math.sqrt((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2);
}

interface MapScreenProps {
  onNavigateToReport?: (type: 'ACCIDENT' | 'HAZARD') => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MapScreen({ onNavigateToReport }: MapScreenProps = {}) {
  const [reports, setReports] = useState<Report[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [selected, setSelected] = useState<Cluster | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState(ACCRA);

  const alertedIds = useRef(new Set<string>());
  const slideAnim = useRef(new Animated.Value(0)).current;

  // ── Fetch reports + emergency services from backend ──────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, sRes] = await Promise.all([
        apiFetch('/reports').catch(() => ({ reports: [] })),
        apiFetch('/emergency-services').catch(() => ({ services: [] })),
      ]);

      setReports(
        (rRes.reports ?? []).filter(
          (r: Report) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude),
        ),
      );
      setServices(
        (sRes.services ?? []).filter(
          (s: Service) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude),
        ),
      );
    } catch (err) {
      console.error('[MapScreen] loadData error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── GPS watch + proximity alerts ─────────────────────────────────────────
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 50 },
        (loc) => {
          const { latitude, longitude } = loc.coords;
          setUserLocation({ latitude, longitude });

          // Pan map to user on first GPS fix only
          setMapRegion((prev) =>
            prev === ACCRA
              ? { latitude, longitude, latitudeDelta: 0.06, longitudeDelta: 0.06 }
              : prev,
          );

          // Alert if close to any active hotspot
          reports.forEach((r) => {
            if (r.status === 'RESOLVED') return;
            if (alertedIds.current.has(r.id)) return;
            if (dist(latitude, longitude, r.latitude, r.longitude) < PROXIMITY_DEG) {
              alertedIds.current.add(r.id);
              Alert.alert(
                r.type === 'ACCIDENT' ? '⚠️ Accident nearby' : '🚧 Road hazard ahead',
                `${r.title}\n${r.locationName}`,
                [{ text: 'Got it', style: 'cancel' }],
              );
            }
          });
        },
      );
    })();

    return () => { sub?.remove(); };
  }, [reports]);

  // ── Filtered reports ─────────────────────────────────────────────────────
  const visibleReports = useMemo(
    () => (filter === 'ALL' ? reports : reports.filter((r) => r.type === filter)),
    [filter, reports],
  );

  // ── Clusters ─────────────────────────────────────────────────────────────
  const clusters = useMemo(() => clusterReports(visibleReports), [visibleReports]);

  // ── Markers for MapViewComponent ─────────────────────────────────────────
  const markers: MapMarkerData[] = useMemo(() => {
    // Incident clusters → hotspot circles on native, circle markers on web
    const clusterMarkers: MapMarkerData[] = clusters.map((c, i) => ({
      id: `cluster-${i}`,
      latitude: c.lat,
      longitude: c.lng,
      title: c.count > 1 ? `${c.count} incidents` : c.points[0].title,
      locationName: c.count > 1 ? `${c.dominantType} hotspot` : c.points[0].locationName,
      type: c.dominantType,
      status: c.points[0].status,
      color: clusterColor(c),
      clusterCount: c.count,   // ← native map uses this for circle radius sizing
    }));

    // Emergency services → blue markers
    const serviceMarkers: MapMarkerData[] = services.map((s) => ({
      id: `svc-${s.id}`,
      latitude: s.latitude,
      longitude: s.longitude,
      title: s.name,
      locationName: s.phone ?? s.type,
      type: 'EMERGENCY',
      color: C.blue,
    }));

    // User dot
    const userMarker: MapMarkerData[] = userLocation
      ? [{
        id: 'user-location',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        title: 'Your location',
        type: 'USER',
        color: C.blue,
      }]
      : [];

    return [...clusterMarkers, ...serviceMarkers, ...userMarker];
  }, [clusters, services, userLocation]);

  // ── Sheet open/close ─────────────────────────────────────────────────────
  const openSheet = useCallback((cluster: Cluster) => {
    setSelected(cluster);
    Animated.spring(slideAnim, {
      toValue: 1, friction: 8, tension: 60, useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const closeSheet = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0, duration: 200, useNativeDriver: true,
    }).start(() => setSelected(null));
  }, [slideAnim]);

  const handleMarkerPress = useCallback((m: MapMarkerData) => {
    const idx = parseInt(m.id.replace('cluster-', ''), 10);
    if (!isNaN(idx) && clusters[idx]) openSheet(clusters[idx]);
  }, [clusters, openSheet]);

  const sheetY = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [280, 0] });

  const activeCount = reports.filter((r) => r.status !== 'RESOLVED').length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── Full-screen map ──────────────────────────────────────────────── */}
      <View style={s.mapWrap}>
        <MapViewComponent
          style={StyleSheet.absoluteFill}
          region={mapRegion}
          markers={markers}
          onMarkerPress={handleMarkerPress}
          onRegionChange={setMapRegion}
        />

        {/* ── Top floating card ────────────────────────────────────────── */}
        <View style={s.topBar} pointerEvents="box-none">
          {/* Title card */}
          <View style={s.titleCard}>
            <View style={s.liveRow}>
              <View style={s.liveDot} />
              <Text style={s.liveLabel}>Live</Text>
              {loading && <Text style={s.loadingLabel}> · Fetching data…</Text>}
            </View>
            <Text style={s.titleText}>Ghana Road Network</Text>
          </View>

          {/* Filter chips */}
          <View style={s.filterRow}>
            {(['ALL', 'ACCIDENT', 'HAZARD'] as Filter[]).map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                activeOpacity={0.78}
                style={[s.chip, filter === f && s.chipActive]}
              >
                <Text style={[s.chipText, filter === f && s.chipTextActive]}>
                  {f === 'ALL' ? 'All' : f === 'ACCIDENT' ? 'Accidents' : 'Hazards'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Active count badge (bottom-right) ────────────────────────── */}
        {activeCount > 0 && (
          <View style={s.countBadge} pointerEvents="none">
            <View style={s.countDot} />
            <Text style={s.countText}>{activeCount} active</Text>
          </View>
        )}

        {/* ── Recenter button ───────────────────────────────────────────── */}
        {userLocation && (
          <TouchableOpacity
            style={s.recenter}
            activeOpacity={0.8}
            onPress={() => setMapRegion({
              ...userLocation,
              latitudeDelta: 0.06,
              longitudeDelta: 0.06,
            })}
          >
            <Text style={s.recenterIcon}>◎</Text>
          </TouchableOpacity>
        )}

        {/* ── Legend (bottom-left) ─────────────────────────────────────── */}
        <View style={s.legend} pointerEvents="none">
          <View style={s.legendRow}>
            <View style={[s.legendDot, { backgroundColor: C.red }]} />
            <Text style={s.legendText}>Accident</Text>
          </View>
          <View style={s.legendRow}>
            <View style={[s.legendDot, { backgroundColor: '#f97316' }]} />
            <Text style={s.legendText}>Hazard</Text>
          </View>
          <View style={s.legendRow}>
            <View style={[s.legendDot, { backgroundColor: C.resolved }]} />
            <Text style={s.legendText}>Resolved</Text>
          </View>
          <Text style={s.legendHint}>Bigger = more reports</Text>
        </View>
      </View>

      {/* ── Bottom sheet ─────────────────────────────────────────────────── */}
      {selected && (
        <Animated.View style={[s.sheet, { transform: [{ translateY: sheetY }] }]}>
          <View style={s.handle} />

          {/* Sheet header */}
          <View style={s.sheetHead}>
            <View style={[
              s.sheetIcon,
              { backgroundColor: selected.dominantType === 'ACCIDENT' ? C.redLight : C.amberLight },
            ]}>
              <Text style={{ fontSize: 20 }}>
                {selected.dominantType === 'ACCIDENT' ? '⚠️' : '🚧'}
              </Text>
            </View>
            <View style={s.sheetHeadText}>
              <Text style={s.sheetTitle}>
                {selected.count > 1
                  ? `${selected.count} incidents in this area`
                  : selected.points[0].title}
              </Text>
              <Text style={s.sheetSub}>
                {selected.count > 1
                  ? `${selected.dominantType} hotspot`
                  : selected.points[0].locationName}
              </Text>
            </View>
            <TouchableOpacity onPress={closeSheet} style={s.closeBtn}>
              <Text style={s.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Incident rows */}
          <View style={s.list}>
            {selected.points.slice(0, 5).map((p) => {
              const resolved = p.status === 'RESOLVED';
              return (
                <View key={p.id} style={s.row}>
                  <View style={[s.rowDot, {
                    backgroundColor: resolved ? C.resolved
                      : p.type === 'ACCIDENT' ? C.red : '#f97316',
                  }]} />
                  <View style={s.rowBody}>
                    <Text numberOfLines={1} style={s.rowTitle}>{p.title}</Text>
                    <Text numberOfLines={1} style={s.rowLoc}>{p.locationName}</Text>
                  </View>
                  <View style={[s.pill, { backgroundColor: resolved ? '#dcfce7' : '#fef3c7' }]}>
                    <Text style={[s.pillTxt, { color: resolved ? '#15803d' : '#92400e' }]}>
                      {p.status}
                    </Text>
                  </View>
                </View>
              );
            })}
            {selected.points.length > 5 && (
              <Text style={s.more}>+{selected.points.length - 5} more in this area</Text>
            )}
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  mapWrap: { flex: 1, position: 'relative' },

  // Top bar
  topBar: {
    position: 'absolute', top: 12, left: 12, right: 12, zIndex: 10, gap: 8,
  },
  titleCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  liveLabel: { fontSize: 10, fontWeight: '700', color: C.green, letterSpacing: 0.5, textTransform: 'uppercase' },
  loadingLabel: { fontSize: 10, color: C.inkTer },
  titleText: { fontSize: 15, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },

  // Filter chips
  filterRow: { flexDirection: 'row', gap: 6 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  chipActive: { backgroundColor: C.ink },
  chipText: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  chipTextActive: { color: '#ffffff' },

  // Active count badge
  countBadge: {
    position: 'absolute', bottom: 16, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.surface,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10, shadowRadius: 8, elevation: 4,
  },
  countDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.red },
  countText: { fontSize: 11, fontWeight: '800', color: C.ink },

  // Recenter
  recenter: {
    position: 'absolute', bottom: 64, right: 14,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10, shadowRadius: 6, elevation: 4,
  },
  recenterIcon: { fontSize: 18, color: C.ink },

  // Legend
  legend: {
    position: 'absolute', bottom: 16, left: 14,
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, gap: 4,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontWeight: '600', color: C.inkSec },
  legendHint: { fontSize: 9, color: C.inkTer, marginTop: 2 },

  // Bottom sheet
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingBottom: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 12,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center', marginTop: 10, marginBottom: 14,
  },

  // Sheet header
  sheetHead: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, marginBottom: 14,
  },
  sheetIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  sheetHeadText: { flex: 1 },
  sheetTitle: { fontSize: 14, fontWeight: '800', color: C.ink, letterSpacing: -0.2 },
  sheetSub: { fontSize: 11, color: C.inkTer, marginTop: 2 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  closeTxt: { fontSize: 12, color: C.inkSec, fontWeight: '700' },

  // Incident list
  list: { paddingHorizontal: 16, gap: 2 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  rowDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 12, fontWeight: '700', color: C.ink },
  rowLoc: { fontSize: 10, color: C.inkTer, marginTop: 1 },
  pill: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  pillTxt: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  more: { fontSize: 10, color: C.inkTer, paddingTop: 8, textAlign: 'center' },
});
