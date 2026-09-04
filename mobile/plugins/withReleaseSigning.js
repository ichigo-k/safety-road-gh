/* ─── Release signing config plugin ───────────────────────────────────────────
 *
 * `expo prebuild` generates android/ from scratch on every CI run, and the
 * template it emits signs release builds with the debug keystore:
 *
 *   release {
 *     // Caution! In production, you need to generate your own keystore file.
 *     signingConfig signingConfigs.debug
 *   }
 *
 * That has two consequences. The APK carries the standard React Native debug
 * certificate — CN=Android Debug, SHA-1 5e8f1606…, identical in every project
 * that uses the template — so it identifies nothing and protects nothing. And
 * Play Store rejects debug-signed uploads outright, with no way to change the
 * signing identity later without losing the listing.
 *
 * Editing android/app/build.gradle directly would not survive, since that
 * directory is regenerated and gitignored. A config plugin runs as part of
 * prebuild, so the change is reapplied every time.
 *
 * Credentials come from the environment, never the repository:
 *
 *   ANDROID_KEYSTORE_PATH      absolute path to the .jks
 *   ANDROID_KEYSTORE_PASSWORD
 *   ANDROID_KEY_ALIAS
 *   ANDROID_KEY_PASSWORD
 *
 * When they are absent the template's behaviour is left alone, so local debug
 * builds and anyone without the keystore keep working exactly as before. Only
 * a build with all four set produces a properly signed release.
 * -------------------------------------------------------------------------- */

const { withAppBuildGradle } = require('@expo/config-plugins');

const RELEASE_SIGNING = `
        release {
            // Injected by plugins/withReleaseSigning.js. Falls back to the
            // debug keystore when the environment does not carry credentials,
            // which keeps local builds working.
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH") ?: "debug.keystore")
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD") ?: "android"
            keyAlias System.getenv("ANDROID_KEY_ALIAS") ?: "androiddebugkey"
            keyPassword System.getenv("ANDROID_KEY_PASSWORD") ?: "android"
        }
`;

function addReleaseSigningConfig(contents) {
  if (contents.includes('withReleaseSigning.js')) return contents;

  // 1. Declare the release signing config alongside debug.
  const anchor = `        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }`;
  if (!contents.includes(anchor)) {
    throw new Error(
      '[withReleaseSigning] Could not find the debug signingConfig block in ' +
        'app/build.gradle. The Expo template changed — update this plugin ' +
        'rather than letting release builds silently keep the debug key.'
    );
  }
  let next = contents.replace(anchor, anchor + '\n' + RELEASE_SIGNING);

  // 2. Point the release buildType at it. The template has two occurrences of
  //    `signingConfig signingConfigs.debug` — one in debug, one in release —
  //    so target the commented release one specifically.
  const releaseAnchor = `            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;
  if (!next.includes(releaseAnchor)) {
    throw new Error(
      '[withReleaseSigning] Could not find the release buildType signingConfig. ' +
        'The Expo template changed — update this plugin.'
    );
  }
  next = next.replace(releaseAnchor, '            signingConfig signingConfigs.release');

  return next;
}

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error(
        '[withReleaseSigning] Expected a Groovy build.gradle, got ' +
          cfg.modResults.language
      );
    }
    cfg.modResults.contents = addReleaseSigningConfig(cfg.modResults.contents);
    return cfg;
  });
};
