import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Card, ListRow, Screen, ScreenHeader, SectionLabel } from '../components/ui';
import {
  getGeofenceStatus,
  startGeofencing,
  stopGeofencing,
} from '../services/backgroundGeofence';
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  type Preferences,
} from '../services/preferences';
import { clearHotspotCache } from '../services/hotspotStore';
import { confirm, notify } from '../services/confirm';
import { colors, spacing, typography } from '../theme';

interface SettingsScreenProps {
  onBack: () => void;
}

/* Every switch here changes real behaviour and survives a restart.
 *
 * Previously these were plain component state: they reset on navigation and
 * none of them affected anything. Two — "offline map caching" and a separate
 * "high-priority broadcasts" channel — were removed rather than left in,
 * because nothing behind them existed. A control that does nothing is worse
 * than no control: it tells someone they have authority over a safety feature
 * that they do not actually have. */

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  // Background tracking is OS state, not a stored preference — the user may
  // have revoked the permission outside the app entirely.
  const [backgroundAlerts, setBackgroundAlerts] = useState(false);
  const [geofenceBusy, setGeofenceBusy] = useState(false);
  const [geofenceNote, setGeofenceNote] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [stored, status] = await Promise.all([loadPreferences(), getGeofenceStatus()]);
      if (cancelled) return;
      setPrefs(stored);
      setBackgroundAlerts(status.running && status.backgroundGranted);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = async (patch: Partial<Preferences>) => {
    // Optimistic: the switch moves under the finger, not after a disk write.
    setPrefs((p) => ({ ...p, ...patch }));
    await savePreferences(patch);
  };

  const toggleBackgroundAlerts = async (next: boolean) => {
    setGeofenceBusy(true);
    setGeofenceNote(null);
    try {
      if (next) {
        const status = await startGeofencing();
        setBackgroundAlerts(status.running);
        if (!status.running) setGeofenceNote(status.reason ?? 'Could not start background alerts.');
      } else {
        await stopGeofencing();
        setBackgroundAlerts(false);
      }
    } finally {
      setGeofenceBusy(false);
    }
  };

  const handleClearCache = async () => {
    const ok = await confirm({
      title: 'Clear cached data',
      message:
        'Removes the offline hotspot data and alert history stored on this device. ' +
        'It downloads again next time you have signal.',
      confirmLabel: 'Clear',
      destructive: true,
    });
    if (!ok) return;

    setClearing(true);
    try {
      await clearHotspotCache();
      notify('Cleared', 'Cached hotspot data has been removed from this device.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="App settings"
          subtitle="How and when Safety Road warns you"
          onBack={onBack}
        />

        {/* ── What you are warned about ───────────────────────────────────── */}
        <SectionLabel>Hazard alerts</SectionLabel>
        <Card padded={false}>
          <ToggleRow
            icon="shield"
            label="Warn me about hotspots"
            detail="Alerts you as you approach an accident-prone area"
            value={prefs.hazardAlerts}
            onChange={(v) => update({ hazardAlerts: v })}
            disabled={!loaded}
          />
          <ToggleRow
            icon="zap"
            label="Weather advisories"
            detail="Flooding and heavy rain warnings"
            value={prefs.weatherAlerts}
            onChange={(v) => update({ weatherAlerts: v })}
            disabled={!loaded}
            last
          />
        </Card>

        {/* ── How you are warned ──────────────────────────────────────────── */}
        <SectionLabel style={s.section}>How you are warned</SectionLabel>
        <Card padded={false}>
          <ToggleRow
            icon="radio"
            label="Spoken warnings"
            detail="Reads the warning aloud so your eyes stay on the road"
            value={prefs.spokenAlerts}
            onChange={(v) => update({ spokenAlerts: v })}
            disabled={!loaded}
          />
          <ToggleRow
            icon="bell"
            label="Notifications"
            detail="A notification you can check afterwards"
            value={prefs.notifications}
            onChange={(v) => update({ notifications: v })}
            disabled={!loaded}
          />
          <ToggleRow
            icon="phone"
            label="Vibration"
            detail="Useful when the phone is in a pocket or a mount"
            value={prefs.haptics}
            onChange={(v) => update({ haptics: v })}
            disabled={!loaded}
            last
          />
        </Card>
        <Text style={s.note}>
          Spoken warnings are the safest channel while driving. Turning all three off leaves
          hotspots on the map but you will not be warned as you approach one.
        </Text>

        {/* ── Location ────────────────────────────────────────────────────── */}
        <SectionLabel style={s.section}>Location</SectionLabel>
        <Card padded={false}>
          <ToggleRow
            icon="shield"
            label="Warn me while the app is closed"
            detail="Keeps checking the road ahead in the background"
            value={backgroundAlerts}
            onChange={toggleBackgroundAlerts}
            disabled={geofenceBusy}
          />
          <ToggleRow
            icon="crosshair"
            label="High-accuracy GPS"
            detail="Triggers warnings within about 10 m instead of 100 m"
            value={prefs.highAccuracyGps}
            onChange={(v) => update({ highAccuracyGps: v })}
            disabled={!loaded}
            last
          />
        </Card>
        <Text style={s.note}>
          {geofenceNote ??
            'Both increase battery use. Background warnings need the "Allow all the time" ' +
              'location permission, and an accuracy change applies next time tracking starts.'}
        </Text>

        {/* ── Storage ─────────────────────────────────────────────────────── */}
        <SectionLabel style={s.section}>Storage</SectionLabel>
        <Card padded={false}>
          <ListRow
            icon="trash"
            label={clearing ? 'Clearing…' : 'Clear cached data'}
            detail="Offline hotspot data and alert history on this device"
            onPress={clearing ? undefined : handleClearCache}
            last
          />
        </Card>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </Screen>
  );
}

function ToggleRow({
  icon,
  label,
  detail,
  value,
  onChange,
  last,
  disabled,
}: {
  icon: string;
  label: string;
  detail: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
  disabled?: boolean;
}) {
  return (
    <ListRow
      icon={icon}
      label={label}
      detail={detail}
      last={last}
      right={
        <Switch
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          trackColor={{ false: colors.borderStrong, true: colors.primaryContainer }}
          thumbColor={value ? colors.primary : '#FFFFFF'}
          ios_backgroundColor={colors.borderStrong}
        />
      }
    />
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  section: { marginTop: spacing.xxl },
  note: {
    ...typography.micro,
    marginTop: spacing.sm,
    marginHorizontal: spacing.xs,
    lineHeight: 17,
  },
});
