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

// ─── Block web-only packages from the native bundle ───────────────────────
//
// `azure-maps-control` and its transitive `@mapbox/*` dependencies call
// `URL.createObjectURL()` at module-evaluation time — a browser-only API that
// doesn't exist in React Native's JS environment. If any of them land in the
// native bundle the app crashes on launch with:
//
//   JavascriptException: [runtime not ready]:
//     TypeError: undefined is not a function (createObjectURL)
//
// They are used only by `MapViewComponent/index.web.tsx`, which platform
// extensions already keep out of the native graph. This is the safety net for
// a future accidental import.
//
// It is enforced per-platform through `resolveRequest` rather than through
// `resolver.blockList`: blockList is global, so blocking these packages there
// also broke `expo export --platform web`, where they are legitimately needed.
const WEB_ONLY_PACKAGES = [
  'azure-maps-control',
  '@mapbox/mapbox-gl-supported',
  '@mapbox/unitbezier',
  '@mapbox/jsonlint-lines-primitives',
];

const NATIVE_PLATFORMS = new Set(['android', 'ios']);

const isWebOnlyPackage = (moduleName) =>
  WEB_ONLY_PACKAGES.some(
    (pkg) => moduleName === pkg || moduleName.startsWith(`${pkg}/`)
  );

// Metro passes the *default* resolver as `context.resolveRequest` inside a
// custom `resolveRequest`, so delegating there is not recursive.
const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (NATIVE_PLATFORMS.has(platform) && isWebOnlyPackage(moduleName)) {
    throw new Error(
      `[metro.config.js] "${moduleName}" is web-only and must never be ` +
        `imported from code that reaches the ${platform} bundle. It calls ` +
        `browser-only APIs at module load and crashes the app on launch. ` +
        `Move the import into a *.web.tsx file.`
    );
  }
  return (upstreamResolveRequest ?? context.resolveRequest)(
    context,
    moduleName,
    platform
  );
};

module.exports = config;
