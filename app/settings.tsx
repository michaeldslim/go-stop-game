import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OptionPicker } from '../src/components/OptionPicker';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SettingsToggleRow } from '../src/components/SettingsToggleRow';
import {
  AI_DIFFICULTY_OPTIONS,
  GAME_MODE_OPTIONS,
  getLocalizedText,
  LANGUAGE_OPTIONS,
} from '../src/constants/gameOptions';
import { colors } from '../src/constants/colors';
import { useSettings } from '../src/settings/SettingsProvider';
import type { AiDifficulty, AppLanguage, GameMode } from '../src/types/game';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const { language } = settings;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Settings" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
        <OptionPicker<AppLanguage>
          label={language === 'ko' ? '언어' : 'Language'}
          value={settings.language}
          onChange={(value) => updateSettings({ language: value })}
          options={LANGUAGE_OPTIONS.map((option) => ({
            value: option.value,
            title: option.labels[option.value],
          }))}
        />

        <OptionPicker<AiDifficulty>
          label={language === 'ko' ? '기본 AI 난이도' : 'Default AI Difficulty'}
          value={settings.defaultAiDifficulty}
          onChange={(value) => updateSettings({ defaultAiDifficulty: value })}
          options={AI_DIFFICULTY_OPTIONS.map((option) => ({
            value: option.value,
            title: getLocalizedText(language, option.labels),
            subtitle: getLocalizedText(language, option.description),
          }))}
        />

        <OptionPicker<GameMode>
          label={language === 'ko' ? '기본 게임 모드' : 'Default Game Mode'}
          value={settings.defaultGameMode}
          onChange={(value) => updateSettings({ defaultGameMode: value })}
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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {language === 'ko' ? '피드백' : 'Feedback'}
          </Text>
          <SettingsToggleRow
            label={language === 'ko' ? '효과음' : 'Sound Effects'}
            description={language === 'ko' ? '카드 뒤집기, 매칭, 고/스톱' : 'Card flip, match, Go/Stop'}
            value={settings.soundEnabled}
            onValueChange={(value) => updateSettings({ soundEnabled: value })}
          />
          <SettingsToggleRow
            label={language === 'ko' ? '햅틱' : 'Haptics'}
            description={language === 'ko' ? '매칭 및 고 선언 시 진동' : 'Vibration on match and Go'}
            value={settings.hapticsEnabled}
            onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
          />
        </View>

        <Text style={styles.credit}>
          {language === 'ko'
            ? '카드 아트: Wikimedia Commons (CC BY-SA 4.0)'
            : 'Card art: Wikimedia Commons (CC BY-SA 4.0)'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.felt,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 28,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  credit: {
    color: colors.cream,
    opacity: 0.55,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});
