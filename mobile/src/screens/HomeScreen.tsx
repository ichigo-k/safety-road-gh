import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Linking,
  RefreshControl,
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
    try {
      const [alertsRes, reportsRes] = await Promise.all([
        apiFetch('/alerts').catch(() => ({ alerts: [] })),
        apiFetch('/reports').catch(() => ({ reports: [] })),
      ]);
      setAlerts(alertsRes.alerts || []);
      setReports(reportsRes.reports || []);
    } catch (e) {
      console.error(e);
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

  const makeCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f6cbd" />}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>GHANA ROAD SAFETY</Text>
            <Text style={styles.headerTitle}>Stay safe on the road</Text>
          </View>

          <TouchableOpacity activeOpacity={0.78} style={styles.sosButton} onPress={() => makeCall('193')}>
            <Icon name="phone" size={15} color="#ffffff" /><Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
        </View>

        {/* Action Cards */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.82}
            style={[styles.actionCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
            onPress={() => onNavigateToReport('ACCIDENT')}
          >
            <View style={styles.iconBox}>
              <Icon name="accident" size={28} color="#ef4444" />
            </View>
            <Text style={styles.actionTitle}>Report Accident</Text>
            <Text style={styles.actionDesc}>Collision, injuries, vehicle breakdown</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.82}
            style={[styles.actionCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
            onPress={() => onNavigateToReport('HAZARD')}
          >
            <View style={styles.iconBox}>
              <Icon name="hazard" size={28} color="#d92d20" />
            </View>
            <Text style={styles.actionTitle}>Report Hazard</Text>
            <Text style={styles.actionDesc}>Pothole, flooding, broken traffic light</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Dial Dialers */}
        <View style={styles.quickDialContainer}>
          <Text style={styles.sectionTitle}>Emergency Direct Dial (Ghana)</Text>
          <View style={styles.dialRow}>
            <TouchableOpacity activeOpacity={0.78} style={styles.dialChip} onPress={() => makeCall('193')}>
              <Icon name="ambulance" size={16} color="#ef4444" />
              <Text style={styles.dialLabel}>Ambulance 193</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.78} style={styles.dialChip} onPress={() => makeCall('18555')}>
              <Icon name="police" size={16} color="#3b82f6" />
              <Text style={styles.dialLabel}>Police 18555</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.78} style={styles.dialChip} onPress={() => makeCall('192')}>
              <Icon name="fire" size={16} color="#f97316" />
              <Text style={styles.dialLabel}>Fire 192</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Broadcast Road Alerts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Broadcast Road Alerts</Text>
          <Text style={styles.badgeCount}>{alerts.length} Active</Text>
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No critical road alerts broadcasted currently.</Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertSeverity}>[{alert.severity}] {alert.alertType}</Text>
                <Text style={styles.alertTime}>{new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertDesc}>{alert.description}</Text>
              {alert.locationName && (
                <View style={styles.locationRow}>
                  <Icon name="location" size={12} color="#f59e0b" />
                  <Text style={styles.alertLoc}>{alert.locationName}</Text>
                </View>
              )}
            </View>
          ))
        )}

        {/* Recent Community Incidents */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Incidents Nearby</Text>
        </View>

        {reports.slice(0, 4).map((report) => (
          <View key={report.id} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <Text style={[styles.typeBadge, report.type === 'ACCIDENT' ? styles.typeAccident : styles.typeHazard]}>
                {report.type}
              </Text>
              <Text style={[styles.statusBadge, report.status === 'VERIFIED' ? styles.statusVerified : styles.statusPending]}>
                {report.status}
              </Text>
            </View>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <View style={styles.locationRow}>
              <Icon name="location" size={12} color="#94a3b8" />
              <Text style={styles.reportLoc}>{report.locationName}</Text>
            </View>
            <Text style={styles.reportTime}>{new Date(report.createdAt).toLocaleDateString()} by {report.user?.name || 'Citizen'}</Text>
          </View>
        ))}
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
    padding: 20,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f6cbd',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#172b4d',
  },
  sosButton: {
    backgroundColor: '#d92d20',
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sosText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  actionTitle: {
    color: '#172b4d',
    fontWeight: '900',
    fontSize: 15,
    marginBottom: 4,
  },
  actionDesc: {
    color: '#667085',
    fontSize: 12,
    lineHeight: 17,
  },
  quickDialContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e4e7ec',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#172b4d',
    letterSpacing: 0,
  },
  badgeCount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f6cbd',
    backgroundColor: 'rgba(15, 108, 189, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dialRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  dialChip: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4e7ec',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dialLabel: {
    color: '#172b4d',
    fontWeight: '700',
    fontSize: 11,
  },
  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#e4e7ec',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#667085',
    fontSize: 13,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: '#fecdca',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertSeverity: {
    color: '#d92d20',
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  alertTime: {
    color: '#667085',
    fontSize: 11,
  },
  alertTitle: {
    color: '#172b4d',
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 4,
  },
  alertDesc: {
    color: '#667085',
    fontSize: 12,
    lineHeight: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  alertLoc: {
    color: '#0f6cbd',
    fontSize: 11,
    fontWeight: '700',
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e4e7ec',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeAccident: {
    backgroundColor: '#FEF2F2',
    color: '#d92d20',
  },
  typeHazard: {
    backgroundColor: '#FFF7ED',
    color: '#c2410c',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusVerified: {
    backgroundColor: '#EFF6FF',
    color: '#0f6cbd',
  },
  statusPending: {
    backgroundColor: '#F1F5F9',
    color: '#667085',
  },
  reportTitle: {
    color: '#172b4d',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  reportLoc: {
    color: '#667085',
    fontSize: 12,
  },
  reportTime: {
    color: '#98a2b3',
    fontSize: 10,
    marginTop: 6,
  },
});
