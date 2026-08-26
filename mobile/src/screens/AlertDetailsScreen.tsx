import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';

interface AlertDetailsScreenProps {
  alert: any;
  onBack: () => void;
}

export default function AlertDetailsScreen({ alert, onBack }: AlertDetailsScreenProps) {
  if (!alert) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', padding: 20 }}>No alert details selected.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back to Alerts</Text>
        </TouchableOpacity>

        <View style={styles.badgeRow}>
          <Text style={styles.severityBadge}>[{alert.severity}] SEVERITY</Text>
          <Text style={styles.typeBadge}>{alert.alertType}</Text>
        </View>

        <Text style={styles.title}>{alert.title}</Text>
        {alert.locationName && <Text style={styles.location}>📍 Affected Area: {alert.locationName}</Text>}
        <Text style={styles.date}>Issued on {new Date(alert.createdAt).toLocaleString()}</Text>

        <View style={styles.descCard}>
          <Text style={styles.descLabel}>Official Broadcast Details</Text>
          <Text style={styles.descText}>{alert.description}</Text>
        </View>

        <View style={styles.adviceCard}>
          <Text style={styles.adviceTitle}>💡 Recommended Driver Advisory</Text>
          <Text style={styles.adviceText}>
            Driver caution is strongly advised. Maintain safe following distances, use hazard indicator lights where necessary, and adhere to traffic officer directions.
          </Text>
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
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  severityBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  location: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 20,
  },
  descCard: {
    backgroundColor: '#1e293b',
    padding: 18,
    borderRadius: 16,
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
    lineHeight: 22,
  },
  adviceCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  adviceTitle: {
    color: '#f59e0b',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 4,
  },
  adviceText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
});
