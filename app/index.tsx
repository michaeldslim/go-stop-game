import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/colors';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Image source={require('../assets/splash-icon.png')} style={styles.logo} contentFit="contain" />
        <Text style={styles.title}>Hwatu</Text>
        <Text style={styles.subtitle}>Korean Go-Stop Card Game</Text>
        <Text style={styles.korean}>화투 · 고스톱</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/setup')}>
          <Text style={styles.primaryButtonText}>Play</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/rules')}>
          <Text style={styles.secondaryButtonText}>How to Play</Text>
        </Pressable>
        <Pressable style={styles.tertiaryButton} onPress={() => router.push('/settings')}>
          <Text style={styles.tertiaryButtonText}>Settings</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.felt,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.gold,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: colors.cream,
    opacity: 0.9,
  },
  korean: {
    fontSize: 20,
    color: colors.cream,
    opacity: 0.75,
    marginTop: 4,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.red,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.cream,
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    color: colors.cream,
    opacity: 0.75,
    fontSize: 15,
    fontWeight: '600',
  },
});
