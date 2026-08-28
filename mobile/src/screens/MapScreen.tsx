import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Vibration,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { apiFetch } from '../services/api';
import Icon from '../components/Icon';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HotspotMarker {
  id: string;
  title: string;
  type: 'ACCIDENT' | 'HAZARD' | 'EMERGENCY';
  latitude: number;
  longitude: number;
  locationName: string;
  description?: string;
  status?: string;
  distanceKm?: number;
}

interface HotspotCluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  severity: 'LOW' | 'MODERATE' | 'SEVERE';
  markers: HotspotMarker[];
  color: string;
}

// Haversine formula to compute distance between 2 GPS coordinates in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Cluster nearby markers within ~1km into hotspot zones
function clusterMarkers(markers: HotspotMarker[]): HotspotCluster[] {
  const clusters: HotspotCluster[] = [];
  const assigned = new Set<string>();

  const incidentMarkers = markers.filter((m) => m.type === 'ACCIDENT' || m.type === 'HAZARD');

  for (const marker of incidentMarkers) {
    if (assigned.has(marker.id)) continue;

    const nearby = incidentMarkers.filter(
      (m) => !assigned.has(m.id) && calculateDistanceKm(marker.latitude, marker.longitude, m.latitude, m.longitude) <= 1.0
    );

    nearby.forEach((m) => assigned.add(m.id));

    const count = nearby.length;
    let severity: 'LOW' | 'MODERATE' | 'SEVERE';
    let color: string;

    if (count >= 6) {
      severity = 'SEVERE';
      color = '#DC2626'; // Deep red
    } else if (count >= 3) {
      severity = 'MODERATE';
      color = '#F97316'; // Orange
    } else {
      severity = 'LOW';
      color = '#EAB308'; // Yellow
    }

    const avgLat = nearby.reduce((sum, m) => sum + m.latitude, 0) / count;
    const avgLng = nearby.reduce((sum, m) => sum + m.longitude, 0) / count;

    clusters.push({
      id: `cluster-${clusters.length}`,
      latitude: avgLat,
      longitude: avgLng,
      count,
      severity,
      markers: nearby,
      color,
    });
  }

  return clusters;
}

// Convert lat/lng to pixel position on the simulated map
function geoToPixel(
  lat: number,
  lng: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  mapWidth: number,
  mapHeight: number
) {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * mapWidth;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * mapHeight;
  return { x: Math.max(16, Math.min(mapWidth - 16, x)), y: Math.max(16, Math.min(mapHeight - 16, y)) };
}

