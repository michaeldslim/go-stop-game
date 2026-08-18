import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CareerProvider } from '../src/career/CareerProvider';
import { SettingsProvider } from '../src/settings/SettingsProvider';
import { GameSoundsProvider } from '../src/audio/GameSoundsProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <CareerProvider>
        <GameSoundsProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </GameSoundsProvider>
        </CareerProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
