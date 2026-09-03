import React, { useState, useEffect } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { apiFetch } from '../services/api';
import Icon from '../components/Icon';
import {
  EmptyState,
  FilterChips,
  Screen,
  ScreenHeader,
  SectionLabel,
  SkeletonCard,
  SkeletonGroup,
  Surface,
} from '../components/ui';
import { colors, radius, spacing, typography } from '../theme';

interface EmergencyScreenProps {
  onBack?: () => void;
}

type Category = 'ALL' | 'HOSPITAL' | 'POLICE' | 'FIRE_AMBULANCE';

// Ghana national emergency lines. Ordered by how often a road user needs them.
const HOTLINES = [
  { key: 'ambulance', icon: 'ambulance', label: 'Ambulance', dial: '193', alt: '112' },
  { key: 'police', icon: 'police', label: 'Police MTTD', dial: '18555', alt: '191' },
  { key: 'fire', icon: 'fire', label: 'Fire service', dial: '192', alt: '112' },
];

export default function EmergencyScreen({ onBack }: EmergencyScreenProps) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>('ALL');

  useEffect(() => {
    fetchEmergencyServices();
  }, []);

  const fetchEmergencyServices = async () => {
    try {
      const res = await apiFetch('/emergency-services');
      if (res.services) setServices(res.services);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const call = (phone: string) => Linking.openURL(`tel:${phone}`);

  const filtered = services.filter((x) => category === 'ALL' || x.category === category);

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Emergency"
          subtitle="National lines answer 24 hours and are free to call"
          onBack={onBack}
        />

        {/* ── National lines ───────────────────────────────────────────────
            Three full-width rows rather than three small tiles. Under stress
            the target should be as large as the screen allows, and the number
            has to be readable without focusing. */}
        <Surface padded={false}>
          {HOTLINES.map((h, i) => (
            <Pressable
              key={h.key}
              onPress={() => call(h.dial)}
              accessibilityRole="button"
              accessibilityLabel={`Call ${h.label} on ${h.dial}`}
              style={({ pressed }) => [
                s.hotline,
                i === HOTLINES.length - 1 && { borderBottomWidth: 0 },
                pressed && { backgroundColor: colors.surfaceMuted },
              ]}
            >
              <View style={s.hotlineIcon}>
                <Icon name={h.icon} size={22} color={colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.hotlineLabel}>{h.label}</Text>
                <Text style={s.hotlineAlt}>or {h.alt}</Text>
              </View>
              <Text style={s.hotlineDial}>{h.dial}</Text>
              <Icon name="phone-filled" size={19} color={colors.danger} />
            </Pressable>
          ))}
        </Surface>

        {/* ── Directory ──────────────────────────────────────────────────── */}
        <SectionLabel style={s.section}>Stations and hospitals</SectionLabel>

        <FilterChips<Category>
          items={[
            { id: 'ALL', label: 'All' },
            { id: 'HOSPITAL', label: 'Hospitals' },
            { id: 'POLICE', label: 'Police' },
            { id: 'FIRE_AMBULANCE', label: 'Fire and ambulance' },
          ]}
          value={category}
          onChange={setCategory}
          style={s.chips}
        />

        {loading ? (
          <SkeletonGroup>
            <SkeletonCard />
            <SkeletonCard />
          </SkeletonGroup>
        ) : filtered.length === 0 ? (
          <Surface>
            <EmptyState
              icon="hospital"
              title="No stations listed"
              description="Nothing in this category yet. Try another filter."
            />
          </Surface>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {filtered.map((service) => (
              <Surface key={service.id}>
                <Text style={s.serviceName}>{service.name}</Text>
                <Text style={s.serviceMeta}>
                  {(service.category || 'Service').toString().replace('_', ' and ').toLowerCase()} ·{' '}
                  {service.region || 'Greater Accra'}
                </Text>

                {service.address ? (
                  <View style={s.addressRow}>
                    <Icon name="location" size={15} color={colors.textDisabled} />
                    <Text style={s.addressText}>{service.address}</Text>
                  </View>
                ) : null}

                <View style={s.callRow}>
                  <Pressable
                    onPress={() => call(service.phone)}
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${service.name} on ${service.phone}`}
                    style={({ pressed }) => [s.callBtn, pressed && { opacity: 0.85 }]}
                  >
                    <Icon name="phone-filled" size={17} color="#FFFFFF" />
                    <Text style={s.callBtnText}>{service.phone}</Text>
                  </Pressable>

                  {service.altPhone ? (
                    <Pressable
                      onPress={() => call(service.altPhone)}
                      accessibilityRole="button"
                      accessibilityLabel={`Call alternate number ${service.altPhone}`}
                      style={({ pressed }) => [s.altBtn, pressed && { opacity: 0.7 }]}
                    >
                      <Text style={s.altBtnText}>{service.altPhone}</Text>
                    </Pressable>
                  ) : null}
                </View>
              </Surface>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },

  hotline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 68,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  hotlineIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotlineLabel: { fontSize: 16, fontWeight: '600', color: colors.text, letterSpacing: -0.2 },
  hotlineAlt: { ...typography.micro, marginTop: 1 },
  hotlineDial: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.danger,
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },

  section: { marginTop: spacing.xxl },
  chips: { marginBottom: spacing.lg, marginHorizontal: -spacing.xl, paddingLeft: spacing.xl },

  serviceName: { ...typography.title },
  serviceMeta: { ...typography.micro, marginTop: 2, textTransform: 'capitalize' },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: spacing.md,
  },
  addressText: { flex: 1, ...typography.callout, lineHeight: 19 },

  callRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: colors.danger,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '600',
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'],
  },
  altBtn: {
    height: 46,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  altBtnText: {
    color: colors.textMuted,
    fontSize: 14.5,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
});
