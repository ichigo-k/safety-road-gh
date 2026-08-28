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
import Icon from '../components/Icon';

interface ProfileScreenProps {
  onLogout: () => void;
  onNavigate: (screen: 'EDIT_PROFILE' | 'CHANGE_PASSWORD' | 'SETTINGS' | 'HELP_SUPPORT' | 'ABOUT' | 'PRIVACY_POLICY' | 'TERMS_CONDITIONS') => void;
}

export default function ProfileScreen({ onLogout, onNavigate }: ProfileScreenProps) {
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
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Account</Text>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Citizen User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@safetyroad.gov.gh'}</Text>
          </View>
        </View>

        <MenuSection title="Account">
          <MenuRow icon="profile" label="Edit profile" onPress={() => onNavigate('EDIT_PROFILE')} />
          <MenuRow icon="shield" label="Change password" onPress={() => onNavigate('CHANGE_PASSWORD')} />
        </MenuSection>
        <MenuSection title="App">
          <MenuRow icon="settings" label="Settings" onPress={() => onNavigate('SETTINGS')} />
          <MenuRow icon="help" label="Help & support" onPress={() => onNavigate('HELP_SUPPORT')} />
        </MenuSection>
        <MenuSection title="About">
          <MenuRow icon="info" label="About Safety Road GH" onPress={() => onNavigate('ABOUT')} />
          <MenuRow icon="shield" label="Privacy policy" onPress={() => onNavigate('PRIVACY_POLICY')} />
          <MenuRow icon="reports" label="Terms & conditions" onPress={() => onNavigate('TERMS_CONDITIONS')} />
        </MenuSection>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="logout" size={17} color="#b42318" /><Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#172b4d',
    marginBottom: 20,
  },
  userCard: {
    paddingVertical: 4,
    marginBottom: 28,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#172b4d',
    fontSize: 24,
    fontWeight: '800',
  },
  userEmail: {
    color: '#667085',
    fontSize: 14,
    marginTop: 5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#667085',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e4e7ec',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTitle: {
    color: '#172b4d',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 6,
  },
  infoDesc: {
    color: '#667085',
    fontSize: 12,
    lineHeight: 18,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4e7ec',
    overflow: 'hidden',
  },
  menuRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  menuLabel: {
    flex: 1,
    color: '#172b4d',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: '#fff1f0',
    borderWidth: 1,
    borderColor: '#fecdca',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  logoutText: {
    color: '#b42318',
    fontWeight: '900',
    fontSize: 14,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#eaf3fb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
});

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.menuCard}>{children}</View></View>;
}

function MenuRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}><View style={styles.rowIcon}><Icon name={icon} size={17} color="#667085" /></View><Text style={styles.menuLabel}>{label}</Text><Icon name="chevron" size={17} color="#98a2b3" /></TouchableOpacity>;
}
