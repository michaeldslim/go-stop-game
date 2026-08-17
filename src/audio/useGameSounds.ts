import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useCallback, useEffect } from 'react';
import type { GameSoundEffect } from '../types/gameState';

const SOUND_ASSETS = {
  playCard: require('../../assets/sounds/card.mp3'),
  flipCard: require('../../assets/sounds/gather-short.mp3'),
  yaku: require('../../assets/sounds/gather-long.mp3'),
} as const;

const EFFECT_GAP_MS = 90;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function useGameSounds(enabled: boolean) {
  const cardPlayer = useAudioPlayer(SOUND_ASSETS.playCard);
  const flipPlayer = useAudioPlayer(SOUND_ASSETS.flipCard);
  const yakuPlayer = useAudioPlayer(SOUND_ASSETS.yaku);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
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

      await player.seekTo(0);
      player.play();
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
