/**
 * @format
 */

import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerBackgroundMessageHandler } from './src/hooks/usePushNotifications';

// Register background push notification handler at module level
registerBackgroundMessageHandler();

AppRegistry.registerComponent(appName, () => App);
