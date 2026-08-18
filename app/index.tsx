import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlayerAvatar } from '../src/components/PlayerAvatar';
import { getCareerProgressCopy } from '../src/career/careerLabels';
import { useCareer } from '../src/career/CareerProvider';
import { colors } from '../src/constants/colors';
import { CARD_BORDER_RADIUS } from '../src/constants/layout';
import { useTranslation } from '../src/i18n/useTranslation';
import { useSettings } from '../src/settings/SettingsProvider';

/** August bright (8월 광) — copied from assets/cards/3x/aug-bright.png */
const HOME_LOGO_WIDTH = 136;
const HOME_LOGO_HEIGHT = 222;

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { settings, loaded } = useSettings();
  const { careerState, loaded: careerLoaded } = useCareer();
  const careerBadge =
    settings.careerModeEnabled && careerLoaded
      ? getCareerProgressCopy(t, careerState).primary
      : null;

  const startGame = () => {
    if (!loaded) {
      return;
    }

    router.push({
      pathname: '/game',
      params: {
        mode: settings.defaultGameMode,
        difficulty: settings.defaultAiDifficulty,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <PlayerAvatar avatarId={settings.playerAvatarId} size="xl" style={styles.homeAvatar} />
        <Image
          source={require('../assets/home-logo.png')}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="August bright hwatu card"
        />
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{t('home.title')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
          {careerBadge ? (
            <Pressable accessibilityRole="button" onPress={() => router.push('/career')}>
              <Text style={styles.careerBadge}>{careerBadge}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.primaryButton, !loaded && styles.primaryButtonDisabled]}
          onPress={startGame}
          disabled={!loaded}
        >
          <Text style={styles.primaryButtonText}>{t('home.play')}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/rules')}>
          <Text style={styles.secondaryButtonText}>{t('home.howToPlay')}</Text>
        </Pressable>
        {settings.careerModeEnabled && careerLoaded ? (
          <Pressable style={styles.secondaryButton} onPress={() => router.push('/career')}>
            <Text style={styles.secondaryButtonText}>{t('home.career')}</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.tertiaryButton} onPress={() => router.push('/settings')}>
          <Text style={styles.tertiaryButtonText}>{t('home.settings')}</Text>
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
  homeAvatar: {
    marginBottom: 4,
  },
  logo: {
    width: HOME_LOGO_WIDTH,
    height: HOME_LOGO_HEIGHT,
    marginBottom: 8,
    borderRadius: CARD_BORDER_RADIUS,
  },
  titleGroup: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.gold,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.cream,
    opacity: 0.85,
    letterSpacing: 6,
  },
  careerBadge: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '700',
    color: colors.gold,
    letterSpacing: 0.5,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.felt,
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
    borderWidth: 1,
    borderColor: colors.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    color: colors.cream,
    opacity: 0.75,
    fontSize: 15,
    fontWeight: '600',
  },
});
