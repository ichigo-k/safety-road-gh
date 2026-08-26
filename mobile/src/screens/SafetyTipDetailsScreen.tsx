import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';

interface SafetyTipDetailsScreenProps {
  tip: any;
  onBack: () => void;
}

export default function SafetyTipDetailsScreen({ tip, onBack }: SafetyTipDetailsScreenProps) {
  if (!tip) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', padding: 20 }}>No safety tip selected.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back to Safety Tips</Text>
        </TouchableOpacity>

        <Text style={styles.categoryBadge}>{tip.category} GUIDE</Text>
        <Text style={styles.title}>{tip.title}</Text>
        <Text style={styles.date}>Published by Ghana Road Safety Authority</Text>

        <View style={styles.contentCard}>
          <Text style={styles.contentText}>{tip.content}</Text>
        </View>

        <View style={styles.reminderCard}>
          <Text style={styles.reminderTitle}>🛡️ Remember:</Text>
          <Text style={styles.reminderText}>
            Road safety is a shared responsibility. Obey all traffic signals, avoid driving under the influence of alcohol or fatigue, and report hazardous road conditions promptly.
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
  categoryBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#60a5fa',
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  date: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 20,
  },
  contentCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  contentText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 24,
  },
  reminderCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  reminderTitle: {
    color: '#60a5fa',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 4,
  },
  reminderText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
});
