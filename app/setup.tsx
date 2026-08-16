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
import { useSettings } from '../src/settings/SettingsProvider';
import type { AiDifficulty, GameMode } from '../src/types/game';

export default function SetupScreen() {
  const router = useRouter();
  const { settings, loaded } = useSettings();
  const { language } = settings;

  const [mode, setMode] = useState<GameMode>(settings.defaultGameMode);
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>(settings.defaultAiDifficulty);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    setMode(settings.defaultGameMode === 'gostop' ? 'matgo' : settings.defaultGameMode);
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
        title={language === 'ko' ? '게임 설정' : 'Game Setup'}
        subtitle={
          language === 'ko'
            ? '모드와 AI 난이도를 선택하세요'
            : 'Choose mode and AI difficulty'
        }
        onBack={() => router.back()}
        backLabel={language === 'ko' ? '← 홈' : '← Home'}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <OptionPicker<GameMode>
          label={language === 'ko' ? '게임 모드' : 'Game Mode'}
          value={mode}
          onChange={setMode}
          options={GAME_MODE_OPTIONS.map((option) => ({
            value: option.value,
            title: getLocalizedText(language, option.labels),
            subtitle: getLocalizedText(language, option.description),
            disabled: option.comingSoon,
            badge: option.comingSoon
              ? language === 'ko'
                ? '준비 중'
                : 'Coming soon'
              : undefined,
          }))}
        />

        <OptionPicker<AiDifficulty>
          label={language === 'ko' ? 'AI 난이도' : 'AI Difficulty'}
          value={aiDifficulty}
          onChange={setAiDifficulty}
          options={AI_DIFFICULTY_OPTIONS.map((option) => ({
            value: option.value,
            title: getLocalizedText(language, option.labels),
            subtitle: getLocalizedText(language, option.description),
          }))}
        />

        <Pressable style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>
            {language === 'ko' ? '시작' : 'Start Game'}
          </Text>
        </Pressable>

        <Pressable style={styles.settingsLink} onPress={() => router.push('/settings')}>
          <Text style={styles.settingsLinkText}>
            {language === 'ko' ? '기본값 변경 (설정)' : 'Change defaults in Settings'}
          </Text>
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
    backgroundColor: colors.red,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  startButtonText: {
    color: colors.cream,
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
