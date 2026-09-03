/* ─── Native map: Azure Maps Web SDK inside a WebView ─────────────────────────
 *
 * This screen used to render `react-native-maps`, which on Android is the
 * Google Maps SDK. Its MapView throws
 *
 *   IllegalStateException: API key not found. Check that <meta-data
 *   android:name="com.google.android.geo.API_KEY" .../> is in the
 *   <application> element of AndroidManifest.xml
 *
 * from onCreate the moment it attaches to the window — which Fabric turns into
 * a fatal "addViewAt: failed to insert view". Opening the Map tab killed the
 * process outright.
 *
 * The Azure raster tiles drawn over that basemap never avoided the problem:
 * the key is needed to construct the view, not to fetch tiles. So the app
 * needed a Google key to display a map that contained no Google data.
 *
 * `azure-maps-control` is Azure's own map SDK and has always been what the web
 * build uses (see index.web.tsx) — but it is browser-only and cannot run in
 * React Native's JS runtime, which has no DOM. A WebView is a browser, so it
 * can run exactly the same SDK, with the same sources, layers and styling as
 * the web map. One Azure basemap on both platforms, no Google anywhere, and
 * only the Azure subscription key to manage.
 *
 * The trade is a postMessage bridge: markers, camera, route and pin are pushed
 * in as injected JavaScript, and taps and drags come back out as messages. The
 * public props are unchanged, so callers do not know the difference.
 * -------------------------------------------------------------------------- */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { colors, radius, spacing, typography } from '../../theme';

// ─── Types (identical to index.web.tsx) ───────────────────────────────────────

export interface MapMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  locationName?: string;
  type?: string;
  status?: string;
  color?: string;
  clusterCount?: number;
  /** Alert geofence radius in metres, drawn as a real ground circle. */
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

const AZURE_KEY = process.env.EXPO_PUBLIC_AZURE_MAPS_KEY;

/** Latitude span to an Azure zoom level, near enough for an initial view. */
function zoomForDelta(latitudeDelta: number): number {
  if (!latitudeDelta || latitudeDelta <= 0) return 12;
  return Math.max(2, Math.min(18, Math.log2(360 / latitudeDelta)));
}

/* ── The page hosting the map ────────────────────────────────────────────────
 *
 * Built once and never rebuilt: reloading the WebView would throw away the
 * user's pan and zoom. Everything after first paint arrives through
 * injectJavaScript instead.
 *
 * The SDK is loaded from Azure's CDN. The map needs the network for tiles
 * regardless, so this adds no offline capability that would otherwise exist —
 * but it does mean a cold start with no connection shows the load failure
 * rather than a blank grey square, which is what onLoadFailed reports.
 * ------------------------------------------------------------------------- */
function buildHtml(key: string, centerLat: number, centerLng: number, zoom: number): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://atlas.microsoft.com/sdk/javascript/mapcontrol/3/atlas.min.css" type="text/css" />
<script src="https://atlas.microsoft.com/sdk/javascript/mapcontrol/3/atlas.min.js"></script>
<style>
  html, body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#EEF2F0; }
  #map { width:100%; height:100%; }
  .azure-map-copyright, .azure-maps-control-container a { font-size: 9px; }
