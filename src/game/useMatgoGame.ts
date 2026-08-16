import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useSettings } from '../settings/SettingsProvider';
import { createGame } from './createGame';
import { runAiTurn } from './ai';
import { declareGo, declareStop } from './goStop';
import { nextHandMultiplier } from './settlement';
import {
  canChooseTableIndex,
  canPlayHandCard,
  chooseSepCupRole,
  chooseTableForPending,
  getPlayableHandCardIds,
  isAiTurn,
  isHumanTurn,
  needsHumanSepCupChoice,
  needsHumanTableChoice,
  playBomb,
  playHandCard,
} from './turnEngine';
import { declareBomb, declareShake, canDeclareBomb, canDeclareShake } from './specialMoves';
import { buildTurnSteps } from './turnSteps';
import { useTurnAnimation } from './useTurnAnimation';
import type { AiDifficulty, GameMode } from '../types/game';
import type { CardId, MatgoGameState, SepCupRole } from '../types/gameState';

type GameReducerAction =
  | { type: 'PLAY_HAND'; handCardId: CardId }
  | { type: 'CHOOSE_TABLE'; tableIndex: number }
  | { type: 'AI_TURN' }
  | { type: 'DECLARE_GO' }
  | { type: 'DECLARE_STOP' }
  | { type: 'DECLARE_SHAKE' }
  | { type: 'DECLARE_BOMB' }
  | { type: 'PLAY_BOMB' }
  | { type: 'CHOOSE_SEP_CUP'; role: SepCupRole }
  | { type: 'SYNC'; state: MatgoGameState };

function gameReducer(state: MatgoGameState, action: GameReducerAction): MatgoGameState {
  switch (action.type) {
    case 'PLAY_HAND':
      return playHandCard(state, action.handCardId);
    case 'CHOOSE_TABLE':
      return chooseTableForPending(state, action.tableIndex);
    case 'AI_TURN':
      return runAiTurn(state);
    case 'DECLARE_GO':
      return state.goStopPlayerIndex !== null
        ? declareGo(state, state.goStopPlayerIndex)
        : state;
    case 'DECLARE_STOP':
      return state.goStopPlayerIndex !== null
        ? declareStop(state, state.goStopPlayerIndex)
        : state;
    case 'DECLARE_SHAKE':
      return declareShake(state, state.currentPlayerIndex);
    case 'DECLARE_BOMB':
      return declareBomb(state, state.currentPlayerIndex);
    case 'PLAY_BOMB':
      return playBomb(state);
    case 'CHOOSE_SEP_CUP':
      return chooseSepCupRole(state, action.role);
    case 'SYNC':
      return action.state;
    default:
      return state;
  }
}

function winnerParam(game: MatgoGameState): string {
  if (game.finishReason === 'draw' || game.finishReason === 'nagari' || game.winnerIndex === null) {
    return 'draw';
  }
  return game.winnerIndex === 0 ? 'human' : 'ai';
}

function shouldAnimate(before: MatgoGameState, after: MatgoGameState): boolean {
  return buildTurnSteps(before, after).length > 0;
}

