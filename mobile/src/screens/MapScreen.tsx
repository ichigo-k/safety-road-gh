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
} from 'react-native';
import * as Location from 'expo-location';
import { apiFetch } from '../services/api';
import Icon from '../components/Icon';

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

export default function MapScreen() {
  const [filter, setFilter] = useState<'ALL' | 'ACCIDENTS' | 'HAZARDS' | 'EMERGENCY'>('ALL');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userAddress, setUserAddress] = useState<string>('Detecting GPS location...');
  const [markers, setMarkers] = useState<HotspotMarker[]>([]);
  const [approachingHotspot, setApproachingHotspot] = useState<HotspotMarker | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>LIVE GPS RADAR</Text>
            <Text style={styles.headerTitle}>Hotspot & Incident Map</Text>
          </View>
          <TouchableOpacity style={styles.gpsChip} onPress={initMapAndLocation}>
            <Icon name="location" size={14} color="#f59e0b" />
            <Text style={styles.gpsText}>Radar Active</Text>
          </TouchableOpacity>
        </View>

        {/* User Location Bar */}
        <View style={styles.userLocBar}>
          <Icon name="location" size={14} color="#3b82f6" />
          <Text style={styles.userLocText} numberOfLines={1}>
            GPS: {userAddress} {userLocation ? `(${userLocation.latitude.toFixed(3)}, ${userLocation.longitude.toFixed(3)})` : ''}
          </Text>
        </View>

        {/* Hotspot Caution Proximity Alert Banner */}
        {approachingHotspot && (
          <View style={styles.cautionBanner}>
            <View style={styles.cautionHeader}>
              <Icon name="hazard" size={22} color="#ef4444" />
              <View style={{ flex: 1 }}>
                <Text style={styles.cautionTitle}>APPROACHING ACCIDENT HOTSPOT!</Text>
                <Text style={styles.cautionSub}>
                  Vibration triggered: High risk zone detected within {approachingHotspot.distanceKm} km
                </Text>
              </View>
            </View>
            <View style={styles.cautionDetails}>
              <Text style={styles.cautionLocName}>{approachingHotspot.title}</Text>
              <Text style={styles.cautionDesc}>{approachingHotspot.locationName} — Drive cautiously!</Text>
            </View>
          </View>
        )}

        {/* Filter Categories */}
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

        {/* Simulated GIS Canvas View */}
        <View style={styles.mapCanvas}>
          <View style={styles.gridBackground}>
            <View style={styles.radarRing1} />
            <View style={styles.radarRing2} />
            <Icon name="map" size={48} color="rgba(245, 158, 11, 0.2)" />
            <Text style={styles.canvasText}>GHANA ROAD NETWORK GIS RADAR</Text>
            <Text style={styles.canvasSubText}>
              {filteredMarkers.length} Active Hotspot & Emergency Markers Loaded
            </Text>
          </View>
        </View>

        {/* Hotspot Markers List */}
        <View style={styles.markersSection}>
          <Text style={styles.sectionTitle}>Hotspots & Incident Radius ({filteredMarkers.length})</Text>

          {loading ? (
            <ActivityIndicator color="#f59e0b" style={{ padding: 20 }} />
          ) : filteredMarkers.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No incident markers found for this category.</Text>
            </View>
          ) : (
            filteredMarkers.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.markerCard,
                  m.type === 'ACCIDENT' && styles.accidentCard,
                  m.type === 'HAZARD' && styles.hazardCard,
                ]}
              >
                <View style={styles.markerIconBox}>
                  <Icon
                    name={m.type === 'ACCIDENT' ? 'accident' : m.type === 'HAZARD' ? 'hazard' : 'hospital'}
                    size={22}
                    color={m.type === 'ACCIDENT' ? '#ef4444' : m.type === 'HAZARD' ? '#f59e0b' : '#3b82f6'}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.markerHeader}>
                    <Text style={styles.markerTitle}>{m.title}</Text>
                    {m.distanceKm !== undefined && (
                      <Text style={styles.distBadge}>{m.distanceKm} km away</Text>
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
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 16,
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
    color: '#f59e0b',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  gpsChip: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  gpsText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '800',
  },
  userLocBar: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  userLocText: {
    color: '#cbd5e1',
    fontSize: 11,
    flex: 1,
  },
  cautionBanner: {
    backgroundColor: '#7f1d1d',
    borderWidth: 2,
    borderColor: '#ef4444',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  cautionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cautionTitle: {
    color: '#fef08a',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  cautionSub: {
    color: '#fca5a5',
    fontSize: 11,
  },
  cautionDetails: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 10,
  },
  cautionLocName: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  cautionDesc: {
    color: '#fef08a',
    fontSize: 11,
    marginTop: 2,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  filterText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#0f172a',
  },
  mapCanvas: {
    height: 160,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBackground: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  radarRing1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  radarRing2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.1)',
  },
  canvasText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
    marginTop: 8,
    letterSpacing: 1,
  },
  canvasSubText: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  markersSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 12,
  },
  markerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  accidentCard: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  hazardCard: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  markerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markerTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
    flex: 1,
  },
  distBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
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
    color: '#cbd5e1',
    fontSize: 11,
  },
  markerDesc: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 14,
  },
});
