import type { CardDefinition } from './hwatu';
import type { AiDifficulty, GameMode } from './game';

export type CardId = string;
export type GamePhase = 'playing' | 'goStopPrompt' | 'finished';
export type PlayerIndex = number;

export type FinishReason = 'stop' | 'handsEmpty' | 'autoWin' | 'draw' | 'nagari';

export type GameSoundEffect = 'playCard' | 'flipCard' | 'collect';

export type SepCupRole = 'animal' | 'junk';

export type PendingAction =
  | {
      type: 'chooseHandMatch';
      playerIndex: PlayerIndex;
      handCardId: CardId;
      matchIndices: number[];
    }
  | {
      type: 'chooseFlipMatch';
      playerIndex: PlayerIndex;
      flippedCardId: CardId;
      matchIndices: number[];
    }
  | {
      type: 'chooseSepCupRole';
      playerIndex: PlayerIndex;
      cardId: CardId;
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
  /** Score when player last called Go — must exceed before next Go/Stop prompt */
  scoreAtLastGo: number | null;
  /** Pi won from opponents via special moves (쪽·따닥·싹쓸이·뻑·싼 것) */
  bonusPi: number;
  /** 2× from 흔들기 or 폭탄 when player wins */
  scoreMultiplier: number;
  /** Role for sep-animal-double (국화잔) — defaults to animal until chosen */
  sepCupRole: SepCupRole | null;
  /** Per-card flex role overrides (sep cup) */
  flexCardRoles: Partial<Record<CardId, SepCupRole>>;
}

export interface MatgoGameState {
  phase: GamePhase;
  mode: GameMode;
  aiDifficulty: AiDifficulty;
  playerCount: 2 | 3;
  players: PlayerState[];
  table: TableCard[];
  deck: CardId[];
  currentPlayerIndex: PlayerIndex;
  targetScore: number;
  dealerIndex: PlayerIndex;
  pendingAction: PendingAction | null;
  statusMessage: string;
  lastFlippedCardId: CardId | null;
  soundEffects: GameSoundEffect[];
  goStopPlayerIndex: PlayerIndex | null;
  winnerIndex: PlayerIndex | null;
  finishReason: FinishReason | null;
  /** 2× payout after 나가리 — applied to next hand settlement */
  handMultiplier: number;
  /** Special moves triggered this turn (for status messages) */
  turnSpecialMoves: string[];
}

export function createEmptyPlayerState(
  id: string,
  name: string,
  isHuman: boolean,
  hand: CardId[] = [],
): PlayerState {
  return {
    id,
    name,
    isHuman,
    hand,
    collected: [],
    goCount: 0,
    score: 0,
    scoreAtLastGo: null,
    bonusPi: 0,
    scoreMultiplier: 1,
    sepCupRole: null,
    flexCardRoles: {},
  };
}
