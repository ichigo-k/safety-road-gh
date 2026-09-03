import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';
import MapView, {
  Circle,
  Marker,
  Callout,
  Polyline,
  UrlTile,
  PROVIDER_DEFAULT,
} from 'react-native-maps';

/* ── Azure Maps basemap ───────────────────────────────────────────────────
 * Azure serves raster tiles over a plain XYZ URL, so it drops straight into
 * react-native-maps as a UrlTile overlay on top of the platform provider.
 * That keeps one basemap across mobile and the web admin instead of Apple
 * Maps on iOS, Google on Android and CARTO on the web.
 *
 * When the key is absent the overlay is simply omitted and the platform's own
 * basemap shows through — a map with the wrong tiles beats a blank screen.
 * ---------------------------------------------------------------------- */
const AZURE_KEY = process.env.EXPO_PUBLIC_AZURE_MAPS_KEY;

const AZURE_TILE_URL =
  'https://atlas.microsoft.com/map/tile' +
  '?api-version=2024-04-01' +
  '&tilesetId=microsoft.base.road' +
  '&zoom={z}&x={x}&y={y}' +
  '&tileSize=256' +
  `&subscription-key=${AZURE_KEY ?? ''}`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MapMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  locationName?: string;
  type?: string;
  status?: string;
  color?: string;
  /** For clusters: how many reports are in this spot */
  clusterCount?: number;
  /** Alert geofence radius in metres. */
  radiusM?: number;
}

export interface MapViewComponentProps {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markers?: MapMarkerData[];
  onMarkerPress?: (marker: MapMarkerData) => void;
  style?: any;
  onRegionChange?: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => void;
  draggablePin?: { latitude: number; longitude: number };
  onPinDragEnd?: (coords: { latitude: number; longitude: number }) => void;
  /** Route polyline, drawn beneath the markers. */
  routePoints?: { latitude: number; longitude: number }[];
}

// ─── Hotspot sizing & color ───────────────────────────────────────────────────
function hotspotStyle(marker: MapMarkerData): {
  radius: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
} {
  const count = marker.clusterCount ?? 1;
  const isResolved = marker.status === 'RESOLVED';

  if (isResolved) {
    return {
      radius: 80 + Math.min(count, 6) * 20,
      fillColor: 'rgba(34,197,94,0.30)',
      strokeColor: 'rgba(34,197,94,0.70)',
      strokeWidth: 1.5,
    };
  }

  const intensity = Math.min(count / 8, 1);

  if (marker.type === 'ACCIDENT') {
    const base = 220 + Math.round(intensity * 35);
    const g = Math.round(50 - intensity * 40);
    const b = Math.round(50 - intensity * 40);
    const opacity = 0.35 + intensity * 0.40;
    return {
      radius: 120 + intensity * 380,
      fillColor: `rgba(${base},${g},${b},${opacity.toFixed(2)})`,
      strokeColor: `rgba(${base},${g},${b},0.85)`,
      strokeWidth: count > 3 ? 0 : 1.5,
    };
  } else {
    const fillColor = intensity > 0.5
      ? `rgba(249,115,22,${(0.35 + intensity * 0.40).toFixed(2)})`
      : `rgba(245,158,11,${(0.30 + intensity * 0.35).toFixed(2)})`;
    const strokeColor = intensity > 0.5
      ? 'rgba(249,115,22,0.80)'
      : 'rgba(245,158,11,0.75)';
    return {
      radius: 100 + intensity * 320,
      fillColor,
      strokeColor,
      strokeWidth: count > 3 ? 0 : 1.5,
    };
  }
}

/* ── Google Maps key guard (Android) ──────────────────────────────────
 *
 * react-native-maps on Android is Google Maps, and its MapView throws
 * IllegalStateException("API key not found") from onCreate the moment it
 * attaches to the window. Under Fabric that surfaces as a fatal
 * "addViewAt: failed to insert view" and takes the whole app down — opening
 * the Map tab killed the process outright.
 *
 * A missing key is a build-configuration problem, not something the user can
 * act on, but it must not be a crash. Render the placeholder instead: the rest
 * of the app stays usable and the reason is visible rather than silent.
 *
 * iOS uses Apple Maps and needs no key, so this only gates Android.
 * ─────────────────────────────────────────────────────────────────── */
