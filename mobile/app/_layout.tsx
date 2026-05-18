import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Syne_400Regular, Syne_700Bold, Syne_800ExtraBold } from '@expo-google-fonts/syne';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { store } from '../src/store';
import { setCredentials } from '../src/store/slices/authSlice';
import { screenTimeEmitter } from '../modules/screen-time/ScreenTimeModule';
import { recordAppOverride } from '../src/api/blockingApi';
import { endDetoxSession } from '../src/api/detoxApi';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)/login',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [loaded, error] = useFonts({
    Syne: Syne_400Regular,
    'Syne-Bold': Syne_700Bold,
    'Syne-ExtraBold': Syne_800ExtraBold,
    'DM-Sans': DMSans_400Regular,
    'DM-Sans-Medium': DMSans_500Medium,
    'DM-Sans-Bold': DMSans_700Bold,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          // In a real app, you'd verify the token or fetch the user profile here
          // For now, we'll assume it's valid to demonstrate auto-login
          store.dispatch(setCredentials({ 
            user: { id: '1', name: 'User', email: 'user@example.com', total_points: 0, level: 1 }, 
            accessToken: token, 
            refreshToken: '' 
          }));
        }
      } catch (e) {
        console.error('Failed to load auth state', e);
      } finally {
        if (loaded || error) {
          SplashScreen.hideAsync();
        }
      }
    };

    checkAuth();
  }, [loaded, error]);

  // Listen for native app override events and detox session events
  useEffect(() => {
    if (!screenTimeEmitter) return;

    const overrideSub = screenTimeEmitter.addListener(
      'onAppOverridden',
      (event: { packageName: string }) => {
        if (event && event.packageName) {
          console.log('[RootLayout] App overridden:', event.packageName);
          recordAppOverride(event.packageName);
        }
      }
    );

    const brokenSub = screenTimeEmitter.addListener(
      'onDetoxBroken',
      async () => {
        console.log('[RootLayout] Detox broken by user');
        const sessionId = await AsyncStorage.getItem('activeDetoxSessionId');
        if (sessionId) {
          await endDetoxSession(sessionId, 1);
          await AsyncStorage.removeItem('activeDetoxSessionId');
        }
        // 5.2.3 Start 15-minute cooldown
        const cooldownUntil = Date.now() + 15 * 60 * 1000;
        await AsyncStorage.setItem('detoxCooldownUntil', String(cooldownUntil));
      }
    );

    const finishedSub = screenTimeEmitter.addListener(
      'onDetoxFinished',
      async () => {
        console.log('[RootLayout] Detox session completed');
        const sessionId = await AsyncStorage.getItem('activeDetoxSessionId');
        if (sessionId) {
          await endDetoxSession(sessionId, 0);
          await AsyncStorage.removeItem('activeDetoxSessionId');
        }
      }
    );

    return () => {
      overrideSub.remove();
      brokenSub.remove();
      finishedSub.remove();
    };
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={DarkTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
