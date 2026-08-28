import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Callout, Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { apiFetch } from '../services/api';
import Icon from '../components/Icon';

const ACCRA: Region = { latitude: 5.6037, longitude: -0.187, latitudeDelta: 0.18, longitudeDelta: 0.18 };
type Filter = 'ALL' | 'ACCIDENT' | 'HAZARD';
type Report = { id: string; title: string; type: 'ACCIDENT' | 'HAZARD'; status: string; latitude: number; longitude: number; locationName: string; description?: string; createdAt?: string };
type Service = { id: string; name: string; type: string; latitude: number; longitude: number; phone?: string };

function markerColor(item: Report) {
  if (item.status === 'RESOLVED') return '#17b85a';
  return item.type === 'ACCIDENT' ? '#d95555' : '#e8a126';
}

export default function MapScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [selected, setSelected] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<MapView | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch('/reports').catch(() => ({ reports: [] })),
      apiFetch('/emergency-services').catch(() => ({ services: [] })),
    ]).then(([reportsRes, servicesRes]) => {
      if (!active) return;
      setReports((reportsRes.reports || []).filter((item: Report) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)));
      setServices((servicesRes.services || []).filter((item: Service) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleReports = useMemo(() => filter === 'ALL' ? reports : reports.filter((item) => item.type === filter), [filter, reports]);

  const fitToReports = () => {
    if (!map || visibleReports.length === 0) return;
    map.fitToCoordinates(visibleReports.map((item) => ({ latitude: item.latitude, longitude: item.longitude })), { edgePadding: { top: 100, right: 55, bottom: 210, left: 55 }, animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8f5" />
      <View style={styles.header}><View><Text style={styles.eyebrow}>NETWORK VIEW</Text><Text style={styles.title}>Road map</Text></View><TouchableOpacity activeOpacity={.8} style={styles.recenter} onPress={() => map?.animateToRegion(ACCRA, 650)}><Icon name="location" size={16} color="#0e7a3f" /></TouchableOpacity></View>
      <View style={styles.mapFrame}>
        <MapView ref={(ref) => setMap(ref)} provider={PROVIDER_DEFAULT} style={styles.map} initialRegion={ACCRA} mapType="standard" showsCompass showsScale showsBuildings loadingEnabled>
          {visibleReports.map((item) => <Marker key={item.id} coordinate={{ latitude: item.latitude, longitude: item.longitude }} pinColor={markerColor(item)} onPress={() => setSelected(item)} tracksViewChanges={false}><Callout onPress={() => setSelected(item)}><View style={styles.callout}><Text style={styles.calloutType}>{item.type}</Text><Text style={styles.calloutTitle}>{item.title}</Text><Text style={styles.calloutLocation}>{item.locationName}</Text><Text style={styles.calloutStatus}>{item.status}</Text></View></Callout></Marker>)}
          {services.map((item) => <Marker key={`service-${item.id}`} coordinate={{ latitude: item.latitude, longitude: item.longitude }} pinColor="#315c9e" tracksViewChanges={false}><Callout><View style={styles.callout}><Text style={styles.calloutType}>EMERGENCY SERVICE</Text><Text style={styles.calloutTitle}>{item.name}</Text><Text style={styles.calloutLocation}>{item.phone || item.type}</Text></View></Callout></Marker>)}
        </MapView>
        <View style={styles.mapOverlay}><View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>Live network</Text></View><TouchableOpacity activeOpacity={.82} style={styles.fitButton} onPress={fitToReports}><Icon name="map" size={14} color="#102018" /><Text style={styles.fitText}>Show reports</Text></TouchableOpacity></View>
        {loading && <View style={styles.loading}><ActivityIndicator color="#17b85a" /><Text style={styles.loadingText}>Loading live map…</Text></View>}
      </View>
      <View style={styles.bottomPanel}>
        <View style={styles.panelHandle} />
        <View style={styles.panelHeader}><View><Text style={styles.panelTitle}>Incidents nearby</Text><Text style={styles.panelSub}>{visibleReports.length} signals across the network</Text></View><View style={styles.counter}><Text style={styles.counterText}>{reports.length}</Text></View></View>
        <View style={styles.filters}>{(['ALL', 'ACCIDENT', 'HAZARD'] as Filter[]).map((item) => <TouchableOpacity key={item} activeOpacity={.8} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item === 'ALL' ? 'All' : item === 'ACCIDENT' ? 'Accidents' : 'Hazards'}</Text></TouchableOpacity>)}</View>
        {selected ? <View style={styles.selectedCard}><View style={[styles.selectedIcon, selected.type === 'ACCIDENT' ? styles.accidentBg : styles.hazardBg]}><Icon name={selected.type === 'ACCIDENT' ? 'accident' : 'hazard'} size={17} color={selected.type === 'ACCIDENT' ? '#b74747' : '#a76513'} /></View><View style={styles.selectedBody}><View style={styles.selectedTop}><Text numberOfLines={1} style={styles.selectedTitle}>{selected.title}</Text><TouchableOpacity onPress={() => setSelected(null)}><Text style={styles.closeText}>Close</Text></TouchableOpacity></View><Text numberOfLines={1} style={styles.selectedLocation}>{selected.locationName}</Text><Text style={styles.selectedStatus}>{selected.status}</Text></View></View> : <View style={styles.list}>{visibleReports.slice(0, 3).map((item) => <TouchableOpacity key={item.id} activeOpacity={.78} style={styles.listItem} onPress={() => { setSelected(item); map?.animateToRegion({ latitude: item.latitude, longitude: item.longitude, latitudeDelta: .04, longitudeDelta: .04 }, 500); }}><View style={[styles.listIcon, item.type === 'ACCIDENT' ? styles.accidentBg : styles.hazardBg]}><Icon name={item.type === 'ACCIDENT' ? 'accident' : 'hazard'} size={14} color={item.type === 'ACCIDENT' ? '#b74747' : '#a76513'} /></View><View style={styles.listBody}><Text numberOfLines={1} style={styles.listTitle}>{item.title}</Text><Text numberOfLines={1} style={styles.listLocation}>{item.locationName}</Text></View><View style={styles.listDot} /></TouchableOpacity>)}{visibleReports.length === 0 && <Text style={styles.empty}>No incidents match this filter.</Text>}</View>}
      </View>
    </SafeAreaView>
  );
}

const { height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f8f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14 },
  eyebrow: { color: '#17b85a', fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: '#102018', fontSize: 24, fontWeight: '900', letterSpacing: -.6, marginTop: 2 },
  recenter: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5f8eb' },
  mapFrame: { height: Math.min(390, height * .47), marginHorizontal: 12, borderRadius: 24, overflow: 'hidden', backgroundColor: '#dbe9df', shadowColor: '#102018', shadowOpacity: .1, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 3 },
  map: { flex: 1 },
  mapOverlay: { position: 'absolute', left: 14, right: 14, top: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 8, backgroundColor: '#102018' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2fdf76' },
  liveText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },
  fitButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 15, paddingHorizontal: 11, paddingVertical: 9, backgroundColor: '#ffffff', shadowColor: '#102018', shadowOpacity: .13, shadowRadius: 9, elevation: 2 },
  fitText: { color: '#203128', fontSize: 10, fontWeight: '900' },
  loading: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(244,248,245,.78)' },
  loadingText: { color: '#6d7d73', fontSize: 12, fontWeight: '700', marginTop: 8 },
  callout: { minWidth: 150, padding: 2 },
  calloutType: { color: '#17b85a', fontSize: 9, fontWeight: '900', letterSpacing: .9 },
  calloutTitle: { color: '#102018', fontSize: 13, fontWeight: '900', marginTop: 5 },
  calloutLocation: { color: '#6d7d73', fontSize: 10, marginTop: 3 },
  calloutStatus: { color: '#0e7a3f', fontSize: 9, fontWeight: '900', marginTop: 8 },
  bottomPanel: { flex: 1, marginTop: -3, borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: '#ffffff', paddingHorizontal: 20, paddingTop: 10 },
  panelHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 3, backgroundColor: '#dce5de', marginBottom: 15 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { color: '#102018', fontSize: 17, fontWeight: '900' },
  panelSub: { color: '#8a9a91', fontSize: 11, marginTop: 3 },
  counter: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5f8eb' },
  counterText: { color: '#0e7a3f', fontSize: 13, fontWeight: '900' },
  filters: { flexDirection: 'row', gap: 7, marginTop: 15, marginBottom: 13 },
  filter: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f3f7f4' },
  filterActive: { backgroundColor: '#102018' },
  filterText: { color: '#8a9a91', fontSize: 10, fontWeight: '900' },
  filterTextActive: { color: '#ffffff' },
  selectedCard: { flexDirection: 'row', gap: 11, borderRadius: 17, padding: 13, backgroundColor: '#f2fbf4', borderWidth: 1, borderColor: '#d7efdc' },
  selectedIcon: { width: 35, height: 35, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  selectedBody: { flex: 1 },
  selectedTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  selectedTitle: { flex: 1, color: '#203128', fontSize: 12, fontWeight: '900' },
  closeText: { color: '#17b85a', fontSize: 10, fontWeight: '900' },
  selectedLocation: { color: '#6d7d73', fontSize: 10, marginTop: 4 },
  selectedStatus: { color: '#0e7a3f', fontSize: 9, fontWeight: '900', marginTop: 6 },
  list: { gap: 8 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#edf2ee', paddingVertical: 10 },
  listIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  accidentBg: { backgroundColor: '#ffebeb' },
  hazardBg: { backgroundColor: '#fff1d5' },
  listBody: { flex: 1 },
  listTitle: { color: '#203128', fontSize: 12, fontWeight: '800' },
  listLocation: { color: '#8a9a91', fontSize: 10, marginTop: 3 },
  listDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2fdf76' },
  empty: { color: '#8a9a91', fontSize: 12, paddingVertical: 18 },
});
