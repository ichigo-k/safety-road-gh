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
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>GHANA ROAD SAFETY</Text>
            <Text style={styles.headerTitle}>Incident & Alert Center</Text>
          </View>

          <TouchableOpacity style={styles.sosButton} onPress={() => makeCall('193')}>
            <Text style={styles.sosText}>SOS 193</Text>
          </TouchableOpacity>
        </View>

        {/* Action Cards */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#7f1d1d', borderColor: '#b91c1c' }]}
            onPress={() => onNavigateToReport('ACCIDENT')}
          >
            <View style={styles.iconBox}>
              <Icon name="accident" size={28} color="#ef4444" />
            </View>
            <Text style={styles.actionTitle}>Report Accident</Text>
            <Text style={styles.actionDesc}>Collision, injuries, vehicle breakdown</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#78350f', borderColor: '#d97706' }]}
            onNavigateToReport={() => onNavigateToReport('HAZARD')}
          >
            <View style={styles.iconBox}>
              <Icon name="hazard" size={28} color="#f59e0b" />
            </View>
            <Text style={styles.actionTitle}>Report Hazard</Text>
            <Text style={styles.actionDesc}>Pothole, flooding, broken traffic light</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Dial Dialers */}
        <View style={styles.quickDialContainer}>
          <Text style={styles.sectionTitle}>Emergency Direct Dial (Ghana)</Text>
          <View style={styles.dialRow}>
            <TouchableOpacity style={styles.dialChip} onPress={() => makeCall('193')}>
              <Icon name="ambulance" size={16} color="#ef4444" />
              <Text style={styles.dialLabel}>Ambulance 193</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dialChip} onPress={() => makeCall('18555')}>
              <Icon name="police" size={16} color="#3b82f6" />
              <Text style={styles.dialLabel}>Police 18555</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dialChip} onPress={() => makeCall('192')}>
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
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 18,
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
    color: '#f59e0b',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  sosButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
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
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconBox: {
    marginBottom: 8,
  },
  actionTitle: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 4,
  },
  actionDesc: {
    color: '#cbd5e1',
    fontSize: 11,
  },
  quickDialContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeCount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
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
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dialLabel: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 11,
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  alertCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertSeverity: {
    color: '#ef4444',
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  alertTime: {
    color: '#94a3b8',
    fontSize: 11,
  },
  alertTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 4,
  },
  alertDesc: {
    color: '#cbd5e1',
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
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '700',
  },
  reportCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
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
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
  },
  typeHazard: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    color: '#fde047',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusVerified: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: '#93c5fd',
  },
  statusPending: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    color: '#cbd5e1',
  },
  reportTitle: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  reportLoc: {
    color: '#94a3b8',
    fontSize: 12,
  },
  reportTime: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 6,
  },
});