export default function MapScreen() {
  const [filter, setFilter] = useState<'ALL' | 'ACCIDENTS' | 'HAZARDS' | 'EMERGENCY'>('ALL');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userAddress, setUserAddress] = useState<string>('Detecting GPS location...');
  const [markers, setMarkers] = useState<HotspotMarker[]>([]);
  const [clusters, setClusters] = useState<HotspotCluster[]>([]);
  const [approachingHotspot, setApproachingHotspot] = useState<HotspotMarker | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<HotspotCluster | null>(null);

  useEffect(() => {
    initMapAndLocation();
  }, []);

  const initMapAndLocation = async () => {
    setLoading(true);
    try {
      // 1. Get User Location
      const { status } = await Location.requestForegroundPermissionsAsync();
      let currentLat = 5.556;
      let currentLng = -0.1969;

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        currentLat = loc.coords.latitude;
        currentLng = loc.coords.longitude;
        setUserLocation({ latitude: currentLat, longitude: currentLng });

        const geocode = await Location.reverseGeocodeAsync({ latitude: currentLat, longitude: currentLng });
        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          setUserAddress([place.street, place.city, place.region].filter(Boolean).join(', ') || 'Accra, Ghana');
        }
      }

      // 2. Fetch Live Incidents from API
      const [reportsRes, emergencyRes] = await Promise.all([
        apiFetch('/reports').catch(() => ({ reports: [] })),
        apiFetch('/emergency-services').catch(() => ({ services: [] })),
      ]);

      const liveReports: HotspotMarker[] = (reportsRes.reports || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        type: r.type === 'ACCIDENT' ? 'ACCIDENT' : 'HAZARD',
        latitude: r.latitude,
        longitude: r.longitude,
        locationName: r.locationName,
        description: r.description,
        status: r.status,
      }));

      const liveEmergency: HotspotMarker[] = (emergencyRes.services || []).map((s: any) => ({
        id: s.id,
        title: s.name,
        type: 'EMERGENCY',
        latitude: s.latitude,
        longitude: s.longitude,
        locationName: s.address,
      }));

      const allMarkers = [...liveReports, ...liveEmergency];

      // Calculate distance from user for each marker
      const processedMarkers = allMarkers.map((m) => {
        const dist = calculateDistanceKm(currentLat, currentLng, m.latitude, m.longitude);
        return { ...m, distanceKm: parseFloat(dist.toFixed(1)) };
      }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

      setMarkers(processedMarkers);

      // Build hotspot clusters
      const hotspotClusters = clusterMarkers(processedMarkers);
      setClusters(hotspotClusters);

      // Check if user is within 3km of an accident or hazard hotspot
      const nearbyHotspot = processedMarkers.find(
        (m) => (m.type === 'ACCIDENT' || m.type === 'HAZARD') && (m.distanceKm || 99) <= 3.0
      );

      if (nearbyHotspot) {
        setApproachingHotspot(nearbyHotspot);
        // Trigger caution vibration pattern: 500ms vibrate, 200ms pause, 500ms vibrate
        Vibration.vibrate([0, 500, 200, 500]);
      } else {
        setApproachingHotspot(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initMapAndLocation();
    setRefreshing(false);
  };

  const filteredMarkers = markers.filter((m) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACCIDENTS') return m.type === 'ACCIDENT';
    if (filter === 'HAZARDS') return m.type === 'HAZARD';
    if (filter === 'EMERGENCY') return m.type === 'EMERGENCY';
    return true;
  });

  // Compute map bounds from all markers
  const allLats = markers.map((m) => m.latitude);
  const allLngs = markers.map((m) => m.longitude);
  const bounds = {
    minLat: Math.min(...(allLats.length ? allLats : [5.45]), userLocation?.latitude || 5.556) - 0.02,
    maxLat: Math.max(...(allLats.length ? allLats : [5.7]), userLocation?.latitude || 5.556) + 0.02,
    minLng: Math.min(...(allLngs.length ? allLngs : [-0.35]), userLocation?.longitude || -0.1969) - 0.02,
    maxLng: Math.max(...(allLngs.length ? allLngs : [-0.05]), userLocation?.longitude || -0.1969) + 0.02,
  };

  const MAP_HEIGHT = SCREEN_HEIGHT * 0.55;
  const MAP_WIDTH = SCREEN_WIDTH - 32;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f6cbd" />}
      >
        {/* Compact Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>LIVE GPS RADAR</Text>
            <Text style={styles.headerTitle}>Hotspot Map</Text>
          </View>
          <TouchableOpacity style={styles.gpsChip} onPress={initMapAndLocation}>
            <View style={styles.gpsLiveDot} />
            <Text style={styles.gpsText}>Live</Text>
          </TouchableOpacity>
        </View>

        {/* User Location Bar */}
        <View style={styles.userLocBar}>
          <Icon name="location" size={13} color="#0f6cbd" />
          <Text style={styles.userLocText} numberOfLines={1}>
            {userAddress} {userLocation ? `(${userLocation.latitude.toFixed(3)}, ${userLocation.longitude.toFixed(3)})` : ''}
          </Text>
        </View>

        {/* Hotspot Proximity Alert Banner */}
        {approachingHotspot && (
          <View style={styles.cautionBanner}>
            <View style={styles.cautionHeader}>
              <Icon name="hazard" size={20} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text style={styles.cautionTitle}>APPROACHING HOTSPOT!</Text>
                <Text style={styles.cautionSub}>
                  High risk zone detected within {approachingHotspot.distanceKm} km
                </Text>
              </View>
            </View>
            <Text style={styles.cautionLocName}>{approachingHotspot.title} — {approachingHotspot.locationName}</Text>
          </View>
        )}

        {/* Filter Chips */}
        <View style={styles.filterBar}>
          {(['ALL', 'ACCIDENTS', 'HAZARDS', 'EMERGENCY'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, filter === cat && styles.filterChipActive]}
              onPress={() => setFilter(cat)}
            >
              <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Full-Screen Simulated Map Canvas */}
        <View style={[styles.mapCanvas, { height: MAP_HEIGHT }]}>
          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((frac) => (
            <View key={`h-${frac}`} style={[styles.gridLineH, { top: `${frac * 100}%` }]} />
          ))}
          {[0.2, 0.4, 0.6, 0.8].map((frac) => (
            <View key={`v-${frac}`} style={[styles.gridLineV, { left: `${frac * 100}%` }]} />
          ))}

          {/* Map label */}
          <Text style={styles.mapLabel}>GHANA ROAD NETWORK</Text>

          {/* Hotspot cluster dots with severity colors */}
          {clusters.map((cluster) => {
            const pos = geoToPixel(cluster.latitude, cluster.longitude, bounds, MAP_WIDTH, MAP_HEIGHT);
            const dotSize = Math.min(18 + cluster.count * 6, 48);
            return (
              <TouchableOpacity
                key={cluster.id}
                style={[
                  styles.hotspotDot,
                  {
                    left: pos.x - dotSize / 2,
                    top: pos.y - dotSize / 2,
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    backgroundColor: cluster.color,
                  },
                ]}
                onPress={() => setSelectedCluster(selectedCluster?.id === cluster.id ? null : cluster)}
                activeOpacity={0.7}
              >
                <Text style={styles.hotspotCount}>{cluster.count}</Text>
              </TouchableOpacity>
            );
          })}

          {/* Emergency service markers (blue dots) */}
          {filteredMarkers
            .filter((m) => m.type === 'EMERGENCY')
            .map((m) => {
              const pos = geoToPixel(m.latitude, m.longitude, bounds, MAP_WIDTH, MAP_HEIGHT);
              return (
                <View
                  key={m.id}
                  style={[styles.emergencyDot, { left: pos.x - 6, top: pos.y - 6 }]}
                >
                  <View style={styles.emergencyDotInner} />
                </View>
              );
            })}

          {/* User location pulse */}
          {userLocation && (
            <View
              style={[
                styles.userDot,
                {
                  left: geoToPixel(userLocation.latitude, userLocation.longitude, bounds, MAP_WIDTH, MAP_HEIGHT).x - 8,
                  top: geoToPixel(userLocation.latitude, userLocation.longitude, bounds, MAP_WIDTH, MAP_HEIGHT).y - 8,
                },
              ]}
            >
              <View style={styles.userDotInner} />
            </View>
          )}

          {/* Severity legend */}
          <View style={styles.legendBox}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
              <Text style={styles.legendText}>Low</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
              <Text style={styles.legendText}>Moderate</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
              <Text style={styles.legendText}>Severe</Text>
            </View>
          </View>

          {loading && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator color="#0f6cbd" size="large" />
              <Text style={styles.mapLoadingText}>Loading hotspots...</Text>
            </View>
          )}
        </View>

        {/* Selected Cluster Detail Card */}
        {selectedCluster && (
          <View style={[styles.clusterCard, { borderLeftColor: selectedCluster.color }]}>
            <View style={styles.clusterCardHeader}>
              <View style={[styles.severityBadge, { backgroundColor: selectedCluster.color }]}>
                <Text style={styles.severityBadgeText}>{selectedCluster.severity}</Text>
              </View>
              <Text style={styles.clusterIncidentCount}>{selectedCluster.count} incidents in this zone</Text>
            </View>
            {selectedCluster.markers.slice(0, 3).map((m) => (
              <View key={m.id} style={styles.clusterIncident}>
                <Icon
                  name={m.type === 'ACCIDENT' ? 'accident' : 'hazard'}
                  size={14}
                  color={m.type === 'ACCIDENT' ? '#DC2626' : '#F97316'}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.clusterIncidentTitle}>{m.title}</Text>
                  <Text style={styles.clusterIncidentLoc}>{m.locationName}</Text>
                </View>
                {m.distanceKm !== undefined && (
                  <Text style={styles.clusterIncidentDist}>{m.distanceKm} km</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Hotspot Markers List */}
        <View style={styles.markersSection}>
          <Text style={styles.sectionTitle}>Nearby Incidents ({filteredMarkers.length})</Text>

          {loading ? (
            <ActivityIndicator color="#0f6cbd" style={{ padding: 20 }} />
          ) : filteredMarkers.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No incident markers found for this category.</Text>
            </View>
          ) : (
            filteredMarkers.slice(0, 8).map((m) => (
              <View
                key={m.id}
                style={[
                  styles.markerCard,
                  m.type === 'ACCIDENT' && styles.accidentCard,
                  m.type === 'HAZARD' && styles.hazardCard,
                ]}
              >
                <View style={[
                  styles.markerIconBox,
                  { backgroundColor: m.type === 'ACCIDENT' ? '#FEF2F2' : m.type === 'HAZARD' ? '#FFF7ED' : '#EFF6FF' }
                ]}>
                  <Icon
                    name={m.type === 'ACCIDENT' ? 'accident' : m.type === 'HAZARD' ? 'hazard' : 'hospital'}
                    size={20}
                    color={m.type === 'ACCIDENT' ? '#DC2626' : m.type === 'HAZARD' ? '#F97316' : '#3b82f6'}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.markerHeader}>
                    <Text style={styles.markerTitle}>{m.title}</Text>
                    {m.distanceKm !== undefined && (
                      <Text style={styles.distBadge}>{m.distanceKm} km</Text>
                    )}
                  </View>
                  <View style={styles.locationRow}>
                    <Icon name="location" size={11} color="#94a3b8" />
                    <Text style={styles.markerLoc}>{m.locationName}</Text>
                  </View>
                  {m.description && <Text style={styles.markerDesc}>{m.description}</Text>}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f6cbd',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#172b4d',
  },
  gpsChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  gpsLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  gpsText: {
    color: '#0f6cbd',
    fontSize: 12,
    fontWeight: '800',
  },
  userLocBar: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userLocText: {
    color: '#475569',
    fontSize: 11,
    flex: 1,
  },
  cautionBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  cautionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  cautionTitle: {
    color: '#DC2626',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  cautionSub: {
    color: '#991B1B',
    fontSize: 11,
  },
  cautionLocName: {
    color: '#7F1D1D',
    fontWeight: '700',
    fontSize: 12,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0f6cbd',
    borderColor: '#0f6cbd',
  },
  filterText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  mapCanvas: {
    backgroundColor: '#F0FDF9',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    position: 'relative',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  mapLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(16, 185, 129, 0.3)',
    letterSpacing: 2,
  },
  hotspotDot: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  hotspotCount: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  emergencyDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  userDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 108, 189, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0f6cbd',
  },
  legendBox: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLoadingText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 8,
  },
  clusterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
  },
  clusterCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  severityBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  clusterIncidentCount: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  clusterIncident: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  clusterIncidentTitle: {
    color: '#172b4d',
    fontSize: 12,
    fontWeight: '700',
  },
  clusterIncidentLoc: {
    color: '#94A3B8',
    fontSize: 10,
  },
  clusterIncidentDist: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  markersSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  emptyCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  markerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  accidentCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
  },
  hazardCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#F97316',
  },
  markerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markerTitle: {
    color: '#172b4d',
    fontWeight: '800',
    fontSize: 13,
    flex: 1,
  },
  distBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f6cbd',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  markerLoc: {
    color: '#94A3B8',
    fontSize: 11,
  },
  markerDesc: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 14,
  },
});
