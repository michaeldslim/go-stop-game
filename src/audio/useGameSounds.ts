import {
  useAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  type AudioPlayer,
} from 'expo-audio';
import { useCallback, useEffect } from 'react';
import type { GameSoundEffect } from '../types/gameState';

const SOUND_ASSETS = {
  playCard: require('../../assets/sounds/card.mp3'),
  flipCard: require('../../assets/sounds/gather-short.mp3'),
  yaku: require('../../assets/sounds/gather-long.mp3'),
} as const;

const EFFECT_GAP_MS = 90;
const LOAD_POLL_MS = 50;
const LOAD_WAIT_MS = 2500;

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
    interruptionMode: 'doNotMix',
  });
}

async function waitForLoaded(player: AudioPlayer): Promise<boolean> {
  if (player.isLoaded) {
    return true;
  }

  const start = Date.now();
  while (!player.isLoaded && Date.now() - start < LOAD_WAIT_MS) {
    await delay(LOAD_POLL_MS);
  }
  return player.isLoaded;
}

async function playLoadedPlayer(player: AudioPlayer): Promise<void> {
  if (!player.isLoaded) {
    return;
  }

  player.volume = 1;
  player.muted = false;

  if (player.playing) {
    player.pause();
  }

  try {
    await player.seekTo(0);
  } catch {
    // seekTo can fail on Android before the first successful play
  }

  player.play();
}

export function useGameSounds(enabled: boolean) {
  const cardPlayer = useAudioPlayer(SOUND_ASSETS.playCard, { downloadFirst: true });
  const flipPlayer = useAudioPlayer(SOUND_ASSETS.flipCard, { downloadFirst: true });
  const yakuPlayer = useAudioPlayer(SOUND_ASSETS.yaku, { downloadFirst: true });

  useEffect(() => {
    void configureAudioSession();
  }, []);

  const playEffect = useCallback(
    async (effect: GameSoundEffect) => {
      if (!enabled) {
        return;
      }

      const player =
        effect === 'playCard'
          ? cardPlayer
          : effect === 'flipCard'
            ? flipPlayer
            : yakuPlayer;

      if (!(await waitForLoaded(player))) {
        return;
      }

      await playLoadedPlayer(player);
    },
    [enabled, cardPlayer, flipPlayer, yakuPlayer],
  );

  const playEffects = useCallback(
    async (effects: GameSoundEffect[]) => {
      for (let index = 0; index < effects.length; index += 1) {
        await playEffect(effects[index]);
        if (index < effects.length - 1) {
          await delay(EFFECT_GAP_MS);
        }
      }
    },
    [playEffect],
  );

  return { playEffects };
}
