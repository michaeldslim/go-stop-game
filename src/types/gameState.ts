import type { CardDefinition } from './hwatu';
import type { AiDifficulty, GameMode } from './game';

export type CardId = string;
export type GamePhase = 'playing' | 'goStopPrompt' | 'finished';

export type GameSoundEffect = 'playCard' | 'flipCard' | 'collect';

export type PendingAction =
  | {
      type: 'chooseHandMatch';
      playerIndex: 0 | 1;
      handCardId: CardId;
      matchIndices: number[];
    }
  | {
      type: 'chooseFlipMatch';
      playerIndex: 0 | 1;
      flippedCardId: CardId;
      matchIndices: number[];
    };

/** Face-up card on the table; stacks group same-month 뻑 piles */
export interface TableCard {
  cardId: CardId;
  /** Cards stacked under this face-up card (same month, 뻑) */
  stackedCardIds?: CardId[];
}

export interface PlayerState {
  id: string;
  name: string;
  isHuman: boolean;
  hand: CardId[];
  collected: CardId[];
  goCount: number;
  score: number;
}

export interface MatgoGameState {
  phase: GamePhase;
  mode: GameMode;
  aiDifficulty: AiDifficulty;
  players: [PlayerState, PlayerState];
  table: TableCard[];
  deck: CardId[];
  currentPlayerIndex: 0 | 1;
  targetScore: number;
  dealerIndex: 0 | 1;
  pendingAction: PendingAction | null;
  statusMessage: string;
  lastFlippedCardId: CardId | null;
  soundEffects: GameSoundEffect[];
}
