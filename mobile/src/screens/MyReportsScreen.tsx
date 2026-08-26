import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Image,
} from 'react-native';
import { apiFetch } from '../services/api';

export default function MyReportsScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyReports = async () => {
    try {
      const res = await apiFetch('/reports/my');
      if (res.reports) setReports(res.reports);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyReports();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
      >
        <Text style={styles.headerTitle}>My Report Tracking</Text>
        <Text style={styles.headerSubtitle}>Live status updates from Ghana MTTD Road Safety Command</Text>

        {loading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Fetching your reports...</Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Reports Submitted</Text>
            <Text style={styles.emptyDesc}>When you submit road accident or hazard reports, you can track their verification status here.</Text>
          </View>
        ) : (
          reports.map((report) => (
            <View key={report.id} style={styles.card}>
              {report.photoUrl && (
                <Image source={{ uri: report.photoUrl }} style={styles.photo} resizeMode="cover" />
              )}
              <View style={styles.cardBody}>
                <View style={styles.badgeRow}>
                  <Text style={[styles.badge, report.type === 'ACCIDENT' ? styles.typeAccident : styles.typeHazard]}>
                    {report.type}
                  </Text>
                  <Text
                    style={[
                      styles.badge,
                      report.status === 'VERIFIED'
                        ? styles.statusVerified
                        : report.status === 'RESOLVED'
                        ? styles.statusResolved
                        : styles.statusPending,
                    ]}
                  >
                    STATUS: {report.status}
                  </Text>
                </View>

                <Text style={styles.title}>{report.title}</Text>
                <Text style={styles.desc}>{report.description}</Text>

                <Text style={styles.location}>📍 {report.locationName}</Text>
                <Text style={styles.date}>Submitted on {new Date(report.createdAt).toLocaleString()}</Text>

                {/* Timeline History */}
                {report.history && report.history.length > 0 && (
                  <View style={styles.timelineBox}>
                    <Text style={styles.timelineTitle}>Status History Log</Text>
                    {report.history.map((hist: any) => (
                      <View key={hist.id} style={styles.historyItem}>
                        <View style={styles.historyDot} />
                        <View style={styles.historyContent}>
                          <Text style={styles.historyStatus}>[{hist.status}] by {hist.changedBy?.name || 'Officer'}</Text>
                          {hist.notes && <Text style={styles.historyNotes}>{hist.notes}</Text>}
                          <Text style={styles.historyDate}>{new Date(hist.createdAt).toLocaleTimeString()}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))
        )}
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
    padding: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 20,
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748b',
  },
  emptyContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 6,
  },
  emptyDesc: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  photo: {
    width: '100%',
    height: 150,
  },
  cardBody: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
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
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
  },
  statusVerified: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
  },
  statusResolved: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  desc: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  location: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '700',
  },
  date: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 4,
  },
  timelineBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  timelineTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
    marginTop: 5,
    marginRight: 8,
  },
  historyContent: {
    flex: 1,
  },
  historyStatus: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  historyNotes: {
    color: '#cbd5e1',
    fontSize: 11,
  },
  historyDate: {
    color: '#64748b',
    fontSize: 9,
  },
});
