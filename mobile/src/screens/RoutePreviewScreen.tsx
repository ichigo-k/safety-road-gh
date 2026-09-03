/* ─── Route risk preview ───────────────────────────────────────────────────
 *
 * Answers a question the app could not answer before: "is the road I am about
 * to drive dangerous, and where?"
 *
 * Proximity alerts warn you 20 seconds out. That is the right behaviour once
 * you are moving, but it is too late to change your mind. This screen puts the
 * same hotspot data in front of the driver *before* they leave, when they can
 * still pick a different road or a different time.
 * ------------------------------------------------------------------------ */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { apiFetch } from '../services/api';
import Icon from '../components/Icon';
import MapViewComponent from '../components/MapViewComponent';
import {
  Button,
  EmptyState,
  Screen,
  ScreenHeader,
  SearchField,
  SectionLabel,
  Surface,
  Tag,
} from '../components/ui';
import { colors, radius, spacing, typography } from '../theme';
import { formatDistance } from '../services/geo';

interface RoutePreviewScreenProps {
  onBack: () => void;
}

interface Place {
  id: string;
  name: string;
  address: string;
  municipality: string;
  latitude: number;
  longitude: number;
}

interface RouteHotspot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusM: number;
  currentRisk: number;
  severity: string;
  dominantType: string;
  incidentCount: number;
}

interface RouteResult {
  route: {
    distanceM: number;
    durationS: number;
    trafficDelayS: number;
    points: { latitude: number; longitude: number }[];
  };
  hotspots: RouteHotspot[];
  riskSummary: { count: number; highest: number; criticalCount: number };
}

const ACCRA = { latitude: 5.6037, longitude: -0.187, latitudeDelta: 0.2, longitudeDelta: 0.2 };

