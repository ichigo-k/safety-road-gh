// Metro config — adds SVG-as-component support.
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

module.exports = config;
