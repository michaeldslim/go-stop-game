import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OptionPicker } from '../src/components/OptionPicker';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SettingsToggleRow } from '../src/components/SettingsToggleRow';
import { SettingsVolumeSlider } from '../src/components/SettingsVolumeSlider';
import {
  AI_DIFFICULTY_OPTIONS,
  GAME_MODE_OPTIONS,
  GAME_SPEED_OPTIONS,
  getLocalizedText,
  LANGUAGE_OPTIONS,
} from '../src/constants/gameOptions';
import { colors } from '../src/constants/colors';
import { useTranslation } from '../src/i18n/useTranslation';
import { useGameSounds } from '../src/audio/GameSoundsProvider';
import { useSettings } from '../src/settings/SettingsProvider';
import type { AiDifficulty, AppLanguage, GameMode, GameSpeed } from '../src/types/game';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const { t, language } = useTranslation();
  const { previewAtVolume } = useGameSounds();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={t('settings.title')}
        onBack={() => router.back()}
        backLabel={t('common.back')}
      />

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

        <OptionPicker<GameSpeed>
          label={t('settings.gameSpeed')}
          value={settings.gameSpeed}
          onChange={(value) => updateSettings({ gameSpeed: value })}
          options={GAME_SPEED_OPTIONS.map((option) => ({
            value: option.value,
            title: getLocalizedText(language, option.labels),
            subtitle: getLocalizedText(language, option.description),
          }))}
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.gameplay')}</Text>
          <SettingsToggleRow
            label={t('career.modeLabel')}
            description={t('career.modeDesc')}
            value={settings.careerModeEnabled}
            onValueChange={(value) => updateSettings({ careerModeEnabled: value })}
          />
          {settings.careerModeEnabled ? (
            <View style={styles.careerBlock}>
              <Text style={styles.careerRules}>{t('career.rulesSnippet')}</Text>
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push({ pathname: '/rules', params: { section: 'career' } })}
              >
                <Text style={styles.careerLink}>{t('career.rulesLink')}</Text>
              </Pressable>
            </View>
          ) : null}
          <SettingsToggleRow
            label={t('settings.hints')}
            description={t('settings.hintsDesc')}
            value={settings.hintsEnabled}
            onValueChange={(value) => updateSettings({ hintsEnabled: value })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.feedback')}</Text>
          <SettingsToggleRow
            label={t('settings.sound')}
            description={t('settings.soundDesc')}
            value={settings.soundEnabled}
            onValueChange={(value) => updateSettings({ soundEnabled: value })}
          />
          <SettingsVolumeSlider
            label={t('settings.soundVolume')}
            value={settings.soundVolume}
            disabled={!settings.soundEnabled}
            onValueChange={(value) => updateSettings({ soundVolume: Math.round(value) })}
            onSlidingComplete={(value) => {
              const level = Math.round(value);
              updateSettings({ soundVolume: level });
              void previewAtVolume(level);
            }}
          />
          <SettingsToggleRow
            label={t('settings.haptics')}
            description={t('settings.hapticsDesc')}
            value={settings.hapticsEnabled}
            onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>v{appVersion}</Text>
          <Text style={styles.credit}>{t('settings.credit')}</Text>
        </View>
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
  careerBlock: {
    gap: 8,
    paddingHorizontal: 4,
  },
  careerRules: {
    color: colors.cream,
    opacity: 0.75,
    fontSize: 13,
    lineHeight: 20,
  },
  careerLink: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 8,
    gap: 0,
  },
  version: {
    color: colors.cream,
    opacity: 0.7,
    fontSize: 13,
    textAlign: 'center',
  },
  credit: {
    color: colors.cream,
    opacity: 0.55,
    fontSize: 13,
    textAlign: 'center',
  },
});
