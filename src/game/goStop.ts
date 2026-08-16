import type { AiDifficulty } from '../types/game';
import type { MatgoGameState, PlayerIndex } from '../types/gameState';
import { syncPlayerScore } from './scoring';
import { cloneGameState } from './gameUtils';

export function refreshPlayerScores(state: MatgoGameState): MatgoGameState {
  const players = state.players.map((player) => ({
    ...player,
    score: syncPlayerScore(
      player.collected,
      player.goCount,
      player.bonusPi,
      player.flexCardRoles,
      state.mode,
    ),
  }));
  return { ...state, players };
}

export function canPromptGoStop(state: MatgoGameState, playerIndex: PlayerIndex): boolean {
  if (state.mode === 'hwatu') {
    return false;
  }

  const player = state.players[playerIndex];
  if (player.score < state.targetScore) {
    return false;
  }

  if (player.scoreAtLastGo === null) {
    return true;
  }

  return player.score > player.scoreAtLastGo;
}

export function shouldAiGo(state: MatgoGameState, playerIndex: PlayerIndex): boolean {
  const player = state.players[playerIndex];
  const margin = player.score - state.targetScore;
  const difficulty = state.aiDifficulty;

  switch (difficulty) {
    case 'beginner':
      return false;
    case 'intermediate':
      return margin >= 3 && player.goCount === 0;
    case 'advanced':
      return margin >= 2 || (player.goCount === 0 && margin >= 1);
    case 'expert':
      return margin >= 1 && player.goCount < 2;
    default:
      return false;
  }
}

export function declareStop(state: MatgoGameState, playerIndex: PlayerIndex): MatgoGameState {
  const next = refreshPlayerScores(cloneGameState(state));
  const player = next.players[playerIndex];
  return {
    ...next,
    phase: 'finished',
    goStopPlayerIndex: null,
    winnerIndex: playerIndex,
    finishReason: 'stop',
    pendingAction: null,
    statusMessage: player.isHuman ? 'You called Stop — you win!' : `${player.name} called Stop — wins`,
  };
}

export function declareGo(state: MatgoGameState, playerIndex: PlayerIndex): MatgoGameState {
  const next = refreshPlayerScores(cloneGameState(state));
  const players = [...next.players];
  const player = players[playerIndex];
  const newGoCount = player.goCount + 1;
  players[playerIndex] = {
    ...player,
    goCount: newGoCount,
    scoreAtLastGo: player.score,
    score: syncPlayerScore(
      player.collected,
      newGoCount,
      player.bonusPi,
      player.flexCardRoles,
      state.mode,
    ),
  };

  const updatedPlayer = players[playerIndex];
  return {
    ...next,
    players,
    phase: 'playing',
    goStopPlayerIndex: null,
    statusMessage: updatedPlayer.isHuman
      ? `Go! (${updatedPlayer.goCount}고) — keep playing`
      : `${updatedPlayer.name} called Go (${updatedPlayer.goCount}고)`,
  };
}

export function resolveGoStopForAi(state: MatgoGameState): MatgoGameState {
  const playerIndex = state.goStopPlayerIndex;
  if (playerIndex === null) {
    return state;
  }

  return shouldAiGo(state, playerIndex)
    ? declareGo(state, playerIndex)
    : declareStop(state, playerIndex);
}

export function maybePromptGoStop(
  state: MatgoGameState,
  playerIndex: PlayerIndex,
): MatgoGameState {
  const withScores = refreshPlayerScores(state);

  if (!canPromptGoStop(withScores, playerIndex)) {
    return withScores;
  }

  const player = withScores.players[playerIndex];

  if (!player.isHuman) {
    return shouldAiGo(withScores, playerIndex)
      ? declareGo(withScores, playerIndex)
      : declareStop(withScores, playerIndex);
  }

  return {
    ...withScores,
    phase: 'goStopPrompt',
    goStopPlayerIndex: playerIndex,
    statusMessage: `You reached ${player.score} points — Go or Stop?`,
  };
}

function findWinningPlayerIndex(state: MatgoGameState): PlayerIndex | null {
  let bestIndex: PlayerIndex | null = null;
  let bestScore = state.targetScore - 1;

  for (let index = 0; index < state.players.length; index += 1) {
    const player = state.players[index];
    if (player.score >= state.targetScore && player.score > bestScore) {
      bestScore = player.score;
      bestIndex = index;
    } else if (player.score >= state.targetScore && player.score === bestScore && bestIndex !== null) {
      // Tie at target — higher score wins, if equal keep first found
    }
  }

  if (bestIndex !== null) {
    return bestIndex;
  }

  // Hands empty fallback — highest score
  let highestIndex = 0;
  let highestScore = state.players[0].score;
  for (let index = 1; index < state.players.length; index += 1) {
    if (state.players[index].score > highestScore) {
      highestScore = state.players[index].score;
      highestIndex = index;
    }
  }

  if (highestScore >= state.targetScore) {
    return highestIndex;
  }

  return null;
}

export function finishHandsEmpty(state: MatgoGameState): MatgoGameState {
  const next = refreshPlayerScores(cloneGameState(state));
  const winnerIndex = findWinningPlayerIndex(next);

  if (winnerIndex !== null) {
    const winner = next.players[winnerIndex];
    return {
      ...next,
      phase: 'finished',
      winnerIndex,
      finishReason: 'handsEmpty',
      statusMessage: winner.isHuman
        ? 'Hand over — you win on points'
        : `${winner.name} wins on points`,
    };
  }

  return {
    ...next,
    phase: 'finished',
    winnerIndex: null,
    finishReason: 'nagari',
    statusMessage: '나가리 — no one reached target',
  };
}

export function getAiGoStopLabel(difficulty: AiDifficulty, language: 'en' | 'ko'): string {
  const labels: Record<AiDifficulty, { en: string; ko: string }> = {
    beginner: { en: 'Stops early', ko: '일찍 스톱' },
    intermediate: { en: 'Balanced Go/Stop', ko: '균형 고/스톱' },
    advanced: { en: 'Aggressive Go', ko: '공격적 고' },
    expert: { en: 'Optimal Go/Stop', ko: '최적 고/스톱' },
  };
  return labels[difficulty][language];
}
