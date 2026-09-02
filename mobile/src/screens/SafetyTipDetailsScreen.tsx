import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface SafetyTipDetailsScreenProps {
  tip: any;
  onBack: () => void;
}

export default function SafetyTipDetailsScreen({ tip, onBack }: SafetyTipDetailsScreenProps) {
  if (!tip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Icon name="back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safety Guide</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No guide selected.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Icon name="back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Driver Safety Guide</Text>
            <Text style={styles.headerSubtitle}>
              National Road Safety Authority (NRSA) Publication
            </Text>
          </View>
        </View>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{tip.category} SAFETY MANUAL</Text>
        </View>

        <Text style={styles.title}>{tip.title}</Text>
        <Text style={styles.date}>Verified for Ghana Highway Compliance</Text>

        <View style={styles.contentCard}>
          <Text style={styles.contentText}>{tip.content}</Text>
        </View>

        <View style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <Icon name="shield" size={16} color={colors.primary} />
            <Text style={styles.reminderTitle}>Citizen Safety Pledge</Text>
          </View>
          <Text style={styles.reminderText}>
            Road safety is a shared responsibility across Ghana. Always wear seatbelts, obey speed limits, stay vigilant in wet conditions, and report hazards promptly.
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 38,
    height: 38,
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
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.lg,
  },
  contentCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  contentText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  reminderCard: {
    backgroundColor: colors.primaryLight,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryContainer,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  reminderTitle: {
    ...typography.title,
    fontSize: 14,
    color: colors.primaryDark,
  },
  reminderText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  emptyWrap: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
