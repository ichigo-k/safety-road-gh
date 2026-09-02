import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { apiFetch } from '../services/api';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface SafetyTipsScreenProps {
  onSelectTip?: (tip: any) => void;
  onBack?: () => void;
}

export default function SafetyTipsScreen({ onSelectTip, onBack }: SafetyTipsScreenProps) {
  const [tips, setTips] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('DRIVER');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const res = await apiFetch('/safety-tips');
      if (res.tips) setTips(res.tips);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTips = tips.filter((t) => t.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Icon name="back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Road Safety Guides</Text>
            <Text style={styles.headerSubtitle}>
              National Road Safety Authority (NRSA) & MTTD Guidelines
            </Text>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabGrid}>
          {[
            { id: 'DRIVER', label: 'Drivers', icon: 'car' },
            { id: 'MOTORCYCLIST', label: 'Riders', icon: 'motorcycle' },
            { id: 'PEDESTRIAN', label: 'Pedestrians', icon: 'walk' },
            { id: 'PASSENGER', label: 'Passengers', icon: 'bus' },
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.75}
              >
                <Icon
                  name={cat.icon}
                  size={16}
                  color={isActive ? colors.primaryDark : colors.textSecondary}
                />
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tips List */}
        {loading ? (
          <View style={styles.centerWrap}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Loading safety articles...</Text>
          </View>
        ) : filteredTips.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No guides found in this category.</Text>
          </View>
        ) : (
          filteredTips.map((tip) => (
            <TouchableOpacity
              key={tip.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => onSelectTip?.(tip)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{tip.category} GUIDE</Text>
                </View>
              </View>
              <Text style={styles.title}>{tip.title}</Text>
              <Text numberOfLines={3} style={styles.content}>
                {tip.content}
              </Text>
              <View style={styles.readMoreRow}>
                <Text style={styles.readMoreText}>Read full guideline</Text>
                <Icon name="chevron" size={14} color={colors.googleBlue} />
              </View>
            </TouchableOpacity>
          ))
        )}

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
  tabGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 11,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  activeTab: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  activeTabText: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardHeader: {
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.title,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  content: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.googleBlue,
  },
  centerWrap: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  emptyBox: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
