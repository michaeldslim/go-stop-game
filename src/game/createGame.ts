import type { AiDifficulty, GameMode } from '../types/game';
import type { MatgoGameState, TableCard } from '../types/gameState';
import { createEmptyPlayerState } from '../types/gameState';
import {
  GOSTOP_PLAYER_COUNT,
  GOSTOP_TARGET_SCORE,
  MATGO_TARGET_SCORE,
} from './constants';
import { chooseDealer, dealGostop3P, dealHwatu2P, dealMatgo2P } from './deal';
import { createDeck, defaultRng, shuffleDeck, type Rng } from './deck';
import { applyTableStack, checkSpecialStart } from './specialStart';

export interface CreateGameOptions {
  mode: GameMode;
  aiDifficulty: AiDifficulty;
  handMultiplier?: number;
  rng?: Rng;
}

function toTableCards(cardIds: string[]): TableCard[] {
  return cardIds.map((cardId) => ({ cardId }));
}

const MAX_REDEALS = 25;

function buildGameState(
  mode: GameMode,
  aiDifficulty: AiDifficulty,
  deal: ReturnType<typeof dealMatgo2P>,
  handMultiplier: number,
): MatgoGameState {
  const { dealerIndex } = deal;
  const playerCount = deal.hands.length;

  const players =
    mode === 'gostop'
      ? [
          createEmptyPlayerState('human', 'You', true, deal.hands[0]),
          createEmptyPlayerState('ai1', 'AI 1', false, deal.hands[1]),
          createEmptyPlayerState('ai2', 'AI 2', false, deal.hands[2]),
        ]
      : [
          createEmptyPlayerState('human', 'You', true, deal.hands[0]),
          createEmptyPlayerState('ai', 'AI', false, deal.hands[1]),
        ];

  const targetScore =
    mode === 'gostop' ? GOSTOP_TARGET_SCORE : mode === 'hwatu' ? 0 : MATGO_TARGET_SCORE;

  return {
    phase: 'playing',
    mode,
    aiDifficulty,
    playerCount: playerCount as 2 | 3,
    players,
    table: toTableCards(deal.table),
    deck: deal.deck,
    currentPlayerIndex: dealerIndex,
    targetScore,
    dealerIndex,
    pendingAction: null,
    statusMessage:
      players[dealerIndex].isHuman ? 'Your turn — play a card' : 'AI is playing…',
    lastFlippedCardId: null,
    soundEffects: [],
    goStopPlayerIndex: null,
    winnerIndex: null,
    finishReason: null,
    handMultiplier,
    turnSpecialMoves: [],
  };
}

function dealForMode(mode: GameMode, shuffledDeck: string[], dealerIndex: number) {
  switch (mode) {
    case 'gostop':
      return dealGostop3P(shuffledDeck, dealerIndex);
    case 'hwatu':
      return dealHwatu2P(shuffledDeck, dealerIndex);
    default:
      return dealMatgo2P(shuffledDeck, dealerIndex);
  }
}

function playerCountForMode(mode: GameMode): number {
  return mode === 'gostop' ? GOSTOP_PLAYER_COUNT : 2;
}

export function createGame({
  mode,
  aiDifficulty,
  handMultiplier = 1,
  rng = defaultRng,
}: CreateGameOptions): MatgoGameState {
  const count = playerCountForMode(mode);

  for (let attempt = 0; attempt < MAX_REDEALS; attempt += 1) {
    const initialDeck = shuffleDeck(createDeck(), rng);
    const { dealerIndex } = chooseDealer(initialDeck, count);
    const shuffledDeck = shuffleDeck(createDeck(), rng);
    const deal = dealForMode(mode, shuffledDeck, dealerIndex);
    let state = buildGameState(mode, aiDifficulty, deal, handMultiplier);

    const special = checkSpecialStart(state);

    if (special.type === 'redeal') {
      continue;
    }

    if (special.type === 'stackTable') {
      state = {
        ...state,
        table: applyTableStack(state.table, special.tableIndices),
        statusMessage: `${special.month}월 3장 스택 — play begins`,
      };
      return state;
    }

    if (special.type === 'autoWin') {
      const winner = state.players[special.winnerIndex];
      return {
        ...state,
        phase: 'finished',
        winnerIndex: special.winnerIndex,
        finishReason: 'autoWin',
        statusMessage: winner.isHuman
          ? `You hold all 4 ${special.month}월 cards — automatic win!`
          : `${winner.name} holds all 4 ${special.month}월 cards — automatic win`,
      };
    }

    if (special.type === 'draw') {
      return {
        ...state,
        phase: 'finished',
        winnerIndex: null,
        finishReason: 'draw',
        statusMessage: 'Players hold 4 of a month — draw',
      };
    }

    return state;
  }

  const fallbackDeck = shuffleDeck(createDeck(), rng);
  const { dealerIndex } = chooseDealer(fallbackDeck, count);
  const shuffledDeck = shuffleDeck(createDeck(), rng);
  return buildGameState(mode, aiDifficulty, dealForMode(mode, shuffledDeck, dealerIndex), handMultiplier);
}

/** @deprecated Use createGame */
export function createMatgoGame(options: {
  aiDifficulty: AiDifficulty;
  rng?: Rng;
  handMultiplier?: number;
}): MatgoGameState {
  return createGame({
    mode: 'matgo',
    aiDifficulty: options.aiDifficulty,
    handMultiplier: options.handMultiplier,
    rng: options.rng,
  });
}

export function getHumanPlayer(game: MatgoGameState) {
  return game.players.find((player) => player.isHuman) ?? game.players[0];
}

export function getAiPlayer(game: MatgoGameState) {
  return game.players.find((player) => !player.isHuman) ?? game.players[1];
}

export function getTableCardIds(game: MatgoGameState): string[] {
  return game.table.map((tableCard) => tableCard.cardId);
}
