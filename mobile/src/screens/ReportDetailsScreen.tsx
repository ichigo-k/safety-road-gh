import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Image } from 'react-native';

interface ReportDetailsScreenProps {
  report: any;
  onBack: () => void;
}

export default function ReportDetailsScreen({ report, onBack }: ReportDetailsScreenProps) {
  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', padding: 20 }}>No report details available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back to Reports</Text>
        </TouchableOpacity>

        {report.photoUrl && (
          <Image source={{ uri: report.photoUrl }} style={styles.photo} resizeMode="cover" />
        )}

        <View style={styles.badgeRow}>
          <Text style={[styles.badge, report.type === 'ACCIDENT' ? styles.typeAccident : styles.typeHazard]}>
            {report.type}
          </Text>
          <Text style={styles.statusBadge}>{report.status}</Text>
        </View>

        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.location}>📍 {report.locationName}</Text>
        <Text style={styles.date}>Reported on {new Date(report.createdAt).toLocaleString()}</Text>

        <View style={styles.descCard}>
          <Text style={styles.descLabel}>Incident Description</Text>
          <Text style={styles.descText}>{report.description}</Text>
        </View>

        <View style={styles.statGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{report.injuredCount || 0}</Text>
            <Text style={styles.statLabel}>Injuries</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{report.vehicleCount || 0}</Text>
            <Text style={styles.statLabel}>Vehicles</Text>
          </View>
        </View>

        {/* Timeline Log */}
        <View style={styles.timelineBox}>
          <Text style={styles.timelineTitle}>Officer Action Timeline</Text>
          {report.history && report.history.length > 0 ? (
            report.history.map((hist: any) => (
              <View key={hist.id} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>[{hist.status}]</Text>
                  <Text style={styles.timelineNotes}>{hist.notes || 'Status updated by MTTD Command'}</Text>
                  <Text style={styles.timelineDate}>{new Date(hist.createdAt).toLocaleString()}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noHistory}>No status changes recorded yet.</Text>
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
    padding: 20,
  },
  backBtn: {
    marginBottom: 16,
  },
  backText: {
    color: '#f59e0b',
    fontWeight: '700',
    fontSize: 14,
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  location: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  date: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 16,
  },
  descCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  descLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  descText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f59e0b',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  timelineBox: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timelineTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
    marginTop: 6,
    marginRight: 10,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  timelineNotes: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 2,
  },
  timelineDate: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  noHistory: {
    color: '#64748b',
    fontSize: 12,
  },
});
