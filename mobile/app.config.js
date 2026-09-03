/* ─── Dynamic config layer over app.json ──────────────────────────────────────
 *
 * app.json stays the source of truth for everything static. This file exists
 * only to inject values that must not be committed.
 *
 * The Google Maps Android key is required, not optional: react-native-maps on
 * Android is Google Maps, and its MapView throws
 *
 *   IllegalStateException: API key not found. Check that
 *   <meta-data android:name="com.google.android.geo.API_KEY" .../> is in the
 *   <application> element of AndroidManifest.xml
 *
 * the moment it attaches to the window — which Fabric surfaces as a fatal
 * "addViewAt: failed to insert view". The Azure raster tiles drawn over the
 * basemap do not change this; the key is needed to construct the view at all.
 *
 * Set GOOGLE_MAPS_API_KEY in mobile/.env locally and as a repository secret
 * for CI. Restrict the key to the com.safetyroad.gh package and the release
 * signing certificate — an Android Maps key ships inside every APK and is not
 * a secret, so package restriction is what actually protects it.
 * -------------------------------------------------------------------------- */
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY || undefined,
      },
    },
  },
  extra: {
    ...config.extra,
    // Read at runtime so the map can degrade to a placeholder instead of
    // crashing when the key was not supplied at build time.
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || null,
  },
});