const GOOGLE_MAPS_KEY =
  (Constants.expoConfig?.extra?.googleMapsApiKey as string | null | undefined) ??
  (Constants.expoConfig?.android?.config?.googleMaps?.apiKey as string | undefined) ??
  null;

const MAPS_UNAVAILABLE = Platform.OS === 'android' && !GOOGLE_MAPS_KEY;

function MapUnavailable({ style }: { style?: any }) {
  return (
    <View style={[styles.unavailable, style]}>
      <Text style={styles.unavailableTitle}>Map unavailable</Text>
      <Text style={styles.unavailableBody}>
        This build is missing its Google Maps key, so the map cannot be drawn.
        Reports and alerts still work everywhere else in the app.
      </Text>
    </View>
  );
}

// ─── Native Map Component ─────────────────────────────────────────────────────

export default function MapViewComponent({
  region,
  markers = [],
  onMarkerPress,
  routePoints,
  style,
  onRegionChange,
  draggablePin,
  onPinDragEnd,
}: MapViewComponentProps) {
  // Allow tracksViewChanges for initial render cycle so custom dots render
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    // Stop tracking after 1.2s to optimize map FPS
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [markers]);

  // Separate incident markers from user/emergency markers
  const { incidentMarkers, otherMarkers } = useMemo(() => {
    const incident: MapMarkerData[] = [];
    const other: MapMarkerData[] = [];
    markers.forEach((m) => {
      if (m.type === 'ACCIDENT' || m.type === 'HAZARD') {
        incident.push(m);
      } else {
        other.push(m);
      }
    });
    return { incidentMarkers: incident, otherMarkers: other };
  }, [markers]);

  if (MAPS_UNAVAILABLE) {
    return <MapUnavailable style={style} />;
  }

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={style ?? StyleSheet.absoluteFill}
      initialRegion={region}
      region={region}
      mapType="standard"
      showsUserLocation={false}
      showsCompass
      showsScale={false}
      showsBuildings={true}
      loadingEnabled
      onRegionChangeComplete={(r) => onRegionChange?.(r)}
    >
      {/* Azure basemap sits beneath every overlay; zIndex -1 keeps hotspot
          circles and markers drawn on top of it. */}
      {AZURE_KEY ? (
        <UrlTile
          urlTemplate={AZURE_TILE_URL}
          maximumZ={20}
          minimumZ={1}
          tileSize={256}
          zIndex={-1}
          shouldReplaceMapContent
        />
      ) : null}
      {routePoints && routePoints.length > 1 ? (
        <Polyline
          coordinates={routePoints}
          strokeColor="#2B5F9E"
          strokeWidth={5}
          lineJoin="round"
          lineCap="round"
        />
      ) : null}

      {/* ── Hotspot circles ────────────────────────────────────────────── */}
      {incidentMarkers.map((m) => {
        const hs = hotspotStyle(m);
        return (
          <Circle
            key={`circle-${m.id}`}
            center={{ latitude: m.latitude, longitude: m.longitude }}
            radius={hs.radius}
            fillColor={hs.fillColor}
            strokeColor={hs.strokeColor}
            strokeWidth={hs.strokeWidth}
            zIndex={1}
          />
        );
      })}

      {/* ── Incident markers (dot on top of each circle) ─────────────────── */}
      {incidentMarkers.map((m) => (
        <Marker
          key={`marker-${m.id}`}
          coordinate={{ latitude: m.latitude, longitude: m.longitude }}
          onPress={() => onMarkerPress?.(m)}
          tracksViewChanges={tracksViewChanges}
          zIndex={2}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          {/* Custom dot — white ring + colored fill */}
          <View
            style={[
              styles.dot,
              { backgroundColor: m.color ?? (m.type === 'ACCIDENT' ? '#dc2626' : '#f97316') },
            ]}
          />

          <Callout onPress={() => onMarkerPress?.(m)}>
            <View style={styles.callout}>
              <Text
                style={[
                  styles.calloutType,
                  { color: m.type === 'ACCIDENT' ? '#dc2626' : '#d97706' },
                ]}
              >
                {m.clusterCount && m.clusterCount > 1
                  ? `${m.clusterCount} incidents`
                  : m.type ?? 'INCIDENT'}
              </Text>
              <Text style={styles.calloutTitle} numberOfLines={2}>
                {m.title}
              </Text>
              {m.locationName ? (
                <Text style={styles.calloutLocation} numberOfLines={1}>
                  {m.locationName}
                </Text>
              ) : null}
              {m.status ? (
                <View
                  style={[
                    styles.calloutStatusPill,
                    m.status === 'RESOLVED' ? styles.pillResolved : styles.pillPending,
                  ]}
                >
                  <Text style={styles.calloutStatusText}>{m.status}</Text>
                </View>
              ) : null}
            </View>
          </Callout>
        </Marker>
      ))}

      {/* ── Emergency service markers (blue pin) ────────────────────────── */}
      {otherMarkers
        .filter((m) => m.type === 'EMERGENCY')
        .map((m) => (
          <Marker
            key={`svc-${m.id}`}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            onPress={() => onMarkerPress?.(m)}
            tracksViewChanges={tracksViewChanges}
            zIndex={3}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.svcDot} />
            <Callout>
              <View style={styles.callout}>
                <Text style={[styles.calloutType, { color: '#1d4ed8' }]}>EMERGENCY</Text>
                <Text style={styles.calloutTitle}>{m.title}</Text>
                {m.locationName ? (
                  <Text style={styles.calloutLocation}>{m.locationName}</Text>
                ) : null}
              </View>
            </Callout>
          </Marker>
        ))}

      {/* ── User location dot ────────────────────────────────────────────── */}
      {otherMarkers
        .filter((m) => m.type === 'USER')
        .map((m) => (
          <Marker
            key="user-loc"
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            tracksViewChanges={tracksViewChanges}
            zIndex={10}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userOuter}>
              <View style={styles.userInner} />
            </View>
          </Marker>
        ))}

      {/* ── Draggable location picker pin ────────────────────────────────── */}
      {draggablePin && (
        <Marker
          coordinate={draggablePin}
          draggable
          onDragEnd={(e) => onPinDragEnd?.(e.nativeEvent.coordinate)}
          tracksViewChanges={tracksViewChanges}
          zIndex={10}
          anchor={{ x: 0.5, y: 1 }}
        >
          <View style={styles.pickerPin}>
            <View style={styles.pickerPinDot} />
          </View>
        </Marker>
      )}
    </MapView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  unavailable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#EEF2F0',
  },
  unavailableTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2A24',
    marginBottom: 6,
  },
  unavailableBody: {
    fontSize: 13,
    lineHeight: 19,
    color: '#5A6B62',
    textAlign: 'center',
    maxWidth: 280,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 4,
  },
  svcDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1d4ed8',
    borderWidth: 2,
    borderColor: '#ffffff',
    elevation: 3,
  },
  userOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(37,99,235,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(37,99,235,0.40)',
  },
  userInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  pickerPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(11,122,70,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerPinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0B7A46',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  callout: {
    minWidth: 160,
    maxWidth: 220,
    padding: 10,
    gap: 3,
  },
  calloutType: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  calloutTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },
  calloutLocation: {
    fontSize: 11,
    color: '#555555',
    marginTop: 2,
  },
  calloutStatusPill: {
    marginTop: 6,
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  pillResolved: { backgroundColor: '#dcfce7' },
  pillPending: { backgroundColor: '#fef3c7' },
  calloutStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
