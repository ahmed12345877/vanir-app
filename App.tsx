import React, { useEffect, useMemo } from 'react';
import { StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { AppProviders } from './src/lib/trpc';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppLoadingScreen, RootNavigator } from './src/navigation/RootNavigator';
import { linking } from './src/navigation/linking';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { CatalogStoreProvider } from './src/context/CatalogStore';
import { usePushNotifications } from './src/hooks/usePushNotifications';

// Initialize i18n
import './src/lib/i18n';

/**
 * AppShell manages inner application state, layout initialization, theme integration,
 * splash screen transitions, FCM push notification registration, and deep linking navigation.
 *
 * @returns The main application navigation tree wrapped in navigation and status bar controls.
 */
function AppShell() {
  const { colors } = useTheme();
  const { isLoading } = useAuth();

  // Initialize and register real FCM push notifications
  usePushNotifications(true);

  useEffect(() => {
    // Hide native splash screen immediately when JS is ready for instant, seamless startup
    SplashScreen.hideAsync().catch(error => {
      console.warn('Failed to hide splash screen:', error);
    });
  }, []);

  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        primary: colors.primary,
        border: colors.border,
      },
    }),
    [colors],
  );

  if (isLoading) {
    return (
      <>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <AppLoadingScreen />
      </>
    );
  }

  return (
    <NavigationContainer
      theme={navigationTheme}
      linking={linking}
      fallback={<AppLoadingScreen />}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * Root Application component for Vanir Mobile.
 *
 * Configures top-level React context providers in proper dependency order:
 * SafeAreaProvider -> AppProviders (tRPC / React Query) -> ThemeProvider -> AuthProvider -> CatalogStoreProvider.
 *
 * @returns The root React component hierarchy.
 */
function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <ThemeProvider>
          <AuthProvider>
            <CatalogStoreProvider>
              <AppShell />
            </CatalogStoreProvider>
          </AuthProvider>
        </ThemeProvider>
      </AppProviders>
    </SafeAreaProvider>
  );
}

export default App;