export function useMatgoGame(
  mode: GameMode,
  aiDifficulty: AiDifficulty,
  handMultiplier = 1,
) {
  const router = useRouter();
  const { settings } = useSettings();

  const initialState = useMemo(
    () => createGame({ mode, aiDifficulty, handMultiplier }),
    [mode, aiDifficulty, handMultiplier],
  );

  const [game, dispatch] = useReducer(gameReducer, initialState);
  const gameRef = useRef(game);
  gameRef.current = game;

  const {
    displayGame,
    isAnimating,
    animateTurn,
    setDisplayGame,
    activeFlight,
    onFlightComplete,
    inFlightCardId,
  } = useTurnAnimation({
    soundEnabled: settings.soundEnabled,
    hapticsEnabled: settings.hapticsEnabled,
  });

  const boardGame = displayGame ?? game;

  useEffect(() => {
    setDisplayGame(game);
  }, [game, setDisplayGame]);

  const dispatchAnimated = useCallback(
    async (action: GameReducerAction) => {
      if (
        action.type === 'SYNC' ||
        action.type === 'DECLARE_GO' ||
        action.type === 'DECLARE_STOP' ||
        action.type === 'DECLARE_SHAKE' ||
        action.type === 'DECLARE_BOMB'
      ) {
        dispatch(action);
        return;
      }

      const before = gameRef.current;
      const after = gameReducer(before, action);

      if (!shouldAnimate(before, after)) {
        dispatch(action);
        return;
      }

      await animateTurn(before, after);
      dispatch(action);
    },
    [animateTurn],
  );

  useEffect(() => {
    if (game.phase !== 'finished') {
      return;
    }

    const human = game.players[0];
    const opponents = game.players.filter((player) => !player.isHuman);

    router.replace({
      pathname: '/result',
      params: {
        mode: game.mode,
        difficulty: aiDifficulty,
        humanScore: String(human.score),
        humanCollected: human.collected.join(','),
        humanGoCount: String(human.goCount),
        humanBonusPi: String(human.bonusPi),
        winner: winnerParam(game),
        finishReason: game.finishReason ?? 'handsEmpty',
        handMultiplier: String(game.handMultiplier),
        nextHandMultiplier: String(nextHandMultiplier(game)),
        playerCount: String(game.playerCount),
        opponentScores: opponents.map((player) => String(player.score)).join('|'),
        opponentNames: opponents.map((player) => player.name).join('|'),
        opponentCollected: opponents.map((player) => player.collected.join(',')).join('|'),
        opponentGoCounts: opponents.map((player) => String(player.goCount)).join('|'),
        opponentBonusPi: opponents.map((player) => String(player.bonusPi)).join('|'),
        opponentScoreMultipliers: opponents.map((player) => String(player.scoreMultiplier)).join('|'),
        winnerIndex: game.winnerIndex !== null ? String(game.winnerIndex) : '',
      },
    });
  }, [game, aiDifficulty, router]);

  const playCard = useCallback(
    (handCardId: CardId) => {
      if (isAnimating || !canPlayHandCard(gameRef.current, handCardId)) {
        return;
      }
      void dispatchAnimated({ type: 'PLAY_HAND', handCardId });
    },
    [dispatchAnimated, isAnimating],
  );

  const chooseTable = useCallback(
    (tableIndex: number) => {
      if (isAnimating || !canChooseTableIndex(gameRef.current, tableIndex)) {
        return;
      }
      void dispatchAnimated({ type: 'CHOOSE_TABLE', tableIndex });
    },
    [dispatchAnimated, isAnimating],
  );

  const callGo = useCallback(() => {
    dispatch({ type: 'DECLARE_GO' });
  }, []);

  const callStop = useCallback(() => {
    dispatch({ type: 'DECLARE_STOP' });
  }, []);

  const callShake = useCallback(() => {
    dispatch({ type: 'DECLARE_SHAKE' });
  }, []);

  const callBomb = useCallback(() => {
    const current = gameRef.current;
    if (current.players[current.currentPlayerIndex].scoreMultiplier > 1) {
      void dispatchAnimated({ type: 'PLAY_BOMB' });
      return;
    }
    dispatch({ type: 'DECLARE_BOMB' });
  }, [dispatchAnimated]);

  const chooseSepCup = useCallback(
    (role: SepCupRole) => {
      dispatch({ type: 'CHOOSE_SEP_CUP', role });
    },
    [],
  );

  const humanIndex = game.players.findIndex((player) => player.isHuman);
  const canShake =
    isHumanTurn(boardGame) &&
    !isAnimating &&
    canDeclareShake(boardGame, boardGame.currentPlayerIndex) &&
    boardGame.players[boardGame.currentPlayerIndex].scoreMultiplier === 1;

  const canBomb =
    isHumanTurn(boardGame) &&
    !isAnimating &&
    canDeclareBomb(boardGame, boardGame.currentPlayerIndex);

  useEffect(() => {
    if (!isAiTurn(game) || isAnimating) {
      return;
    }

    const timer = setTimeout(() => {
      void dispatchAnimated({ type: 'AI_TURN' });
    }, 700);

    return () => clearTimeout(timer);
  }, [game, isAnimating, dispatchAnimated]);

  return {
    game: boardGame,
    playCard,
    chooseTable,
    callGo,
    callStop,
    callShake,
    callBomb,
    chooseSepCup,
    playableHandCardIds: getPlayableHandCardIds(boardGame),
    isHumanTurn: isHumanTurn(boardGame) && !isAnimating,
    needsTableChoice: needsHumanTableChoice(boardGame) && !isAnimating,
    showGoStopModal:
      game.phase === 'goStopPrompt' && game.goStopPlayerIndex === humanIndex,
    showSepCupModal: needsHumanSepCupChoice(boardGame) && !isAnimating,
    canShake,
    canBomb,
    isAnimating,
    activeFlight,
    onFlightComplete,
    inFlightCardId,
  };
}
