import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { getUserData, removeAuthToken } from '../services/api';

interface ProfileScreenProps {
  onLogout: () => void;
}

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await getUserData();
    if (data) setUser(data);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Safety Road GH?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await removeAuthToken();
          onLogout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Account & Settings</Text>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Citizen User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@safetyroad.gov.gh'}</Text>
            <Text style={styles.userRole}>ROLE: {user?.role || 'CITIZEN'}</Text>
          </View>
        </View>

        {/* System Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & System Information</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>About Safety Road GH</Text>
            <Text style={styles.infoDesc}>
              Safety Road GH is a mobile road-safety and accident-reporting system for Ghana. Designed to allow authenticated citizens to report road accidents/hazards with GPS coordinates and photographic evidence to the National Road Safety Authority and MTTD.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Privacy Policy & Terms</Text>
            <Text style={styles.infoDesc}>
              All submitted GPS coordinates and photographic evidence are transmitted securely over SSL to our encrypted backend server and stored for official verification and emergency dispatch.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out of Account</Text>
        </TouchableOpacity>
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
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  userRole: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 6,
  },
  infoDesc: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '900',
    fontSize: 14,
  },
});
