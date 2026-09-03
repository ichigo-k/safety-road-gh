import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { apiFetch } from '../services/api';
import { useArea } from '../services/area';
import Icon from '../components/Icon';
import { EmptyState, Screen, ScreenHeader, SearchField, SectionLabel, Surface } from '../components/ui';
import { colors, radius, spacing, typography } from '../theme';

interface AreaPickerScreenProps {
  onDone: () => void;
}

interface Place {
  id: string;
  name: string;
  address: string;
  municipality: string;
  latitude: number;
  longitude: number;
}

/** Somewhere to start before anyone types. */
const MAJOR_AREAS = [
  { name: 'Accra', label: 'Accra, Greater Accra', latitude: 5.6037, longitude: -0.187 },
  { name: 'Kumasi', label: 'Kumasi, Ashanti', latitude: 6.6885, longitude: -1.6244 },
  { name: 'Tamale', label: 'Tamale, Northern', latitude: 9.4008, longitude: -0.8393 },
  { name: 'Takoradi', label: 'Takoradi, Western', latitude: 4.8845, longitude: -1.7554 },
  { name: 'Cape Coast', label: 'Cape Coast, Central', latitude: 5.1315, longitude: -1.2795 },
  { name: 'Ho', label: 'Ho, Volta', latitude: 6.6008, longitude: 0.4713 },
];

export default function AreaPickerScreen({ onDone }: AreaPickerScreenProps) {
  const { area, setArea, useCurrentLocation } = useArea();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback((text: string) => {
    setQuery(text);
    setError('');
    if (timer.current) clearTimeout(timer.current);

    if (text.trim().length < 3) {
      setResults([]);
      return;
    }

    // Debounced: geocoding is billed per call and place names are short.
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiFetch(`/maps/search?q=${encodeURIComponent(text.trim())}`);
        setResults(Array.isArray(res.results) ? res.results : []);
      } catch {
        setError('Could not search. Check your connection.');
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const choose = (place: { name: string; label?: string; latitude: number; longitude: number; municipality?: string }) => {
    setArea({
      name: place.name,
      label: place.label ?? [place.name, place.municipality].filter(Boolean).join(', '),
      latitude: place.latitude,
      longitude: place.longitude,
    });
    onDone();
  };

  const detect = async () => {
    setLocating(true);
    setError('');
    const ok = await useCurrentLocation();
    setLocating(false);
    if (ok) onDone();
    else setError('Could not get your location. Check that GPS and permissions are on.');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title="Choose an area"
          subtitle="Incidents, alerts and stats will be shown for the area you pick"
          onBack={onDone}
        />

        {/* ── Use my location ──────────────────────────────────────────── */}
        <Pressable
          onPress={detect}
          disabled={locating}
          accessibilityRole="button"
          accessibilityLabel="Use my current location"
          style={({ pressed }) => [s.detect, pressed && { backgroundColor: colors.primaryContainer }]}
        >
          <View style={s.detectIcon}>
            {locating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon name="crosshair" size={20} color={colors.primary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.detectTitle}>Use my current location</Text>
            <Text style={s.detectCopy}>
              {area.source === 'auto' ? `Currently ${area.label}` : 'Detect where you are now'}
            </Text>
          </View>
          <Icon name="chevron" size={17} color={colors.primary} />
        </Pressable>

        <SearchField
          value={query}
          onChangeText={runSearch}
          placeholder="Search for a town or district"
          style={{ marginTop: spacing.lg }}
        />

        {searching ? (
          <View style={s.searchingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={s.searchingText}>Searching</Text>
          </View>
        ) : null}

        {error ? (
          <View style={s.error} accessibilityLiveRegion="polite">
            <Icon name="alert-circle" size={17} color={colors.danger} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Results ──────────────────────────────────────────────────── */}
        {results.length > 0 ? (
          <Surface style={s.section} padded={false}>
            {results.map((place, i) => (
              <Row
                key={place.id}
                title={place.name}
                detail={place.address}
                last={i === results.length - 1}
                onPress={() => choose(place)}
              />
            ))}
          </Surface>
        ) : query.trim().length >= 3 && !searching ? (
          <Surface style={s.section}>
            <EmptyState
              icon="search"
              title="No places found"
              description="Try a nearby town or a district name."
            />
          </Surface>
        ) : (
          <>
            <SectionLabel style={s.section}>Major areas</SectionLabel>
            <Surface padded={false}>
              {MAJOR_AREAS.map((m, i) => (
                <Row
                  key={m.name}
                  title={m.name}
                  detail={m.label}
                  selected={m.name === area.name}
                  last={i === MAJOR_AREAS.length - 1}
                  onPress={() => choose(m)}
                />
              ))}
            </Surface>
          </>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
}

function Row({
  title,
  detail,
  onPress,
  last,
  selected,
}: {
  title: string;
  detail?: string;
  onPress: () => void;
  last?: boolean;
  selected?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        s.row,
        last && { borderBottomWidth: 0 },
        pressed && { backgroundColor: colors.surfaceMuted },
      ]}
    >
      <Icon name="location" size={18} color={colors.textSubtle} />
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        {detail ? (
          <Text style={s.rowDetail} numberOfLines={1}>
            {detail}
          </Text>
        ) : null}
      </View>
      {selected ? <Icon name="check" size={18} color={colors.primary} /> : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },

  detect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
  },
  detectIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectTitle: { fontSize: 15.5, fontWeight: '600', color: colors.primaryDark },
  detectCopy: { fontSize: 13, color: colors.primaryDark, opacity: 0.8, marginTop: 1 },

  searchingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.md },
  searchingText: { ...typography.micro },

  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerLight,
    marginTop: spacing.md,
  },
  errorText: { flex: 1, fontSize: 14, color: colors.dangerDark, lineHeight: 19 },

  section: { marginTop: spacing.xl },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowTitle: { fontSize: 15.5, fontWeight: '500', color: colors.text, letterSpacing: -0.2 },
  rowDetail: { ...typography.micro, marginTop: 1 },
});
