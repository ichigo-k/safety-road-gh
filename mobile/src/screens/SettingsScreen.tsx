import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [notifications, setNotifications] = useState(true);
  const [gpsLocation, setGpsLocation] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back to Profile</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Application Settings</Text>
        <Text style={styles.subtitle}>Manage push notification preferences & GPS location access permissions.</Text>

        <View style={styles.settingGroup}>
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Receive status updates when officers verify your reports</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#334155', true: '#f59e0b' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>GPS Auto-Location</Text>
              <Text style={styles.settingDesc}>Auto-detect GPS coordinates when reporting road incidents</Text>
            </View>
            <Switch
              value={gpsLocation}
              onValueChange={setGpsLocation}
              trackColor={{ false: '#334155', true: '#f59e0b' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>Emergency Broadcast Alerts</Text>
              <Text style={styles.settingDesc}>Receive high-priority traffic and flooding warnings</Text>
            </View>
            <Switch
              value={emergencyAlerts}
              onValueChange={setEmergencyAlerts}
              trackColor={{ false: '#334155', true: '#f59e0b' }}
            />
          </View>
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
    padding: 24,
  },
  backBtn: {
    marginBottom: 20,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 24,
  },
  settingGroup: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  settingItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  settingTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  settingDesc: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
    maxWidth: 220,
  },
});
