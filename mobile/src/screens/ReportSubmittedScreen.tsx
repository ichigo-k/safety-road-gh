import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface ReportSubmittedScreenProps {
  onGoToTracking: () => void;
  onGoHome: () => void;
}

export default function ReportSubmittedScreen({
  onGoToTracking,
  onGoHome,
}: ReportSubmittedScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon name="check" size={38} color={colors.primary} />
        </View>

        <Text style={styles.title}>Incident Transmitted</Text>
        <Text style={styles.subtitle}>
          Your report has been logged and transmitted to Ghana MTTD Command Center and added to the
          live road radar.
        </Text>

        <View style={styles.refCard}>
          <Text style={styles.refLabel}>REFERENCE</Text>
          <Text style={styles.refCode}>QUEUED FOR VERIFICATION</Text>
          <Text style={styles.refHint}>
            You can track real-time verification and officer dispatch in the Reports tab.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onGoToTracking}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Track Report Status</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onGoHome} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>Return to Home Radar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
    maxWidth: 320,
  },
  refCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  refLabel: {
    ...typography.label,
    color: colors.textTertiary,
    marginBottom: 6,
  },
  refCode: {
    ...typography.title,
    fontSize: 15,
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  refHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: radius.md,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
});
