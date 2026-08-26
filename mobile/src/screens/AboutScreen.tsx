import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';

interface AboutScreenProps {
  onBack: () => void;
}

export default function AboutScreen({ onBack }: AboutScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back to Profile</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>🇬🇭</Text>
          </View>
          <Text style={styles.title}>SAFETY ROAD GH</Text>
          <Text style={styles.version}>Version 1.0.0 (Expo SDK 54)</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Executive Overview</Text>
          <Text style={styles.cardText}>
            Safety Road GH is a mobile road-safety and accident-reporting system designed specifically for Ghana. It empowers authenticated citizens to report road accidents, potholes, flooding, and dangerous traffic hazards with precise GPS coordinates and photographic evidence.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Core Project Goals</Text>
          <Text style={styles.cardText}>
            - Empower citizens with rapid road incident reporting tools.{'\n'}
            - Provide immediate single-tap calling to Ambulance (193), Police (18555), and Fire (192).{'\n'}
            - Broadcast active traffic & emergency road warnings directly from MTTD Command.{'\n'}
            - Educate commercial and private road users with categorized safety guides.
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  version: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '700',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 8,
  },
  cardText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
});
