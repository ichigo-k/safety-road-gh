import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

interface ReportSubmittedScreenProps {
  onGoToTracking: () => void;
  onGoHome: () => void;
}

export default function ReportSubmittedScreen({ onGoToTracking, onGoHome }: ReportSubmittedScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🎉</Text>
        </View>

        <Text style={styles.title}>Report Submitted Successfully!</Text>
        <Text style={styles.subtitle}>
          Your report has been logged and transmitted to Ghana MTTD Command Center & Emergency Services for verification.
        </Text>

        <View style={styles.refCard}>
          <Text style={styles.refLabel}>OFFICIAL REPORT REFERENCE ID</Text>
          <Text style={styles.refCode}>SR-GH-2026-9482</Text>
          <Text style={styles.refHint}>You can track updates to this report under 'My Reports'</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onGoToTracking}>
          <Text style={styles.primaryBtnText}>Track My Report Status</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onGoHome}>
          <Text style={styles.secondaryBtnText}>Return to Home Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 2,
    borderColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 42,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  refCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    width: '100%',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#334155',
  },
  refLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  refCode: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f59e0b',
    letterSpacing: 2,
  },
  refHint: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 6,
  },
  primaryBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 15,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 15,
  },
  secondaryBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
