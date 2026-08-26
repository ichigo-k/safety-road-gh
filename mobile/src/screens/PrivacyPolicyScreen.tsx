import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

export default function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back to Profile</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.date}>Effective Date: August 2026</Text>

        <View style={styles.card}>
          <Text style={styles.heading}>1. Data Collection</Text>
          <Text style={styles.body}>
            Safety Road GH collects user registration details (name, email, phone number) and incident data (latitude/longitude GPS coordinates, hazard categories, and photograph evidence) solely for the purpose of road safety verification and emergency dispatch.
          </Text>

          <Text style={styles.heading}>2. Use of Location Information</Text>
          <Text style={styles.body}>
            GPS location data is only accessed when you explicitly request location auto-detection during accident or hazard report creation.
          </Text>

          <Text style={styles.heading}>3. Data Security</Text>
          <Text style={styles.body}>
            All transmissions between the Safety Road GH mobile app and our REST API are encrypted via SSL/TLS protocols and stored securely in PostgreSQL database clusters.
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
