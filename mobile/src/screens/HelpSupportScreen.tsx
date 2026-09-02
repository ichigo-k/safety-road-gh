import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Linking,
  TextInput,
} from 'react-native';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface HelpSupportScreenProps {
  onBack: () => void;
}

interface FAQItem {
  id: string;
  q: string;
  a: string;
  category: string;
}

export default function HelpSupportScreen({ onBack }: HelpSupportScreenProps) {
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const [searchQuery, setSearchQuery] = useState('');

  const faqs: FAQItem[] = [
    {
      id: '1',
      category: 'REPORTING',
      q: 'How do I submit an accident or hazard report?',
      a: 'Tap either "Report Accident" or "Report Road Hazard" on the home screen. Fill in the incident title, describe the scene, confirm your GPS coordinates, snap photographic evidence, and tap Submit.',
    },
    {
      id: '2',
      category: 'VERIFICATION',
      q: 'Who verifies my submitted incident reports?',
      a: 'Reports are routed to the Ghana Police Service (MTTD) Command Center. On-duty traffic patrol officers verify the telemetry and update the status from "Transmitted" to "Verified" and "Resolved".',
    },
    {
      id: '3',
      category: 'EMERGENCY',
      q: 'What should I do during a critical life-threatening emergency?',
      a: 'In severe accidents with injuries, immediately dial the National Ambulance Service on 193 or Ghana Police MTTD on 18555 / 112 directly. You can also use the emergency directory in the app.',
    },
    {
      id: '4',
      category: 'GPS',
      q: 'Why does the app need GPS location access?',
      a: 'GPS telemetry pinpoints exact road coordinates (e.g. N1 Highway near Achimota Overhead), enabling rapid officer dispatch and accurate hazard mapping for other motorists.',
    },
    {
      id: '5',
      category: 'PRIVACY',
      q: 'Is my personal phone number shared publicly?',
      a: 'No. Your phone number is only used for citizen account verification and private communication with verified MTTD dispatchers if clarification is needed regarding an active emergency.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSubtitle}>Citizen Assistance & FAQs</Text>
          </View>
        </View>

        {/* ── Direct Support Channels ─────────────────────────────────────────── */}
        <View style={styles.channelsGrid}>
          <TouchableOpacity
            style={styles.channelTile}
            onPress={() => Linking.openURL('tel:18555')}
            activeOpacity={0.8}
          >
            <View style={[styles.channelIcon, { backgroundColor: colors.primaryLight }]}>
              <Icon name="phone" size={16} color={colors.primary} />
            </View>
            <Text style={styles.channelTitle}>MTTD Hotline</Text>
            <Text style={styles.channelValue}>18555</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.channelTile}
            onPress={() => Linking.openURL('mailto:support@safetyroad.gov.gh')}
            activeOpacity={0.8}
          >
            <View style={[styles.channelIcon, { backgroundColor: colors.accentLight }]}>
              <Icon name="alerts" size={16} color={colors.accent} />
            </View>
            <Text style={styles.channelTitle}>Email Desk</Text>
            <Text style={styles.channelValue}>Email Support</Text>
          </TouchableOpacity>
        </View>

        {/* ── Search FAQs ─────────────────────────────────────────────────────── */}
        <View style={styles.searchBar}>
          <Icon name="search" size={16} color={colors.textSubtle} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search FAQs (GPS, verification, emergency...)"
            placeholderTextColor={colors.textDisabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.sectionHeading}>FREQUENTLY ASKED QUESTIONS</Text>

        {/* ── FAQ Accordion List ──────────────────────────────────────────────── */}
        <View style={styles.faqList}>
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqCard}
                activeOpacity={0.85}
                onPress={() => toggleExpand(faq.id)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <View style={styles.faqChevron}>
                    <Icon
                      name={isExpanded ? 'chevron' : 'chevron'}
                      size={14}
                      color={colors.textSubtle}
                    />
                  </View>
                </View>
                {isExpanded && (
                  <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{faq.a}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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

  // Direct Channels
  channelsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  channelTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  channelIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  channelTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSubtle,
  },
  channelValue: {
    ...typography.bodyStrong,
    fontSize: 13,
    color: colors.text,
    marginTop: 1,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    padding: 0,
  },

  // Section Heading
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSubtle,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: 2,
  },

  // FAQ List
  faqList: {
    gap: spacing.sm,
  },
  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  faqQuestion: {
    ...typography.bodyStrong,
    fontSize: 13,
    color: colors.text,
    flex: 1,
    lineHeight: 18,
  },
  faqChevron: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqBody: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  faqAnswer: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
