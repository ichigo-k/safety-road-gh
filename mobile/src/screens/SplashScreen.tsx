import React, { useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import Icon from '../components/Icon';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.content}>
        <View style={styles.logoBadge}>
          <Icon name="shield" size={44} color="#f59e0b" />
        </View>
        <Text style={styles.title}>SAFETY ROAD GH</Text>
        <Text style={styles.subtitle}>Ghana National Road Accident & Hazard Network</Text>

        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Initializing emergency services...</Text>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 2,
    borderColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
  },
  loaderBox: {
    marginTop: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 12,
    fontWeight: '600',
  },
});
