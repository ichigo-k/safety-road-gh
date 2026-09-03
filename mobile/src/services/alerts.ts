/* ─── Alert delivery ───────────────────────────────────────────────────────
 *
 * Turns a ProximityAlert into something a driver can actually receive.
 *
 * The design constraint that drives everything here: a person at the wheel
 * cannot read a phone. An alert that requires looking at the screen is not a
 * safety feature, it is a second hazard. So:
 *
 *   · Speech is the primary channel. Critical and warning alerts are spoken.
 *   · Haptics fire on the same event, for a rider with the phone in a pocket.
 *   · The notification is the record, not the delivery — it is what you check
 *     afterwards, or what wakes you when the app is closed.
 *   · Nothing ever demands a tap to dismiss while moving.
 * ------------------------------------------------------------------------ */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Speech from 'expo-speech';
import type { ProximityAlert } from './proximity';
import { loadPreferences } from './preferences';

let configured = false;

export interface AlertPreferences {
  spokenAlerts: boolean;
  notifications: boolean;
  haptics: boolean;
}

export const defaultPreferences: AlertPreferences = {
  spokenAlerts: true,
  notifications: true,
  haptics: true,
};

/* ── Setup ───────────────────────────────────────────────────────────────── */

export async function configureNotifications(): Promise<boolean> {
  if (configured) return true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      // Speech carries the message; a notification chime on top of it would
      // just talk over the sentence the driver needs to hear.
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    // A dedicated high-importance channel so hazard warnings are not batched
    // with ordinary app notifications by the system.
    await Notifications.setNotificationChannelAsync('hotspot-alerts', {
      name: 'Road hazard alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 100, 250],
      lightColor: '#BC3B2F',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
  }

  const settings = await Notifications.getPermissionsAsync();
  let granted = settings.granted;
  if (!granted) {
    const req = await Notifications.requestPermissionsAsync();
    granted = req.granted;
  }

  configured = granted;
  return granted;
}

/* ── Speech ──────────────────────────────────────────────────────────────── */

export function speak(text: string) {
  if (!text) return;
  // Stop anything mid-sentence: the newest hazard is the relevant one, and
  // queueing warnings means hearing about a junction you already passed.
  Speech.stop();
  Speech.speak(text, {
    language: 'en-GB',
    // Slightly slower than default — road names need to survive road noise.
    rate: Platform.OS === 'ios' ? 0.48 : 0.92,
    pitch: 1.0,
  });
}

/* ── Haptics ─────────────────────────────────────────────────────────────── */

async function vibrate(level: ProximityAlert['level']) {
  try {
    // Imported lazily: expo-haptics is not installed on every platform build,
    // and a missing optional module must not take the alert down with it.
    const Haptics = await import('expo-haptics');
    if (level === 'critical') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch {
    /* haptics are never the only channel — see the module header */
  }
}

/* ── Delivery ────────────────────────────────────────────────────────────── */

export async function deliver(
  alert: ProximityAlert,
  override?: AlertPreferences
): Promise<void> {
  // Honour what the user actually chose in Settings, not a hardcoded default.
  const stored = await loadPreferences();
  const prefs: AlertPreferences = override ?? {
    spokenAlerts: stored.spokenAlerts,
    notifications: stored.notifications,
    haptics: stored.haptics,
  };

  // Fire the three channels together. They must land on the same beat — a
  // haptic that lags its spoken warning reads as a glitch, not as feedback.
  const tasks: Promise<unknown>[] = [];

  if (prefs.haptics) tasks.push(vibrate(alert.level));

  if (prefs.spokenAlerts && alert.spoken) speak(alert.spoken);

  if (prefs.notifications) {
    tasks.push(
      Notifications.scheduleNotificationAsync({
        content: {
          title: alert.title,
          body: alert.body,
          data: { hotspotId: alert.hotspot.id, level: alert.level },
          ...(Platform.OS === 'android' ? { channelId: 'hotspot-alerts' } : {}),
        },
        // null = now. A hazard warning delayed is a hazard warning wasted.
        trigger: null,
      }).catch(() => undefined)
    );
  }

  await Promise.allSettled(tasks);
}

/** Deliver at most one alert — the most urgent. */
export async function deliverMostUrgent(
  alerts: ProximityAlert[],
  prefs?: AlertPreferences
): Promise<ProximityAlert | null> {
  if (alerts.length === 0) return null;

  // A user who switched hazard warnings off should hear nothing, even though
  // the engine still computed the alert (the map still shows the hotspot).
  const stored = await loadPreferences();
  if (!stored.hazardAlerts) return null;

  // `evaluate` already sorts critical-first, nearest-first.
  const [top] = alerts;
  await deliver(top, prefs);
  return top;
}