const SEVERITY_TONE: Record<string, 'danger' | 'warning' | 'neutral'> = {
  CRITICAL: 'danger',
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'neutral',
};

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} h ${mins % 60} min`;
}

export default function RoutePreviewScreen({ onBack }: RoutePreviewScreenProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [destination, setDestination] = useState<Place | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [planning, setPlanning] = useState(false);
  const [error, setError] = useState('');
  const [origin, setOrigin] = useState<{ latitude: number; longitude: number } | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Origin is wherever the driver is standing when they plan the trip.
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setOrigin({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch {
        /* planning still works once a destination is chosen — see planRoute */
      }
    })();
  }, []);

  // Debounced so a five-letter place name is one request, not five.
  const runSearch = useCallback((text: string) => {
    setQuery(text);
    setError('');
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (text.trim().length < 3) {
      setResults([]);
      return;
    }

    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiFetch(`/maps/search?q=${encodeURIComponent(text.trim())}`);
        setResults(Array.isArray(res.results) ? res.results : []);
      } catch {
        setError('Could not search for that place. Check your connection.');
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const planRoute = async (place: Place) => {
    Keyboard.dismiss();
    setDestination(place);
    setResults([]);
    setQuery(place.name);
    setPlanning(true);
    setError('');
    setRoute(null);

    // Without a GPS fix there is no journey to assess. Say so rather than
    // silently planning from an arbitrary point.
    const from = origin;
    if (!from) {
      setError('Waiting for your location. Turn on GPS and try again.');
      setPlanning(false);
      return;
    }

    try {
      const res = await apiFetch(
        `/maps/route?fromLat=${from.latitude}&fromLng=${from.longitude}` +
          `&toLat=${place.latitude}&toLng=${place.longitude}`
      );
      if (res.error) {
        setError(res.detail ?? res.error);
      } else {
        setRoute(res);
      }
    } catch {
      setError('Could not plan that route. Check your connection and try again.');
    } finally {
      setPlanning(false);
    }
  };

  const reset = () => {
    setDestination(null);
    setRoute(null);
    setQuery('');
    setResults([]);
    setError('');
  };

  const summary = route?.riskSummary;
  const worst = route?.hotspots[0];

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title="Check your route"
          subtitle="See the hotspots on a road before you drive it"
          onBack={onBack}
        />

        <SearchField
          value={query}
          onChangeText={runSearch}
          placeholder="Where are you going?"
        />

        {searching ? (
          <View style={s.searchingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={s.searchingText}>Searching</Text>
          </View>
        ) : null}

        {results.length > 0 ? (
          <Surface style={s.results} padded={false}>
            {results.map((place, i) => (
              <Pressable
                key={place.id}
                onPress={() => planRoute(place)}
                accessibilityRole="button"
                accessibilityLabel={`Plan a route to ${place.name}`}
                style={({ pressed }) => [
                  s.resultRow,
                  i === results.length - 1 && { borderBottomWidth: 0 },
                  pressed && { backgroundColor: colors.surfaceMuted },
                ]}
              >
                <Icon name="location" size={18} color={colors.textSubtle} />
                <View style={{ flex: 1 }}>
                  <Text style={s.resultName} numberOfLines={1}>
                    {place.name}
                  </Text>
                  {place.address ? (
                    <Text style={s.resultAddress} numberOfLines={1}>
                      {place.address}
                    </Text>
                  ) : null}
                </View>
                <Icon name="chevron" size={17} color={colors.textDisabled} />
              </Pressable>
            ))}
          </Surface>
        ) : null}

        {error ? (
          <View style={s.error} accessibilityLiveRegion="polite">
            <Icon name="alert-circle" size={17} color={colors.danger} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        {planning ? (
          <Surface style={s.section}>
            <View style={s.planningRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={s.planningText}>Checking the road ahead</Text>
            </View>
          </Surface>
        ) : null}

        {route ? (
          <>
            {/* ── Verdict ────────────────────────────────────────────────
                One line, stated plainly. A driver deciding whether to leave
                now needs a judgement, not a table to interpret. */}
            <Surface style={s.section}>
              <View style={s.verdictTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.verdictTitle}>
                    {summary && summary.count === 0
                      ? 'No known hotspots on this route'
                      : summary && summary.criticalCount > 0
                      ? `${summary.criticalCount} critical ${
                          summary.criticalCount === 1 ? 'area' : 'areas'
                        } on this route`
                      : `${summary?.count ?? 0} hotspot${summary?.count === 1 ? '' : 's'} on this route`}
                  </Text>
                  <Text style={s.verdictSub} numberOfLines={1}>
                    to {destination?.name}
                  </Text>
                </View>
                <Tag
                  label={
                    summary && summary.count === 0
                      ? 'Clear'
                      : summary && summary.criticalCount > 0
                      ? 'High risk'
                      : 'Caution'
                  }
                  tone={
                    summary && summary.count === 0
                      ? 'success'
                      : summary && summary.criticalCount > 0
                      ? 'danger'
                      : 'warning'
                  }
                />
              </View>

              <View style={s.stats}>
                <Stat label="Distance" value={formatDistance(route.route.distanceM)} />
                <View style={s.statDivider} />
                <Stat label="Drive time" value={formatDuration(route.route.durationS)} />
                {route.route.trafficDelayS > 60 ? (
                  <>
                    <View style={s.statDivider} />
                    <Stat
                      label="Traffic delay"
                      value={`+${formatDuration(route.route.trafficDelayS)}`}
                      tint={colors.warning}
                    />
                  </>
                ) : null}
              </View>
            </Surface>

            {/* ── Map ───────────────────────────────────────────────────── */}
            <Surface style={[s.section, s.mapCard]} padded={false}>
              <View style={s.mapWrap}>
                <MapViewComponent
                  region={ACCRA}
                  routePoints={route.route.points}
                  markers={route.hotspots.map((h) => ({
                    id: h.id,
                    latitude: h.latitude,
                    longitude: h.longitude,
                    title: h.name,
                    locationName: `Risk ${Math.round(h.currentRisk)}`,
                    type: h.dominantType,
                    color:
                      h.severity === 'CRITICAL' || h.severity === 'HIGH'
                        ? colors.danger
                        : colors.warning,
                    clusterCount: h.incidentCount,
                    radiusM: h.radiusM,
                  }))}
                />
              </View>
            </Surface>

            {/* ── Hotspots ──────────────────────────────────────────────── */}
            {route.hotspots.length > 0 ? (
              <>
                <SectionLabel style={s.section}>What is on the way</SectionLabel>
                <Surface padded={false}>
                  {route.hotspots.map((h, i) => (
                    <View
                      key={h.id}
                      style={[s.hotspotRow, i === route.hotspots.length - 1 && { borderBottomWidth: 0 }]}
                    >
                      <View style={s.hotspotTop}>
                        <Tag
                          label={h.severity === 'CRITICAL' ? 'Critical' : h.severity === 'HIGH' ? 'High' : 'Moderate'}
                          tone={SEVERITY_TONE[h.severity] ?? 'neutral'}
                        />
                        <Text style={s.riskValue}>Risk {Math.round(h.currentRisk)}</Text>
                      </View>
                      <Text style={s.hotspotName} numberOfLines={1}>
                        {h.name}
                      </Text>
                      <Text style={s.hotspotMeta}>
                        {h.incidentCount} {h.incidentCount === 1 ? 'incident' : 'incidents'} recorded ·{' '}
                        {h.dominantType === 'ACCIDENT' ? 'accidents' : 'hazards'}
                      </Text>
                    </View>
                  ))}
                </Surface>
              </>
            ) : (
              <Surface style={s.section}>
                <EmptyState
                  icon="check-badge"
                  tone="success"
                  title="Nothing known on this road"
                  description="No accident hotspots recorded along this route. Drive carefully anyway — most roads have never been reported on."
                />
              </Surface>
            )}

            <Button
              label="Check a different route"
              variant="outline"
              full
              onPress={reset}
              style={{ marginTop: spacing.xl }}
            />
          </>
        ) : null}

        {!route && !planning && results.length === 0 && !query ? (
          <Surface style={s.section}>
            <EmptyState
              icon="navigate"
              title="Plan before you drive"
              description="Search for where you are heading and see the accident hotspots along the way."
            />
          </Surface>
        ) : null}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value, tint }: { label: string; value: string; tint?: string }) {
  return (
    <View style={s.stat}>
      <Text style={[s.statValue, tint ? { color: tint } : null]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },

  searchingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.md },
  searchingText: { ...typography.micro },

  results: { marginTop: spacing.md, overflow: 'hidden' },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultName: { fontSize: 15, fontWeight: '500', color: colors.text },
  resultAddress: { ...typography.micro, marginTop: 1 },

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

  planningRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  planningText: { ...typography.callout },

  verdictTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  verdictTitle: { ...typography.title, fontSize: 16.5 },
  verdictSub: { ...typography.micro, marginTop: 2 },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  stat: { flex: 1 },
  statValue: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  statLabel: { ...typography.micro, marginTop: 1 },
  statDivider: { width: StyleSheet.hairlineWidth, height: 26, backgroundColor: colors.border },

  mapCard: { overflow: 'hidden' },
  mapWrap: { height: 260, borderRadius: radius.lg, overflow: 'hidden' },

  hotspotRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  hotspotTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  riskValue: {
    ...typography.micro,
    fontWeight: '600',
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  hotspotName: { fontSize: 15.5, fontWeight: '500', color: colors.text, letterSpacing: -0.2 },
  hotspotMeta: { ...typography.micro, marginTop: 3 },
});
