// Metro config — adds SVG-as-component support and blocks web-only packages
// from the native bundle.
//
// Extends Expo's default config rather than replacing the transformer, so
// babel-preset-expo still runs (Expo sets a custom babelTransformerPath and
// react-native-svg-transformer chains onto it).
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The /expo entry, not the package root — it chains onto Expo's own
// transformer so the same .svg import works on iOS, Android and web.
config.transformer.babelTransformerPath = require.resolve(
  'react-native-svg-transformer/expo'
);

// .svg moves out of assets and into source so it resolves as a component.
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// ─── Block web-only packages from the native bundle ───────────────────────────
//
// `azure-maps-control` and its transitive dependency `@mapbox/mapbox-gl-supported`
// call `URL.createObjectURL()` at module-evaluation time — a browser-only API
// that doesn't exist in React Native's JS environment.  If either package lands
// in the native bundle the app crashes on launch with:
//
//   JavascriptException: [runtime not ready]:
//     TypeError: undefined is not a function (createObjectURL)
//
// These packages are only used by `MapViewComponent/index.web.tsx`.
// Metro should resolve `index.native.tsx` first for native targets, but this
// blockList is a hard safety net against any future accidental import path.
//
// NOTE: This blockList only applies to the native Metro bundler.  The Expo
// web export (npx expo export --platform web) uses a separate bundler pass
// and is unaffected — azure-maps-control works fine on the web build.
const WEB_ONLY_PACKAGES = [
  'azure-maps-control',
  '@mapbox/mapbox-gl-supported',
  '@mapbox/unitbezier',
  '@mapbox/jsonlint-lines-primitives',
];

// Build regex patterns that match any path inside these packages
const blockListPatterns = WEB_ONLY_PACKAGES.map(
  (pkg) =>
    new RegExp(
      // Escape @ and / for use in regex, match node_modules/<pkg>/...
      `node_modules[/\\\\]${pkg
        .replace(/@/g, '@')
        .replace(/\//g, '[/\\\\]')}[/\\\\]`
    )
);

// Merge with any existing blockList Expo may have set
const existingBlockList = config.resolver.blockList;
if (existingBlockList) {
  config.resolver.blockList = Array.isArray(existingBlockList)
    ? [...existingBlockList, ...blockListPatterns]
    : [existingBlockList, ...blockListPatterns];
} else {
  config.resolver.blockList = blockListPatterns;
}

module.exports = config;
