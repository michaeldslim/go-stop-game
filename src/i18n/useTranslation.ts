import { useCallback } from 'react';
import { useSettings } from '../settings/SettingsProvider';
import { translate, type TranslationKey } from './translations';

export function useTranslation() {
  const { settings } = useSettings();
  const language = settings.language;

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language],
  );

  return { t, language };
}
