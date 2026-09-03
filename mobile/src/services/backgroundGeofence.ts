/* ─── Background geofencing ────────────────────────────────────────────────
 *
 * Keeps proximity alerts running when the app is backgrounded or closed.
 *
 * The task is defined at module scope, not inside a component. Expo requires
 * the definition to run during the JS bundle's initial evaluation so the OS
 * can hand work back to a task that already exists after the app is killed
 * and relaunched — registering it inside a hook would silently never fire.
 *
 * Cost, stated honestly: this drains battery, and both Google Play and Apple
 * require a written justification for background location at review. It is
 * opt-in from Settings, never enabled silently.
 * ------------------------------------------------------------------------ */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { deliverMostUrgent, configureNotifications } from './alerts';
import { getCachedHotspots, loadCooldownState, saveCooldownState, syncHotspots } from './hotspotStore';
import { evaluate, type Fix } from './proximity';
import { loadPreferences, locationAccuracy } from './preferences';

export const GEOFENCE_TASK = 'safetyroad-hotspot-geofence';

/* ── The task ────────────────────────────────────────────────────────────── */

TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) return;

  const locations = (data as { locations?: Location.LocationObject[] } | undefined)?.locations;
  if (!locations || locations.length === 0) return;

  // Only the newest fix matters. The OS may batch several while the device
  // was asleep, and warning about where you were five minutes ago is worse
  // than saying nothing.
  const latest = locations[locations.length - 1];

  const fix: Fix = {
    latitude: latest.coords.latitude,
    longitude: latest.coords.longitude,
    speed: latest.coords.speed,
    heading: latest.coords.heading,
    timestamp: latest.timestamp,
  };

  try {
    // Read from cache first — this runs with no UI and often no connection.
    let hotspots = await getCachedHotspots();
    if (hotspots.length === 0) {
      hotspots = (await syncHotspots()).hotspots;
    }
    if (hotspots.length === 0) return;

    const state = await loadCooldownState();
    const { alerts, state: next } = evaluate(fix, hotspots, state);

    await saveCooldownState(next);
    if (alerts.length > 0) await deliverMostUrgent(alerts);
  } catch {
    /* a background task that throws gets killed by the OS — swallow and wait
       for the next fix rather than losing the registration entirely */
  }
});

/* ── Control ─────────────────────────────────────────────────────────────── */

export interface GeofenceStatus {
  running: boolean;
  /** False when the user granted foreground but declined background. */
  backgroundGranted: boolean;
  reason?: string;
}

export async function getGeofenceStatus(): Promise<GeofenceStatus> {
  try {
    const running = await Location.hasStartedLocationUpdatesAsync(GEOFENCE_TASK);
    const { status } = await Location.getBackgroundPermissionsAsync();
    return { running, backgroundGranted: status === 'granted' };
  } catch {
    return { running: false, backgroundGranted: false };
  }
}

/**
 * Ask for permission and start tracking.
 *
 * Foreground permission must be granted and settled before the background
 * prompt is even allowed to appear — asking for "always" first is rejected by
 * the OS on both platforms.
 */
export async function startGeofencing(): Promise<GeofenceStatus> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') {
    return { running: false, backgroundGranted: false, reason: 'Location permission denied.' };
  }

  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== 'granted') {
    return {
      running: false,
      backgroundGranted: false,
      reason:
        'Background location is off. Alerts will only work while Safety Road is open.',
    };
  }

  await configureNotifications();

  const already = await Location.hasStartedLocationUpdatesAsync(GEOFENCE_TASK);
  if (already) return { running: true, backgroundGranted: true };

  const prefs = await loadPreferences();

  await Location.startLocationUpdatesAsync(GEOFENCE_TASK, {
    // High accuracy narrows the fix from ~100 m to ~10 m, which is the
    // difference between a 250 m hotspot triggering where it should and
    // triggering a street early. It costs battery, hence the setting.
    accuracy: locationAccuracy(prefs),
    // Distance-based rather than time-based: a parked car should cost nothing,
    // and at speed 120 m is a couple of seconds.
    distanceInterval: 120,
    timeInterval: 15_000,
    // Let the OS batch fixes while the screen is off. It costs a little
    // latency and saves a great deal of battery.
    deferredUpdatesInterval: 30_000,
    deferredUpdatesDistance: 200,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Safety Road is watching the road ahead',
      notificationBody: 'You will be warned before you reach an accident hotspot.',
      notificationColor: '#146B45',
    },
  });

  return { running: true, backgroundGranted: true };
}

export async function stopGeofencing(): Promise<void> {
  try {
    if (await Location.hasStartedLocationUpdatesAsync(GEOFENCE_TASK)) {
      await Location.stopLocationUpdatesAsync(GEOFENCE_TASK);
    }
  } catch {
    /* already stopped */
  }
}