</style>
</head>
<body>
<div id="map"></div>
<script>
(function () {
  var map, source, routeSource, pin, bubbles;
  var markerIndex = {};

  function post(type, payload) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
    }
  }

  function fail(message) { post('error', { message: String(message) }); }

  if (typeof atlas === 'undefined') { fail('Azure Maps SDK did not load'); return; }

  try {
    map = new atlas.Map('map', {
      center: [${centerLng}, ${centerLat}],
      zoom: ${zoom},
      style: 'road',
      language: 'en-US',
      showFeedbackLink: false,
      renderWorldCopies: false,
      authOptions: { authType: 'subscriptionKey', subscriptionKey: '${key}' }
    });
  } catch (e) { fail(e && e.message ? e.message : e); return; }

  map.events.add('error', function (e) {
    fail((e && e.error && e.error.message) || 'Map error');
  });

  map.events.add('ready', function () {
    /* The route has its own source so redrawing it never disturbs the hotspot
       layer, and it is added first so the line sits underneath. */
    routeSource = new atlas.source.DataSource();
    map.sources.add(routeSource);
    map.layers.add(new atlas.layer.LineLayer(routeSource, null, {
      strokeColor: '#2B5F9E', strokeWidth: 5, strokeOpacity: 0.85,
      lineJoin: 'round', lineCap: 'round'
    }));

    source = new atlas.source.DataSource();
    map.sources.add(source);

    /* Geofence rings. Azure renders a Point tagged subType "Circle" as a true
       ground circle, so the ring is the real alert radius at every zoom rather
       than a fixed pixel size that lies as you zoom out. */
    map.layers.add(new atlas.layer.PolygonLayer(source, null, {
      fillColor: ['get', 'color'], fillOpacity: 0.15,
      filter: ['==', ['geometry-type'], 'Polygon']
    }));
    map.layers.add(new atlas.layer.LineLayer(source, null, {
      strokeColor: ['get', 'color'], strokeWidth: 1.5, strokeOpacity: 0.6,
      filter: ['==', ['geometry-type'], 'Polygon']
    }));

    bubbles = new atlas.layer.BubbleLayer(source, null, {
      radius: ['interpolate', ['linear'], ['get', 'count'], 1, 7, 20, 20],
      color: ['get', 'color'],
      strokeColor: '#FFFFFF',
      strokeWidth: 2,
      filter: ['==', ['geometry-type'], 'Point']
    });
    map.layers.add(bubbles);

    map.layers.add(new atlas.layer.SymbolLayer(source, null, {
      iconOptions: { image: 'none' },
      textOptions: {
        textField: ['case', ['>', ['get', 'count'], 1], ['to-string', ['get', 'count']], ''],
        color: '#FFFFFF', size: 11, offset: [0, 0.1], allowOverlap: true
      },
      filter: ['==', ['geometry-type'], 'Point']
    }));

    map.events.add('click', bubbles, function (e) {
      var shape = e.shapes && e.shapes[0];
      if (!shape || !shape.getProperties) return;
      var id = shape.getProperties().id;
      if (id && markerIndex[id]) post('markerPress', markerIndex[id]);
    });

    /* moveend, not move: reporting every frame of a pan would fire hundreds of
       bridge messages and re-render the caller on each one. */
    map.events.add('moveend', function () {
      var cam = map.getCamera();
      var b = cam.bounds;
      post('regionChange', {
        latitude: cam.center[1],
        longitude: cam.center[0],
        latitudeDelta: b ? Math.abs(b[3] - b[1]) : 0.05,
        longitudeDelta: b ? Math.abs(b[2] - b[0]) : 0.05
      });
    });

    post('ready', {});
  });

  // ── Commands pushed in from React Native ──────────────────────────────────

  window.SRG = {
    setMarkers: function (list) {
      if (!source) return;
      markerIndex = {};
      source.clear();
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (!isFinite(m.latitude) || !isFinite(m.longitude)) continue;
        markerIndex[m.id] = m;
        var props = {
          id: m.id,
          color: m.color || '#BC3B2F',
          count: m.clusterCount || 1,
          title: m.title
        };
        if (m.radiusM && m.radiusM > 0) {
          var ring = {};
          for (var k in props) ring[k] = props[k];
          ring.subType = 'Circle';
          ring.radius = m.radiusM;
          source.add(new atlas.data.Feature(
            new atlas.data.Point([m.longitude, m.latitude]), ring));
        }
        source.add(new atlas.data.Feature(
          new atlas.data.Point([m.longitude, m.latitude]), props));
      }
    },

    setRoute: function (points) {
      if (!routeSource) return;
      routeSource.clear();
      if (!points || points.length < 2) return;
      var positions = points.map(function (p) { return [p.longitude, p.latitude]; });
      routeSource.add(new atlas.data.Feature(new atlas.data.LineString(positions)));
      // Frame the whole journey — a route preview that opens zoomed to the
      // start tells you nothing about what is further along it.
      map.setCamera({
        bounds: atlas.data.BoundingBox.fromPositions(positions),
        padding: 48
      });
    },

    setPin: function (coords) {
      if (!map) return;
      if (!coords) {
        if (pin) { map.markers.remove(pin); pin = null; }
        return;
      }
      if (!pin) {
        pin = new atlas.HtmlMarker({
          draggable: true,
          color: '#146B45',
          position: [coords.longitude, coords.latitude]
        });
        map.markers.add(pin);
        map.events.add('dragend', pin, function () {
          var p = pin.getOptions().position;
          post('pinDragEnd', { latitude: p[1], longitude: p[0] });
        });
      } else {
        pin.setOptions({ position: [coords.longitude, coords.latitude] });
      }
    },

    setCamera: function (r) {
      if (!map) return;
      map.setCamera({ center: [r.longitude, r.latitude] });
    }
  };
})();
</script>
</body>
</html>`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapViewComponent({
  region,
  markers = [],
  onMarkerPress,
  style,
  onRegionChange,
  draggablePin,
  onPinDragEnd,
  routePoints,
}: MapViewComponentProps) {
  const webRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Built once. Rebuilding it would reload the page and reset the user's view.
  const html = useMemo(
    () =>
      buildHtml(
        AZURE_KEY ?? '',
        region.latitude,
        region.longitude,
        zoomForDelta(region.latitudeDelta)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const send = useCallback((expression: string) => {
    // The trailing `true;` keeps the WebView from warning about a non-null
    // evaluation result.
    webRef.current?.injectJavaScript(`${expression} true;`);
  }, []);

  useEffect(() => {
    if (!ready) return;
    send(`window.SRG.setMarkers(${JSON.stringify(markers)});`);
  }, [markers, ready, send]);

  useEffect(() => {
    if (!ready) return;
    send(`window.SRG.setRoute(${JSON.stringify(routePoints ?? [])});`);
  }, [routePoints, ready, send]);

  useEffect(() => {
    if (!ready) return;
    send(`window.SRG.setPin(${JSON.stringify(draggablePin ?? null)});`);
  }, [draggablePin, ready, send]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let message: { type: string; payload: any };
      try {
        message = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }

      switch (message.type) {
        case 'ready':
          setReady(true);
          break;
        case 'markerPress':
          onMarkerPress?.(message.payload as MapMarkerData);
          break;
        case 'regionChange':
          onRegionChange?.(message.payload);
          break;
        case 'pinDragEnd':
          onPinDragEnd?.(message.payload);
          break;
        case 'error':
          setLoadError(message.payload?.message ?? 'Map failed to load');
          break;
      }
    },
    [onMarkerPress, onRegionChange, onPinDragEnd]
  );

  if (!AZURE_KEY) {
    return (
      <View style={[s.fallback, style]}>
        <Text style={s.fallbackTitle}>Map not configured</Text>
        <Text style={s.fallbackBody}>
          Set EXPO_PUBLIC_AZURE_MAPS_KEY in mobile/.env and rebuild.
        </Text>
      </View>
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      <WebView
        ref={webRef}
        source={{ html }}
        originWhitelist={['*']}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        // The map does its own panning; letting the WebView scroll or bounce
        // would fight the gesture.
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        setSupportMultipleWindows={false}
        onError={() => setLoadError('Could not load the map.')}
        onHttpError={() => setLoadError('Could not load the map.')}
        style={s.web}
      />

      {loadError ? (
        <View style={s.loading}>
          <Text style={s.fallbackTitle}>Map unavailable</Text>
          <Text style={s.fallbackBody}>{loadError}</Text>
        </View>
      ) : !ready ? (
        <View style={s.loading} pointerEvents="none">
          <Text style={s.fallbackBody}>Loading map…</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  web: {
    flex: 1,
    backgroundColor: colors.surfaceSunken,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSunken,
    padding: spacing.xl,
    borderRadius: radius.md,
  },
  fallbackTitle: { ...typography.title, marginBottom: 4 },
  fallbackBody: { ...typography.callout, textAlign: 'center', color: colors.textSubtle },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSunken,
  },
});
