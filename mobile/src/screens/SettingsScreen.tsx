import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [notifications, setNotifications] = useState(true);
  const [gpsHighAccuracy, setGpsHighAccuracy] = useState(true);
  const [emergencyBroadcasts, setEmergencyBroadcasts] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [offlineMaps, setOfflineMaps] = useState(false);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will free up temporary map tiles and thumbnail caches.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Now',
          style: 'destructive',
          onPress: () => Alert.alert('Cleaned', 'Cached temporary files cleared successfully.'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Top Bar ────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Icon name="back" size={18} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>App Settings</Text>
            <Text style={styles.headerSubtitle}>Permissions, Alerts & Telemetry Preferences</Text>
          </View>
        </View>

        {/* ── Group 1: Notifications & Broadcasts ────────────────────────────── */}
        <Text style={styles.groupHeading}>NOTIFICATIONS & ROAD ALERTS</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingSub}>
                Updates when Ghana MTTD verifies or resolves your reported incidents
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.primaryContainer }}
              thumbColor={notifications ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>High-Priority Highway Broadcasts</Text>
              <Text style={styles.settingSub}>
                Emergency traffic closures and major multi-vehicle accident warnings
              </Text>
            </View>
            <Switch
              value={emergencyBroadcasts}
              onValueChange={setEmergencyBroadcasts}
              trackColor={{ false: colors.border, true: colors.primaryContainer }}
              thumbColor={emergencyBroadcasts ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Flash Flood & Heavy Rain Advisories</Text>
              <Text style={styles.settingSub}>
                Severe weather warnings along coastal and low-lying road sectors
              </Text>
            </View>
            <Switch
              value={weatherAlerts}
              onValueChange={setWeatherAlerts}
              trackColor={{ false: colors.border, true: colors.primaryContainer }}
              thumbColor={weatherAlerts ? colors.primary : '#ffffff'}
            />
          </View>
        </View>

        {/* ── Group 2: GPS Telemetry & Permissions ───────────────────────────── */}
        <Text style={styles.groupHeading}>GPS & TELEMETRY PRECISION</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>High-Accuracy Road GPS</Text>
              <Text style={styles.settingSub}>
                Fine-grain meter coordinate precision when capturing accident spots
              </Text>
            </View>
            <Switch
              value={gpsHighAccuracy}
              onValueChange={setGpsHighAccuracy}
              trackColor={{ false: colors.border, true: colors.primaryContainer }}
              thumbColor={gpsHighAccuracy ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Offline Highway Map Caching</Text>
              <Text style={styles.settingSub}>
                Store regional road vectors for areas with weak cellular coverage
              </Text>
            </View>
            <Switch
              value={offlineMaps}
              onValueChange={setOfflineMaps}
              trackColor={{ false: colors.border, true: colors.primaryContainer }}
              thumbColor={offlineMaps ? colors.primary : '#ffffff'}
            />
          </View>
        </View>

        {/* ── Group 3: Storage & Maintenance ─────────────────────────────────── */}
        <Text style={styles.groupHeading}>DATA & STORAGE</Text>
        <View style={styles.settingCard}>
          <TouchableOpacity
            style={styles.settingActionRow}
            onPress={handleClearCache}
            activeOpacity={0.75}
          >
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Clear Temporary Map Cache</Text>
              <Text style={styles.settingSub}>Free up locally stored map tiles and photo data</Text>
            </View>
            <Icon name="chevron" size={14} color={colors.textSubtle} />
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    ...typography.headline,
    fontSize: 18,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSubtle,
    marginTop: 1,
  },

  // Headings
  groupHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSubtle,
    letterSpacing: 1,
    marginBottom: spacing.xs,
    marginLeft: 2,
    marginTop: spacing.sm,
  },

  // Setting Cards
  settingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.subtle,
  },
  settingRow: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: spacing.md,
  },
  settingActionRow: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingCopy: {
    flex: 1,
  },
  settingTitle: {
    ...typography.bodyStrong,
    fontSize: 13,
    color: colors.text,
  },
  settingSub: {
    ...typography.caption,
    color: colors.textSubtle,
    marginTop: 2,
    lineHeight: 16,
  },
});
