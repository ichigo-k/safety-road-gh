import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';

interface TermsConditionsScreenProps {
  onBack: () => void;
}

export default function TermsConditionsScreen({ onBack }: TermsConditionsScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back to Profile</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.date}>Effective Date: August 2026</Text>

        <View style={styles.card}>
          <Text style={styles.heading}>1. User Account Responsibility</Text>
          <Text style={styles.body}>
            By registering an account on Safety Road GH, you agree to provide accurate identification details and refrain from submitting false, misleading, or hoax accident reports.
          </Text>

          <Text style={styles.heading}>2. Misuse & False Reporting</Text>
          <Text style={styles.body}>
            Submitting deliberate false emergency reports or hoax accident claims is strictly prohibited and subject to account termination and reporting to Ghana law enforcement authorities.
          </Text>

          <Text style={styles.heading}>3. Emergency Use Disclaimer</Text>
          <Text style={styles.body}>
            While Safety Road GH facilitates emergency service contact numbers, in active life-threatening emergencies users should directly call National Emergency hotlines (193 / 18555 / 192 / 112).
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
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  date: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  heading: {
    color: '#f59e0b',
    fontWeight: '800',
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  body: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
});
