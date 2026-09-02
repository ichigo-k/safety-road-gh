import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getUserData, removeAuthToken } from '../services/api';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface ProfileScreenProps {
  onLogout: () => void;
  onNavigate: (
    screen:
      | 'EDIT_PROFILE'
      | 'CHANGE_PASSWORD'
      | 'SETTINGS'
      | 'HELP_SUPPORT'
      | 'ABOUT'
      | 'PRIVACY_POLICY'
      | 'TERMS_CONDITIONS'
  ) => void;
}

export default function ProfileScreen({ onLogout, onNavigate }: ProfileScreenProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getUserData().then((data) => data && setUser(data));
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out of Safety Road Ghana?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await removeAuthToken();
            onLogout();
          },
        },
      ]
    );
  };

  const displayName = user?.name || user?.full_name || 'Citizen User';
  const displayEmail = user?.email || 'citizen@safetyroad.gov.gh';
  const initials = displayName
    .split(' ')
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Account</Text>
            <Text style={styles.headerSubtitle}>Safety Road Ghana</Text>
          </View>
        </View>

        {/* ── Profile Hero Card ─────────────────────────────────────────────── */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.verifiedBadge}>
                <Icon name="check" size={11} color={colors.primary} />
                <Text style={styles.verifiedText}>Verified Account</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onNavigate('EDIT_PROFILE')}
            activeOpacity={0.8}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── Settings Sections ─────────────────────────────────────────────── */}
        <MenuSection title="Account & Security">
          <MenuRow
            icon="profile"
            label="Personal Details"
            detail="Name and phone number"
            onPress={() => onNavigate('EDIT_PROFILE')}
          />
          <MenuRow
            icon="shield"
            label="Change Password"
            detail="Update sign-in password"
            onPress={() => onNavigate('CHANGE_PASSWORD')}
          />
        </MenuSection>

        <MenuSection title="Preferences">
          <MenuRow
            icon="settings"
            label="App Settings"
            detail="Notifications and GPS"
            onPress={() => onNavigate('SETTINGS')}
          />
          <MenuRow
            icon="help"
            label="Help & Support"
            detail="FAQs and contacts"
            onPress={() => onNavigate('HELP_SUPPORT')}
          />
        </MenuSection>

        <MenuSection title="Information">
          <MenuRow
            icon="info"
            label="About Safety Road"
            onPress={() => onNavigate('ABOUT')}
          />
          <MenuRow
            icon="shield"
            label="Privacy Policy"
            onPress={() => onNavigate('PRIVACY_POLICY')}
          />
          <MenuRow
            icon="reports"
            label="Terms & Conditions"
            onPress={() => onNavigate('TERMS_CONDITIONS')}
          />
        </MenuSection>

        {/* ── Sign Out ──────────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Icon name="logout" size={16} color={colors.danger} />
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>
          Safety Road GH · Version 1.0.0
        </Text>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.menuCard}>{children}</View>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  detail,
  onPress,
}: {
  icon: string;
  label: string;
  detail?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.75} style={styles.row} onPress={onPress}>
      <View style={styles.rowIcon}>
        <Icon name={icon} size={16} color={colors.primary} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        {detail && <Text style={styles.rowDetail}>{detail}</Text>}
      </View>
      <Icon name="chevron" size={14} color={colors.textDisabled} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.headline,
    fontSize: 22,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSubtle,
    marginTop: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  profileCopy: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    ...typography.title,
    fontSize: 15,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textSubtle,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  editBtn: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: colors.surfaceMuted,
  },
  editBtnText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSubtle,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  menuCard: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginRight: spacing.md,
  },
  rowCopy: {
    flex: 1,
  },
  rowLabel: {
    ...typography.bodyStrong,
    fontSize: 13,
  },
  rowDetail: {
    ...typography.caption,
    color: colors.textSubtle,
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.md,
    paddingVertical: 13,
    backgroundColor: colors.dangerLight,
    marginTop: spacing.md,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  versionText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textDisabled,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
