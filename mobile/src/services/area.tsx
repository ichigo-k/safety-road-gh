/* ─── Selected area ────────────────────────────────────────────────────────
 *
 * Everything the app shows is scoped to one place: incidents, alerts, stats.
 *
 * It auto-detects where you are on first launch, but the choice is yours to
 * override — the same way a weather app opens on your city yet lets you check
 * another one. A driver planning a trip to Tamale wants Tamale's road picture
 * before they set off, not after they arrive.
 *
 * The distinction that matters:
 *   · `area`  — what you are *looking at*. Drives the feeds and stats.
 *   · GPS     — where you actually *are*. Drives proximity alerts, always,
 *               regardless of what you happen to be browsing.
 *
 * Conflating those would mean browsing Tamale silently disabled the hazard
 * warnings for the road you are physically on.
 * ------------------------------------------------------------------------ */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { apiFetch } from './api';

const AREA_KEY = '@safetyroad/area';

/** Default view when we have neither GPS nor a saved choice. */
const ACCRA: Area = {
  name: 'Accra',
  label: 'Accra, Greater Accra',
  latitude: 5.6037,
  longitude: -0.187,
  source: 'default',
};

/** How far around the selected point counts as "this area". */
export const AREA_RADIUS_KM = 40;

export interface Area {
  name: string;
  label: string;
  latitude: number;
  longitude: number;
  source: 'auto' | 'manual' | 'default';
}

interface AreaContextValue {
  area: Area;
  /** True while the first auto-detect is in flight. */
  detecting: boolean;
  /** Set explicitly from the picker. */
  setArea: (area: Omit<Area, 'source'>) => void;
  /** Re-detect from GPS. */
  useCurrentLocation: () => Promise<boolean>;
}

const AreaContext = createContext<AreaContextValue>({
  area: ACCRA,
  detecting: false,
  setArea: () => {},
  useCurrentLocation: async () => false,
});

export const useArea = () => useContext(AreaContext);

export function AreaProvider({ children }: { children: React.ReactNode }) {
  const [area, setAreaState] = useState<Area>(ACCRA);
  const [detecting, setDetecting] = useState(true);

  const persist = useCallback((next: Area) => {
    setAreaState(next);
    AsyncStorage.setItem(AREA_KEY, JSON.stringify(next)).catch(() => {
      /* a lost preference costs one re-detect, not correctness */
    });
  }, []);

  /** Resolve coordinates to a human label. Falls back to the raw name. */
  const describe = useCallback(
    async (latitude: number, longitude: number): Promise<{ name: string; label: string }> => {
      try {
        const res = await apiFetch(`/maps/reverse?lat=${latitude}&lng=${longitude}`);
        if (res?.name) {
          return { name: res.name, label: res.label ?? res.name };
        }
      } catch {
        /* offline — fall through to coordinates */
      }
      return { name: 'Your location', label: 'Your location' };
    },
    []
  );

  const useCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return false;

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;
      const { name, label } = await describe(latitude, longitude);
      persist({ name, label, latitude, longitude, source: 'auto' });
      return true;
    } catch {
      return false;
    }
  }, [describe, persist]);

  const setArea = useCallback(
    (next: Omit<Area, 'source'>) => persist({ ...next, source: 'manual' }),
    [persist]
  );

  // On launch: honour a saved manual choice, otherwise auto-detect. Someone
  // who deliberately switched to Tamale should not be yanked back to Accra
  // every time they reopen the app.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(AREA_KEY);
        const saved: Area | null = raw ? JSON.parse(raw) : null;

        if (saved && saved.source === 'manual') {
          if (!cancelled) {
            setAreaState(saved);
            setDetecting(false);
          }
          return;
        }

        if (saved && !cancelled) setAreaState(saved); // show something immediately
        await useCurrentLocation();
      } catch {
        /* keep the default */
      } finally {
        if (!cancelled) setDetecting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [useCurrentLocation]);

  const value = useMemo(
    () => ({ area, detecting, setArea, useCurrentLocation }),
    [area, detecting, setArea, useCurrentLocation]
  );

  return <AreaContext.Provider value={value}>{children}</AreaContext.Provider>;
}

/** Query string for the location-scoped endpoints. */
export function areaQuery(area: Area, radiusKm: number = AREA_RADIUS_KM): string {
  return `lat=${area.latitude}&lng=${area.longitude}&radiusKm=${radiusKm}`;
}
