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
import { useTranslation } from '../src/i18n/useTranslation';
import { useSettings } from '../src/settings/SettingsProvider';
import type { AiDifficulty, AppLanguage, GameMode } from '../src/types/game';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const { t, language } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('settings.title')} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
        <OptionPicker<AppLanguage>
          label={t('settings.language')}
          value={settings.language}
          onChange={(value) => updateSettings({ language: value })}
          options={LANGUAGE_OPTIONS.map((option) => ({
            value: option.value,
            title: option.labels[option.value],
          }))}
        />

        <OptionPicker<AiDifficulty>
          label={t('setup.aiDifficulty')}
          value={settings.defaultAiDifficulty}
          onChange={(value) => updateSettings({ defaultAiDifficulty: value })}
          options={AI_DIFFICULTY_OPTIONS.map((option) => ({
            value: option.value,
            title: getLocalizedText(language, option.labels),
            subtitle: getLocalizedText(language, option.description),
          }))}
        />

        <OptionPicker<GameMode>
          label={t('setup.gameMode')}
          value={settings.defaultGameMode}
          onChange={(value) => updateSettings({ defaultGameMode: value })}
          options={GAME_MODE_OPTIONS.map((option) => ({
            value: option.value,
            title: getLocalizedText(language, option.labels),
            subtitle: getLocalizedText(language, option.description),
            disabled: option.comingSoon,
            badge: option.comingSoon ? t('setup.comingSoon') : undefined,
          }))}
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.feedback')}</Text>
          <SettingsToggleRow
            label={t('settings.sound')}
            description={t('settings.soundDesc')}
            value={settings.soundEnabled}
            onValueChange={(value) => updateSettings({ soundEnabled: value })}
          />
          <SettingsToggleRow
            label={t('settings.haptics')}
            description={t('settings.hapticsDesc')}
            value={settings.hapticsEnabled}
            onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
          />
        </View>

        <Text style={styles.credit}>{t('settings.credit')}</Text>
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
