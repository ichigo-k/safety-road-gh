import { useEffect, useState } from 'react';
import {
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiFetch } from '../services/api';
import Icon from '../components/Icon';

interface HomeScreenProps {
  onNavigateToReport: (type: 'ACCIDENT' | 'HAZARD') => void;
  onNavigateToEmergency: () => void;
}

export default function HomeScreen({ onNavigateToReport, onNavigateToEmergency }: HomeScreenProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [alertsRes, reportsRes] = await Promise.all([
      apiFetch('/alerts').catch(() => ({ alerts: [] })),
      apiFetch('/reports').catch(() => ({ reports: [] })),
    ]);
    setAlerts(alertsRes.alerts || []);
    setReports(reportsRes.reports || []);
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const makeCall = (number: string) => Linking.openURL(`tel:${number}`);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8f5" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#17b85a" />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Icon name="shield" size={19} color="#0a3320" /></View>
            <View><Text style={styles.eyebrow}>SAFETY ROAD GH</Text><Text style={styles.greeting}>Good morning</Text></View>
          </View>
          <TouchableOpacity activeOpacity={0.8} style={styles.sosButton} onPress={() => makeCall('193')}><Icon name="phone" size={14} color="#ffffff" /><Text style={styles.sosText}>SOS</Text></TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroCopy}><Text style={styles.heroEyebrow}>YOUR ROAD SAFETY NETWORK</Text><Text style={styles.heroTitle}>Move safer, wherever you go.</Text><Text style={styles.heroDesc}>Report what you see and help response teams keep Ghana moving.</Text></View>
          <View style={styles.heroOrnament}><View style={styles.heroRing}><View style={styles.heroDot} /></View><View style={styles.heroRoadLine} /></View>
        </View>

        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>How can we help?</Text><Text style={styles.sectionHint}>Choose an action</Text></View>
        <View style={styles.actionGrid}>
          <TouchableOpacity activeOpacity={0.82} style={[styles.actionCard, styles.accidentCard]} onPress={() => onNavigateToReport('ACCIDENT')}><View style={[styles.actionIcon, styles.accidentIcon]}><Icon name="accident" size={22} color="#b74747" /></View><Text style={styles.actionTitle}>Report accident</Text><Text style={styles.actionDesc}>Collision or breakdown</Text><View style={styles.actionArrow}><Text style={styles.arrowText}>↗</Text></View></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.82} style={[styles.actionCard, styles.hazardCard]} onPress={() => onNavigateToReport('HAZARD')}><View style={[styles.actionIcon, styles.hazardIcon]}><Icon name="hazard" size={22} color="#a76513" /></View><Text style={styles.actionTitle}>Report hazard</Text><Text style={styles.actionDesc}>Pothole, flood or danger</Text><View style={styles.actionArrow}><Text style={styles.arrowText}>↗</Text></View></TouchableOpacity>
        </View>

        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Emergency contacts</Text><TouchableOpacity onPress={onNavigateToEmergency}><Text style={styles.seeAll}>See all</Text></TouchableOpacity></View>
        <View style={styles.emergencyRow}>
          {[['ambulance', 'Ambulance', '193', '#b74747', '#ffebeb'], ['police', 'Police', '18555', '#315c9e', '#e8f1ff'], ['fire', 'Fire', '192', '#a76513', '#fff5e2']].map(([icon, label, number, color, background]) => <TouchableOpacity key={label} activeOpacity={0.78} style={styles.emergencyChip} onPress={() => makeCall(number)}><View style={[styles.emergencyIcon, { backgroundColor: background }]}><Icon name={icon} size={15} color={color} /></View><Text style={styles.emergencyLabel}>{label}</Text><Text style={styles.emergencyNumber}>{number}</Text></TouchableOpacity>)}
        </View>

        <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Live road alerts</Text><Text style={styles.sectionHint}>Updates from command</Text></View><View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>{alerts.length} active</Text></View></View>
        {alerts.length === 0 ? <View style={styles.emptyCard}><View style={styles.emptyIcon}><Icon name="shield" size={18} color="#17b85a" /></View><View><Text style={styles.emptyTitle}>All clear for now</Text><Text style={styles.emptyText}>No critical broadcasts in your network.</Text></View></View> : alerts.slice(0, 3).map((alert) => <View key={alert.id} style={styles.alertCard}><View style={styles.alertAccent} /><View style={styles.alertBody}><View style={styles.alertHeader}><Text style={styles.alertSeverity}>{alert.severity || 'NOTICE'}</Text><Text style={styles.alertTime}>{new Date(alert.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text></View><Text style={styles.alertTitle}>{alert.title}</Text><Text numberOfLines={2} style={styles.alertDesc}>{alert.description}</Text>{alert.locationName && <View style={styles.locationRow}><Icon name="location" size={12} color="#17b85a" /><Text style={styles.alertLoc}>{alert.locationName}</Text></View>}</View></View>)}

        <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Community signals</Text><Text style={styles.sectionHint}>Recent reports on the network</Text></View></View>
        {reports.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyText}>Your community reports will appear here.</Text></View> : reports.slice(0, 3).map((report) => <View key={report.id} style={styles.reportCard}><View style={[styles.reportIcon, report.type === 'ACCIDENT' ? styles.accidentIcon : styles.hazardIcon]}><Icon name={report.type === 'ACCIDENT' ? 'accident' : 'hazard'} size={16} color={report.type === 'ACCIDENT' ? '#b74747' : '#a76513'} /></View><View style={styles.reportBody}><View style={styles.reportTop}><Text numberOfLines={1} style={styles.reportTitle}>{report.title}</Text><Text style={[styles.statusBadge, report.status === 'VERIFIED' ? styles.statusVerified : styles.statusPending]}>{report.status}</Text></View><View style={styles.locationRow}><Icon name="location" size={12} color="#8a9a91" /><Text numberOfLines={1} style={styles.reportLoc}>{report.locationName}</Text></View></View></View>)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f8f5' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 13, paddingBottom: 35 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#2fdf76', alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: '#17b85a', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  greeting: { color: '#102018', fontSize: 17, fontWeight: '800', marginTop: 2 },
  sosButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 10, backgroundColor: '#102018' },
  sosText: { color: '#ffffff', fontSize: 12, fontWeight: '900', letterSpacing: .8 },
  heroCard: { minHeight: 175, overflow: 'hidden', borderRadius: 24, backgroundColor: '#102018', padding: 21, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  heroCopy: { flex: 1, paddingRight: 4 },
  heroEyebrow: { color: '#73ef9c', fontSize: 9, fontWeight: '900', letterSpacing: 1.15 },
  heroTitle: { color: '#ffffff', fontSize: 28, lineHeight: 31, fontWeight: '900', letterSpacing: -.8, marginTop: 11 },
  heroDesc: { color: '#afc1b5', fontSize: 12, lineHeight: 18, marginTop: 10, maxWidth: 220 },
  heroOrnament: { width: 75, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  heroRing: { width: 68, height: 68, borderRadius: 34, borderWidth: 1, borderColor: '#376048', alignItems: 'center', justifyContent: 'center' },
  heroDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#2fdf76', shadowColor: '#2fdf76', shadowRadius: 14, shadowOpacity: .7 },
  heroRoadLine: { position: 'absolute', height: 125, width: 1, backgroundColor: '#376048', transform: [{ rotate: '28deg' }] },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 11, marginTop: 4 },
  sectionTitle: { color: '#102018', fontSize: 16, fontWeight: '900', letterSpacing: -.25 },
  sectionHint: { color: '#8a9a91', fontSize: 11, marginTop: 3 },
  seeAll: { color: '#17b85a', fontSize: 12, fontWeight: '800' },
  actionGrid: { flexDirection: 'row', gap: 11, marginBottom: 24 },
  actionCard: { flex: 1, minHeight: 145, borderRadius: 20, borderWidth: 1, padding: 15, position: 'relative' },
  accidentCard: { backgroundColor: '#fff5f5', borderColor: '#f9d9d9' },
  hazardCard: { backgroundColor: '#fff9ee', borderColor: '#f5e4bd' },
  actionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  accidentIcon: { backgroundColor: '#ffebeb' },
  hazardIcon: { backgroundColor: '#fff1d5' },
  actionTitle: { color: '#203128', fontSize: 14, fontWeight: '900' },
  actionDesc: { color: '#8a9a91', fontSize: 11, lineHeight: 15, marginTop: 5, maxWidth: 105 },
  actionArrow: { position: 'absolute', right: 13, bottom: 13, width: 25, height: 25, borderRadius: 9, backgroundColor: 'rgba(255,255,255,.8)', alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: '#6d7d73', fontSize: 16, fontWeight: '700' },
  emergencyRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  emergencyChip: { flex: 1, borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e0e9e2', padding: 10 },
  emergencyIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emergencyLabel: { color: '#203128', fontSize: 11, fontWeight: '800' },
  emergencyNumber: { color: '#8a9a91', fontSize: 10, marginTop: 2 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, backgroundColor: '#e5f8eb', paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#17b85a' },
  liveText: { color: '#0e7a3f', fontSize: 10, fontWeight: '900' },
  emptyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, borderWidth: 1, borderColor: '#e0e9e2', backgroundColor: '#ffffff', padding: 15, marginBottom: 24 },
  emptyIcon: { width: 35, height: 35, borderRadius: 11, backgroundColor: '#e5f8eb', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#203128', fontSize: 13, fontWeight: '900' },
  emptyText: { color: '#8a9a91', fontSize: 11, lineHeight: 16 },
  alertCard: { flexDirection: 'row', overflow: 'hidden', borderRadius: 18, borderWidth: 1, borderColor: '#e0e9e2', backgroundColor: '#ffffff', marginBottom: 10 },
  alertAccent: { width: 4, backgroundColor: '#f1a33a' },
  alertBody: { flex: 1, padding: 14 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertSeverity: { color: '#a76513', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  alertTime: { color: '#a2b0a7', fontSize: 10 },
  alertTitle: { color: '#203128', fontSize: 14, fontWeight: '900', marginTop: 7 },
  alertDesc: { color: '#6d7d73', fontSize: 11, lineHeight: 16, marginTop: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  alertLoc: { color: '#6d7d73', fontSize: 10 },
  reportCard: { flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 18, borderWidth: 1, borderColor: '#e0e9e2', backgroundColor: '#ffffff', padding: 13, marginBottom: 10 },
  reportIcon: { width: 35, height: 35, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  reportBody: { flex: 1 },
  reportTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  reportTitle: { color: '#203128', flex: 1, fontSize: 12, fontWeight: '900' },
  reportLoc: { color: '#8a9a91', flex: 1, fontSize: 10 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4, fontSize: 8, fontWeight: '900', overflow: 'hidden' },
  statusVerified: { color: '#0e7a3f', backgroundColor: '#e5f8eb' },
  statusPending: { color: '#a76513', backgroundColor: '#fff5e2' },
});
