import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

const App = Platform.OS === 'web'
  ? require('./App.web').default
  : require('./App').default;

registerRootComponent(App);
