import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { apiFetch, saveAuthToken, saveUserData } from '../services/api';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (loading) return;
    setErrorMessage('');
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Missing Fields', 'Please complete all required fields to continue.');
      return;
    }
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin
        ? { email: email.trim(), password }
        : { name: name.trim(), email: email.trim(), password, phone: phone.trim(), role: 'CITIZEN' };
      const res = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
      await saveAuthToken(res.token);
      await saveUserData(res.user);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Check your credentials or internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* ── Brand Hero ─────────────────────────────────────────────── */}
        <View style={styles.brandSection}>
          <View style={styles.brandMark}>
            <Icon name="shield" size={34} color="#ffffff" />
          </View>
          <Text style={styles.appName}>Safety Road GH</Text>
          <Text style={styles.appRegion}>Ghana Road Safety & Citizen Radar</Text>
        </View>

        {/* ── Tab Switcher ───────────────────────────────────────────── */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabOption, isLogin && styles.tabOptionActive]}
            onPress={() => setIsLogin(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabOptionText, isLogin && styles.tabOptionTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabOption, !isLogin && styles.tabOptionActive]}
            onPress={() => setIsLogin(false)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabOptionText, !isLogin && styles.tabOptionTextActive]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Fields Card ────────────────────────────────────────────── */}
        <View style={styles.card}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Kwame Mensah"
                placeholderTextColor={colors.textDisabled}
                value={name}
                onChangeText={setName}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="user@example.com"
              placeholderTextColor={colors.textDisabled}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>GHANA MOBILE NUMBER</Text>
              <TextInput
                style={styles.input}
                placeholder="+233 24 123 4567"
                placeholderTextColor={colors.textDisabled}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textDisabled}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Icon name="alerts" size={16} color={colors.googleRed} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isLogin ? 'Sign In to Citizen Radar' : 'Join Safety Road Ghana'}
              </Text>
            )}
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    minHeight: '100%',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  appName: {
    ...typography.display,
    fontSize: 24,
    color: colors.textPrimary,
  },
  appRegion: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.lg,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tabOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  tabOptionActive: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  tabOptionText: {
    ...typography.bodyStrong,
    fontSize: 13,
    color: colors.textTertiary,
  },
  tabOptionTextActive: {
    color: colors.primaryDark,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textTertiary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.googleRedLight,
    borderWidth: 1,
    borderColor: colors.googleRedLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.md,
  },
  errorText: {
    flex: 1,
    color: colors.googleRed,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    ...shadows.card,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
