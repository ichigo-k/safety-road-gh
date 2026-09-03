import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { apiFetch, saveAuthToken, saveUserData } from '../services/api';
import Icon from '../components/Icon';
import { Button, Screen } from '../components/ui';
import { colors, radius, spacing, typography } from '../theme';

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
  onForgotPassword?: () => void;
}

export default function AuthScreen({ onLoginSuccess, onForgotPassword }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const switchMode = (login: boolean) => {
    setIsLogin(login);
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    if (loading) return;
    setErrorMessage('');
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Missing details', 'Please complete every field before continuing.');
      return;
    }
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin
        ? { email: email.trim(), password }
        : {
            name: name.trim(),
            email: email.trim(),
            password,
            phone: phone.trim(),
            role: 'CITIZEN',
          };
      const res = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
      await saveAuthToken(res.token);
      await saveUserData(res.user);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'We could not sign you in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Brand ──────────────────────────────────────────────────────
              Left-aligned and on the page tone. No dark hero panel, no
              centred logo-over-gradient. */}
          <Text style={s.title}>
            {isLogin ? 'Sign in to Safety Road' : 'Create your account'}
          </Text>
          <Text style={s.subtitle}>
            {isLogin
              ? 'Report accidents and hazards on Ghana roads, and track what happens to them.'
              : 'Reports are tied to your account so the MTTD can follow up and verify them.'}
          </Text>

          {/* ── Mode switch ────────────────────────────────────────────────
              Plain text tabs with an underline. A segmented pill would be
              another rounded control competing with the fields below. */}
          <View style={s.tabs}>
            <ModeTab label="Sign in" active={isLogin} onPress={() => switchMode(true)} />
            <ModeTab label="Create account" active={!isLogin} onPress={() => switchMode(false)} />
          </View>

          {/* ── Fields ─────────────────────────────────────────────────── */}
          {!isLogin ? (
            <InputRow
              label="Full name"
              placeholder="Kwame Mensah"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              textContentType="name"
            />
          ) : null}

          <InputRow
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
          />

          {!isLogin ? (
            <InputRow
              label="Mobile number"
              placeholder="+233 24 123 4567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
            />
          ) : null}

          <InputRow
            label="Password"
            placeholder={isLogin ? 'Your password' : 'At least 8 characters'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            trailing={
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={19}
                  color={colors.textSubtle}
                />
              </Pressable>
            }
          />

          {isLogin && onForgotPassword ? (
            <Pressable
              onPress={onForgotPassword}
              hitSlop={10}
              accessibilityRole="button"
              style={s.forgot}
            >
              <Text style={s.forgotText}>Forgot your password?</Text>
            </Pressable>
          ) : null}

          {errorMessage ? (
            <View style={s.error} accessibilityLiveRegion="polite">
              <Icon name="alert-circle" size={18} color={colors.danger} />
              <Text style={s.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Button
            label={isLogin ? 'Sign in' : 'Create account'}
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            full
            style={{ marginTop: spacing.sm }}
          />

          <Text style={s.legal}>
            By continuing you accept the Safety Road Ghana terms and privacy policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function ModeTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={[s.tab, active && s.tabActive]}
    >
      <Text style={[s.tabText, active && s.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function InputRow({
  label,
  trailing,
  ...inputProps
}: {
  label: string;
  trailing?: React.ReactNode;
} & React.ComponentProps<typeof TextInput>) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={[s.inputWrap, focused && s.inputWrapFocused]}>
        <TextInput
          style={s.input}
          placeholderTextColor={colors.textDisabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          {...inputProps}
        />
        {trailing}
      </View>
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },

  title: { ...typography.display, fontSize: 27, lineHeight: 32 },
  subtitle: {
    ...typography.callout,
    color: colors.textSubtle,
    marginTop: spacing.sm,
    maxWidth: 320,
  },

  tabs: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: { paddingBottom: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 15, fontWeight: '500', color: colors.textSubtle },
  tabTextActive: { color: colors.text, fontWeight: '600' },

  field: { marginBottom: spacing.lg },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputWrapFocused: { borderColor: colors.primary },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },

  forgot: { alignSelf: 'flex-start', marginTop: -spacing.xs, marginBottom: spacing.lg },
  forgotText: { fontSize: 14, fontWeight: '500', color: colors.primary },

  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerLight,
    marginBottom: spacing.lg,
  },
  errorText: { flex: 1, fontSize: 14, color: colors.dangerDark, lineHeight: 19 },

  legal: {
    ...typography.micro,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
});
