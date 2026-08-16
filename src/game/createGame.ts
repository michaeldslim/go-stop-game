import type { AiDifficulty } from '../types/game';
import type { MatgoGameState, PlayerState, TableCard } from '../types/gameState';
import { MATGO_TARGET_SCORE } from './constants';
import { chooseDealer, dealMatgo2P } from './deal';
import { createDeck, defaultRng, shuffleDeck, type Rng } from './deck';

export interface CreateMatgoGameOptions {
  aiDifficulty: AiDifficulty;
  rng?: Rng;
}

function createPlayer(id: string, name: string, isHuman: boolean, hand: string[]): PlayerState {
  return {
    id,
    name,
    isHuman,
    hand,
    collected: [],
    goCount: 0,
    score: 0,
  };
}

function toTableCards(cardIds: string[]): TableCard[] {
  return cardIds.map((cardId) => ({ cardId }));
}

/**
 * Full matgo setup: shuffle → dealer draw → reshuffle → deal.
 * players[0] = human, players[1] = AI.
 */
export function createMatgoGame({ aiDifficulty, rng = defaultRng }: CreateMatgoGameOptions): MatgoGameState {
  const initialDeck = shuffleDeck(createDeck(), rng);
  const { dealerIndex } = chooseDealer(initialDeck);
  const shuffledDeck = shuffleDeck(createDeck(), rng);
  const deal = dealMatgo2P(shuffledDeck, dealerIndex);

  const players: [PlayerState, PlayerState] = [
    createPlayer('human', 'You', true, deal.hands[0]),
    createPlayer('ai', 'AI', false, deal.hands[1]),
  ];

  return {
    phase: 'playing',
    mode: 'matgo',
    aiDifficulty,
    players,
    table: toTableCards(deal.table),
    deck: deal.deck,
    currentPlayerIndex: dealerIndex,
    targetScore: MATGO_TARGET_SCORE,
    dealerIndex,
    pendingAction: null,
    statusMessage: dealerIndex === 0 ? 'Your turn — play a card' : 'AI is playing…',
    lastFlippedCardId: null,
    soundEffects: [],
  };
}

export function getHumanPlayer(game: MatgoGameState): PlayerState {
  return game.players[0];
}

export function getAiPlayer(game: MatgoGameState): PlayerState {
  return game.players[1];
}

export function getTableCardIds(game: MatgoGameState): string[] {
  return game.table.map((tableCard) => tableCard.cardId);
}
