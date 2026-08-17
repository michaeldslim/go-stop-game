import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SETTINGS, SOUND_VOLUME_MAX, SOUND_VOLUME_MIN, type AppSettings, type GameSpeed } from '../types/game';

const STORAGE_KEY = '@hwatu/settings';

type StoredSettings = Partial<AppSettings> & {
  soundVolumes?: Partial<Record<'playCard' | 'flipCard' | 'yaku' | 'goStop', number>>;
};

function resolveSoundVolume(parsed: StoredSettings): number {
  const raw =
    parsed.soundVolume ??
    parsed.soundVolumes?.playCard ??
    DEFAULT_SETTINGS.soundVolume;

  if (typeof raw !== 'number' || Number.isNaN(raw)) {
    return DEFAULT_SETTINGS.soundVolume;
  }

  return Math.max(SOUND_VOLUME_MIN, Math.min(SOUND_VOLUME_MAX, Math.round(raw)));
}

function resolveGameSpeed(parsed: StoredSettings): GameSpeed {
  if (parsed.gameSpeed === 'slow' || parsed.gameSpeed === 'medium' || parsed.gameSpeed === 'fast') {
    return parsed.gameSpeed;
  }
  return DEFAULT_SETTINGS.gameSpeed;
}

function loadSettings(raw: string | null): AppSettings {
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as StoredSettings;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      soundVolume: resolveSoundVolume(parsed),
      gameSpeed: resolveGameSpeed(parsed),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface SettingsContextValue {
  settings: AppSettings;
  loaded: boolean;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) {
          return;
        }

        setSettings(loadSettings(raw));
      })
      .finally(() => {
        if (!cancelled) {
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((previous) => {
      const next = { ...previous, ...patch };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      settings,
      loaded,
      updateSettings,
    }),
    [settings, loaded, updateSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
