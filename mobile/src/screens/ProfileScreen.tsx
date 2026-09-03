import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getUserData, removeAuthToken, removeUserData } from '../services/api';
import { clearHotspotCache } from '../services/hotspotStore';
import { confirm } from '../services/confirm';
import Icon from '../components/Icon';
import { Avatar, ListRow, Screen, SectionLabel, Surface } from '../components/ui';
import { colors, radius, spacing, typography } from '../theme';

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

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Sign out',
      message: 'You will need to sign in again to file or track reports.',
      confirmLabel: 'Sign out',
      destructive: true,
    });
    if (!ok) return;

    // Clear cached road data too: the next person to sign in on this device
    // should not inherit the previous user's cached hotspots or alert history.
    await Promise.all([removeAuthToken(), removeUserData(), clearHotspotCache()]);
    onLogout();
  };

  const displayName = user?.name || user?.full_name || 'Your account';
  const displayEmail = user?.email || '';

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.pageTitle}>Account</Text>

        {/* ── Identity ─────────────────────────────────────────────────────
            A quiet header on the page tone. The old dark panel read as a
            different app pasted into this one. */}
        <View style={s.identity}>
          <Avatar name={displayName} size={56} />
          <View style={s.identityCopy}>
            <Text style={s.name} numberOfLines={1}>
              {displayName}
            </Text>
            {displayEmail ? (
              <Text style={s.email} numberOfLines={1}>
                {displayEmail}
              </Text>
            ) : null}
            <View style={s.verified}>
              <Icon name="check-badge" size={14} color={colors.success} />
              <Text style={s.verifiedText}>Verified reporter</Text>
            </View>
          </View>
          <Pressable
            onPress={() => onNavigate('EDIT_PROFILE')}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            style={({ pressed }) => [s.editBtn, pressed && { backgroundColor: colors.surfaceHighlight }]}
          >
            <Text style={s.editBtnText}>Edit</Text>
          </Pressable>
        </View>

        {/* ── Groups ─────────────────────────────────────────────────────── */}
        <SectionLabel style={s.section}>Account and security</SectionLabel>
        <Surface padded={false}>
          <ListRow
            icon="user"
            label="Personal details"
            detail="Name and phone number"
            onPress={() => onNavigate('EDIT_PROFILE')}
          />
          <ListRow
            icon="lock"
            label="Change password"
            detail="Update your sign-in password"
            onPress={() => onNavigate('CHANGE_PASSWORD')}
            last
          />
        </Surface>

        <SectionLabel style={s.section}>Preferences</SectionLabel>
        <Surface padded={false}>
          <ListRow
            icon="settings"
            label="Notifications and GPS"
            detail="What you get alerted about"
            onPress={() => onNavigate('SETTINGS')}
          />
          <ListRow
            icon="help"
            label="Help and support"
            detail="Common questions and contacts"
            onPress={() => onNavigate('HELP_SUPPORT')}
            last
          />
        </Surface>

        <SectionLabel style={s.section}>About</SectionLabel>
        <Surface padded={false}>
          <ListRow icon="info" label="About Safety Road" onPress={() => onNavigate('ABOUT')} />
          <ListRow
            icon="shield"
            label="Privacy policy"
            onPress={() => onNavigate('PRIVACY_POLICY')}
          />
          <ListRow
            icon="document"
            label="Terms and conditions"
            onPress={() => onNavigate('TERMS_CONDITIONS')}
            last
          />
        </Surface>

        {/* ── Sign out ───────────────────────────────────────────────────── */}
        <Surface style={s.section} padded={false}>
          <ListRow icon="logout" label="Sign out" danger onPress={handleLogout} right={null} last />
        </Surface>

        <Text style={s.version}>Safety Road Ghana · version 1.0.0</Text>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  pageTitle: { ...typography.display, marginBottom: spacing.xl },

  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  identityCopy: { flex: 1 },
  name: { fontSize: 18, fontWeight: '600', color: colors.text, letterSpacing: -0.4 },
  email: { ...typography.caption, marginTop: 1 },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  verifiedText: { fontSize: 13, fontWeight: '500', color: colors.success },
  editBtn: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: { fontSize: 14, fontWeight: '600', color: colors.text },

  section: { marginTop: spacing.xxl },

  version: {
    ...typography.micro,
    color: colors.textDisabled,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
