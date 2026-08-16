import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OptionPicker } from '../src/components/OptionPicker';
import { ScreenHeader } from '../src/components/ScreenHeader';
import {
  AI_DIFFICULTY_OPTIONS,
  GAME_MODE_OPTIONS,
  getLocalizedText,
} from '../src/constants/gameOptions';
import { colors } from '../src/constants/colors';
import { useTranslation } from '../src/i18n/useTranslation';
import { useSettings } from '../src/settings/SettingsProvider';
import type { AiDifficulty, GameMode } from '../src/types/game';

export default function SetupScreen() {
  const router = useRouter();
  const { settings, loaded } = useSettings();
  const { t, language } = useTranslation();

  const [mode, setMode] = useState<GameMode>(settings.defaultGameMode);
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>(settings.defaultAiDifficulty);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    setMode(settings.defaultGameMode);
    setAiDifficulty(settings.defaultAiDifficulty);
  }, [loaded, settings.defaultGameMode, settings.defaultAiDifficulty]);

  const startGame = () => {
    router.push({
      pathname: '/game',
      params: {
        mode,
        difficulty: aiDifficulty,
      },
    });
  };

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={t('setup.title')}
        subtitle={t('setup.subtitle')}
        onBack={() => router.back()}
        backLabel={t('common.home')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <OptionPicker<GameMode>
          label={t('setup.gameMode')}
          value={mode}
          onChange={setMode}
          options={GAME_MODE_OPTIONS.map((option) => ({
            value: option.value,
            title: getLocalizedText(language, option.labels),
            subtitle: getLocalizedText(language, option.description),
            disabled: option.comingSoon,
            badge: option.comingSoon ? t('setup.comingSoon') : undefined,
          }))}
        />

        <OptionPicker<AiDifficulty>
          label={t('setup.aiDifficulty')}
          value={aiDifficulty}
          onChange={setAiDifficulty}
          options={AI_DIFFICULTY_OPTIONS.map((option) => ({
            value: option.value,
            title: getLocalizedText(language, option.labels),
            subtitle: getLocalizedText(language, option.description),
          }))}
        />

        <Pressable style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>{t('setup.start')}</Text>
        </Pressable>

        <Pressable style={styles.settingsLink} onPress={() => router.push('/settings')}>
          <Text style={styles.settingsLinkText}>{t('setup.changeDefaults')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.felt,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 28,
  },
  startButton: {
    backgroundColor: colors.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  startButtonText: {
    color: colors.felt,
    fontSize: 18,
    fontWeight: '700',
  },
  settingsLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingsLinkText: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: '600',
  },
});
