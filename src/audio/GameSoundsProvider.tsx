import {
  useAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  preload,
  type AudioPlayer,
} from 'expo-audio';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useSettings } from '../settings/SettingsProvider';
import { playerVolumeFromSetting } from '../types/game';
import type { GameSoundEffect } from '../types/gameState';

const SOUND_ASSETS = {
  playCard: require('../../assets/sounds/card.mp3'),
  flipCard: require('../../assets/sounds/gather-short.mp3'),
  yaku: require('../../assets/sounds/gather-long.mp3'),
  goStop: require('../../assets/sounds/wow.mp3'),
} as const;

const EFFECT_GAP_MS = 90;

for (const source of Object.values(SOUND_ASSETS)) {
  void preload(source);
}

interface GameSoundsContextValue {
  playEffects: (effects: GameSoundEffect[]) => void;
  previewAtVolume: (level: number) => void;
}

const GameSoundsContext = createContext<GameSoundsContextValue | null>(null);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function configureAudioSession(): Promise<void> {
  await setIsAudioActiveAsync(true);
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: false,
    interruptionMode: 'mixWithOthers',
  });
}

function playEffectSound(player: AudioPlayer, volume: number): void {
  try {
    player.muted = false;
    player.volume = volume;

    if (player.playing) {
      player.pause();
      // Do not await seekTo — on Android it briefly clears isLoaded and stalls playback.
      void player.seekTo(0);
    } else if (player.currentTime > 0) {
      void player.seekTo(0);
    }

    player.play();
  } catch {
    // SharedObject released or not ready — skip
  }
}

export function GameSoundsProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const soundVolumeRef = useRef(settings.soundVolume);
  const soundEnabledRef = useRef(settings.soundEnabled);
  soundVolumeRef.current = settings.soundVolume;
  soundEnabledRef.current = settings.soundEnabled;

  const cardPlayer = useAudioPlayer(SOUND_ASSETS.playCard, { downloadFirst: true });
  const flipPlayer = useAudioPlayer(SOUND_ASSETS.flipCard, { downloadFirst: true });
  const yakuPlayer = useAudioPlayer(SOUND_ASSETS.yaku, { downloadFirst: true });
  const goStopPlayer = useAudioPlayer(SOUND_ASSETS.goStop, { downloadFirst: true });

  const players = useMemo(
    (): Record<GameSoundEffect, AudioPlayer> => ({
      playCard: cardPlayer,
      flipCard: flipPlayer,
      yaku: yakuPlayer,
      goStop: goStopPlayer,
    }),
    [cardPlayer, flipPlayer, yakuPlayer, goStopPlayer],
  );

  useEffect(() => {
    void configureAudioSession();
  }, []);

  const playEffects = useCallback(
    (effects: GameSoundEffect[]) => {
      if (!soundEnabledRef.current || effects.length === 0) {
        return;
      }

      void (async () => {
        const volume = playerVolumeFromSetting(soundVolumeRef.current);

        for (let index = 0; index < effects.length; index += 1) {
          playEffectSound(players[effects[index]], volume);
          if (index < effects.length - 1) {
            await delay(EFFECT_GAP_MS);
          }
        }
      })();
    },
    [players],
  );

  const previewAtVolume = useCallback(
    (level: number) => {
      if (!soundEnabledRef.current) {
        return;
      }

      void configureAudioSession();
      playEffectSound(players.playCard, playerVolumeFromSetting(level));
    },
    [players],
  );

  const value = useMemo(
    () => ({
      playEffects,
      previewAtVolume,
    }),
    [playEffects, previewAtVolume],
  );

  return <GameSoundsContext.Provider value={value}>{children}</GameSoundsContext.Provider>;
}

export function useGameSounds(): GameSoundsContextValue {
  const context = useContext(GameSoundsContext);
  if (!context) {
    throw new Error('useGameSounds must be used within GameSoundsProvider');
  }
  return context;
}
