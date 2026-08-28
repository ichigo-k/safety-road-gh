import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { apiFetch } from '../services/api';
import Icon from '../components/Icon';
import MapViewComponent, { MapMarkerData } from '../components/MapViewComponent';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACCRA = { latitude: 5.6037, longitude: -0.187, latitudeDelta: 0.18, longitudeDelta: 0.18 };

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

function markerColor(item: Report) {
  if (item.status === 'RESOLVED') return '#22C55E';
  return item.type === 'ACCIDENT' ? '#DC2626' : '#F97316';
}

export default function MapScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [selected, setSelected] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [reportsRes, servicesRes] = await Promise.all([
        apiFetch('/reports').catch(() => ({ reports: [] })),
        apiFetch('/emergency-services').catch(() => ({ services: [] })),
      ]);
      setReports(
        (reportsRes.reports || []).filter(
          (item: Report) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
        )
      );
      setServices(
        (servicesRes.services || []).filter(
          (item: Service) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const visibleReports = useMemo(
    () => (filter === 'ALL' ? reports : reports.filter((item) => item.type === filter)),
    [filter, reports]
  );

  const formattedMarkers: MapMarkerData[] = useMemo(() => {
    const reportMarkers: MapMarkerData[] = visibleReports.map((r) => ({
      id: r.id,
      latitude: r.latitude,
      longitude: r.longitude,
      title: r.title,
      locationName: r.locationName,
      type: r.type,
      status: r.status,
      color: markerColor(r),
    }));

    const serviceMarkers: MapMarkerData[] = services.map((s) => ({
      id: `service-${s.id}`,
      latitude: s.latitude,
      longitude: s.longitude,
      title: s.name,
      locationName: s.phone || s.type,
      type: 'EMERGENCY',
      color: '#3B82F6',
    }));

    return [...reportMarkers, ...serviceMarkers];
  }, [visibleReports, services]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f6cbd" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>NETWORK VIEW</Text>
            <Text style={styles.title}>Road Map</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} style={styles.recenter} onPress={loadData}>
            <Icon name="location" size={16} color="#0f6cbd" />
          </TouchableOpacity>
        </View>

        {/* Map Frame */}
        <View style={styles.mapFrame}>
          <MapViewComponent
            style={styles.map}
            region={ACCRA}
            markers={formattedMarkers}
            onMarkerPress={(m: MapMarkerData) => {
              const matched = reports.find((r) => r.id === m.id);
              if (matched) setSelected(matched);
            }}
          />
          <View style={styles.mapOverlay}>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live Network</Text>
            </View>
          </View>
          {loading && (
            <View style={styles.loading}>
              <ActivityIndicator color="#0f6cbd" />
              <Text style={styles.loadingText}>Loading live map...</Text>
            </View>
          )}
        </View>

        {/* Bottom Panel */}
        <View style={styles.bottomPanel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Incidents Nearby</Text>
              <Text style={styles.panelSub}>{visibleReports.length} signals across Ghana network</Text>
            </View>
            <View style={styles.counter}>
              <Text style={styles.counterText}>{reports.length}</Text>
            </View>
          </View>

          {/* Filter Chips */}
          <View style={styles.filters}>
            {(['ALL', 'ACCIDENT', 'HAZARD'] as Filter[]).map((item) => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                onPress={() => setFilter(item)}
                style={[styles.filter, filter === item && styles.filterActive]}
              >
                <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                  {item === 'ALL' ? 'All' : item === 'ACCIDENT' ? 'Accidents' : 'Hazards'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected Incident Card */}
          {selected ? (
            <View style={styles.selectedCard}>
              <View
                style={[
                  styles.selectedIcon,
                  selected.type === 'ACCIDENT' ? styles.accidentBg : styles.hazardBg,
                ]}
              >
                <Icon
                  name={selected.type === 'ACCIDENT' ? 'accident' : 'hazard'}
                  size={17}
                  color={selected.type === 'ACCIDENT' ? '#DC2626' : '#F97316'}
                />
              </View>
              <View style={styles.selectedBody}>
                <View style={styles.selectedTop}>
                  <Text numberOfLines={1} style={styles.selectedTitle}>
                    {selected.title}
                  </Text>
                  <TouchableOpacity onPress={() => setSelected(null)}>
                    <Text style={styles.closeText}>Close</Text>
                  </TouchableOpacity>
                </View>
                <Text numberOfLines={1} style={styles.selectedLocation}>
                  {selected.locationName}
                </Text>
                <Text style={styles.selectedStatus}>{selected.status}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.list}>
              {visibleReports.slice(0, 4).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.78}
                  style={styles.listItem}
                  onPress={() => setSelected(item)}
                >
                  <View
                    style={[
                      styles.listIcon,
                      item.type === 'ACCIDENT' ? styles.accidentBg : styles.hazardBg,
                    ]}
                  >
                    <Icon
                      name={item.type === 'ACCIDENT' ? 'accident' : 'hazard'}
                      size={14}
                      color={item.type === 'ACCIDENT' ? '#DC2626' : '#F97316'}
                    />
                  </View>
                  <View style={styles.listBody}>
                    <Text numberOfLines={1} style={styles.listTitle}>
                      {item.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.listLocation}>
                      {item.locationName}
                    </Text>
                  </View>
                  <View style={styles.listDot} />
                </TouchableOpacity>
              ))}
              {visibleReports.length === 0 && (
                <Text style={styles.empty}>No incidents match this filter.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { padding: 16, paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eyebrow: { color: '#0f6cbd', fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: '#172b4d', fontSize: 24, fontWeight: '900', letterSpacing: -0.6, marginTop: 2 },
  recenter: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  mapFrame: {
    height: 340,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  map: { flex: 1 },
  mapOverlay: {
    position: 'absolute',
    left: 12,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#172b4d',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  liveText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  loadingText: { color: '#64748B', fontSize: 12, fontWeight: '700', marginTop: 8 },
  bottomPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { color: '#172b4d', fontSize: 17, fontWeight: '900' },
  panelSub: { color: '#667085', fontSize: 11, marginTop: 2 },
  counter: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  counterText: { color: '#0f6cbd', fontSize: 13, fontWeight: '900' },
  filters: { flexDirection: 'row', gap: 6, marginTop: 14, marginBottom: 12 },
  filter: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F1F5F9' },
  filterActive: { backgroundColor: '#0f6cbd' },
  filterText: { color: '#64748B', fontSize: 11, fontWeight: '900' },
  filterTextActive: { color: '#ffffff' },
  selectedCard: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  selectedIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  selectedBody: { flex: 1 },
  selectedTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  selectedTitle: { flex: 1, color: '#172b4d', fontSize: 13, fontWeight: '900' },
  closeText: { color: '#0f6cbd', fontSize: 10, fontWeight: '900' },
  selectedLocation: { color: '#667085', fontSize: 11, marginTop: 3 },
  selectedStatus: { color: '#0f6cbd', fontSize: 10, fontWeight: '900', marginTop: 4 },
  list: { gap: 6 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 8,
  },
  listIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  accidentBg: { backgroundColor: '#FEF2F2' },
  hazardBg: { backgroundColor: '#FFF7ED' },
  listBody: { flex: 1 },
  listTitle: { color: '#172b4d', fontSize: 12, fontWeight: '800' },
  listLocation: { color: '#667085', fontSize: 10, marginTop: 2 },
  listDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  empty: { color: '#94A3B8', fontSize: 12, paddingVertical: 14 },
});
