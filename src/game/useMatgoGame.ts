import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useGameSounds } from '../audio/useGameSounds';
import { useSettings } from '../settings/SettingsProvider';
import { createMatgoGame } from './createGame';
import { runAiTurn } from './ai';
import {
  canChooseTableIndex,
  canPlayHandCard,
  chooseTableForPending,
  getPlayableHandCardIds,
  isAiTurn,
  isHumanTurn,
  needsHumanTableChoice,
  playHandCard,
} from './turnEngine';
import type { AiDifficulty } from '../types/game';
import type { CardId, MatgoGameState } from '../types/gameState';

type GameReducerAction =
  | { type: 'PLAY_HAND'; handCardId: CardId }
  | { type: 'CHOOSE_TABLE'; tableIndex: number }
  | { type: 'AI_TURN' };

function gameReducer(state: MatgoGameState, action: GameReducerAction): MatgoGameState {
  switch (action.type) {
    case 'PLAY_HAND':
      return playHandCard(state, action.handCardId);
    case 'CHOOSE_TABLE':
      return chooseTableForPending(state, action.tableIndex);
    case 'AI_TURN':
      return runAiTurn(state);
    default:
      return state;
  }
}

export function useMatgoGame(aiDifficulty: AiDifficulty) {
  const { settings } = useSettings();
  const { playEffects } = useGameSounds(settings.soundEnabled);

  const initialState = useMemo(
    () => createMatgoGame({ aiDifficulty }),
    [aiDifficulty],
  );

  const [game, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    if (game.soundEffects.length === 0) {
      return;
    }

    void playEffects(game.soundEffects);
  }, [game.soundEffects, playEffects]);

  const playCard = useCallback((handCardId: CardId) => {
    if (canPlayHandCard(game, handCardId)) {
      dispatch({ type: 'PLAY_HAND', handCardId });
    }
  }, [game]);

  const chooseTable = useCallback((tableIndex: number) => {
    if (canChooseTableIndex(game, tableIndex)) {
      dispatch({ type: 'CHOOSE_TABLE', tableIndex });
    }
  }, [game]);

  useEffect(() => {
    if (!isAiTurn(game)) {
      return;
    }

    const timer = setTimeout(() => {
      dispatch({ type: 'AI_TURN' });
    }, 700);

    return () => clearTimeout(timer);
  }, [game]);

  return {
    game,
    playCard,
    chooseTable,
    playableHandCardIds: getPlayableHandCardIds(game),
    isHumanTurn: isHumanTurn(game),
    needsTableChoice: needsHumanTableChoice(game),
  };
}
