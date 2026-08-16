import { getCardById } from '../cards/getCardById';
import type { CardId, MatgoGameState, PlayerIndex, PlayerState } from '../types/gameState';
import { calculateScore, calculateHwatuSimpleScore, type ScoreBreakdown } from './scoring';
import { opponentIndices } from './gameUtils';
import { countCollectedBrights, countCollectedPi, settleGoBak } from './specialMoves';

export interface SettlementLine {
  key: string;
  labelEn: string;
  labelKo: string;
  multiplier: number;
  amount: number;
}

export interface PlayerSettlement {
  playerIndex: PlayerIndex;
  baseScore: number;
  totalChips: number;
  lines: SettlementLine[];
  goBakVictim: boolean;
  piBak: boolean;
  gwangBak: boolean;
}

export interface GameSettlement {
  winnerIndex: PlayerIndex;
  handMultiplier: number;
  players: PlayerSettlement[];
  /** Human net chips vs all AI (positive = human gains) */
  humanNetChips: number;
}

function scoreBreakdownForPlayer(player: PlayerState, mode: MatgoGameState['mode']): ScoreBreakdown | null {
  if (mode === 'hwatu') {
    const total = calculateHwatuSimpleScore(player.collected, player.flexCardRoles);
    return {
      bright: 0,
      animal: 0,
      ribbon: 0,
      junk: 0,
      godori: 0,
      hongdan: 0,
      cheongdan: 0,
      chodan: 0,
      baseTotal: total,
      animalMultiplier: 1,
      goBonus: 0,
      goMultiplier: 1,
      total,
    };
  }

  return calculateScore(player.collected, player.goCount, player.bonusPi, player.flexCardRoles);
}

function applyWinnerMultipliers(
  baseScore: number,
  player: PlayerState,
  handMultiplier: number,
): number {
  return baseScore * player.scoreMultiplier * handMultiplier;
}

function settlePair(
  state: MatgoGameState,
  winnerIndex: PlayerIndex,
  loserIndex: PlayerIndex,
  goBakVictimIndex: PlayerIndex | null,
): PlayerSettlement {
  const winner = state.players[winnerIndex];
  const loser = state.players[loserIndex];
  const breakdown = scoreBreakdownForPlayer(winner, state.mode);
  const baseScore = breakdown?.total ?? winner.score;
  const lines: SettlementLine[] = [];

  let total = applyWinnerMultipliers(baseScore, winner, state.handMultiplier);

  lines.push({
    key: 'base',
    labelEn: 'Base score',
    labelKo: '기본 점수',
    multiplier: 1,
    amount: baseScore,
  });

  if (winner.scoreMultiplier > 1) {
    lines.push({
      key: 'shakeBomb',
      labelEn: 'Shake/Bomb 2×',
      labelKo: '흔들기/폭탄 2배',
      multiplier: winner.scoreMultiplier,
      amount: total,
    });
  }

  if (state.handMultiplier > 1) {
    lines.push({
      key: 'nagari',
      labelEn: 'Nagari double',
      labelKo: '나가리 2배',
      multiplier: state.handMultiplier,
      amount: total,
    });
  }

  let piBak = false;
  let gwangBak = false;

  const winnerHasBright =
    countCollectedBrights(winner.collected) > 0 || (breakdown?.bright ?? 0) > 0;
  const loserPi = countCollectedPi(loser.collected) + loser.bonusPi;
  const loserBrights = countCollectedBrights(loser.collected);

  if (winnerHasBright && loserBrights === 0) {
    gwangBak = true;
    total *= 2;
    lines.push({
      key: 'gwangBak',
      labelEn: 'Gwang bak (광박)',
      labelKo: '광박',
      multiplier: 2,
      amount: total,
    });
  }

  const winnerScoredWithPi = (breakdown?.junk ?? 0) > 0 || loserPi > 0;
  if (winnerScoredWithPi && loserPi <= 6) {
    piBak = true;
    total *= 2;
    lines.push({
      key: 'piBak',
      labelEn: 'Pi bak (피박)',
      labelKo: '피박',
      multiplier: 2,
      amount: total,
    });
  }

  const goBakVictim = goBakVictimIndex === loserIndex;

  if (goBakVictim) {
    // Loser with Go pays everyone's settlement — human settlement UI shows victim flag
    total *= state.playerCount;
    lines.push({
      key: 'goBak',
      labelEn: 'Go bak (고박)',
      labelKo: '고박',
      multiplier: state.playerCount,
      amount: total,
    });
  }

  return {
    playerIndex: loserIndex,
    baseScore,
    totalChips: total,
    lines,
    goBakVictim,
    piBak,
    gwangBak,
  };
}

export function computeSettlement(state: MatgoGameState): GameSettlement | null {
  if (state.winnerIndex === null) {
    return null;
  }

  const winnerIndex = state.winnerIndex;
  const goBakVictimIndex = settleGoBak(state, winnerIndex);
  const losers = opponentIndices(state, winnerIndex);

  const players = losers.map((loserIndex) =>
    settlePair(state, winnerIndex, loserIndex, goBakVictimIndex),
  );

  const humanIndex = state.players.findIndex((player) => player.isHuman);
  let humanNetChips = 0;

  if (humanIndex === winnerIndex) {
    humanNetChips = players.reduce((sum, settlement) => sum + settlement.totalChips, 0);
  } else if (losers.includes(humanIndex)) {
    const humanSettlement = players.find((settlement) => settlement.playerIndex === humanIndex);
    humanNetChips = -(humanSettlement?.totalChips ?? 0);
  }

  return {
    winnerIndex,
    handMultiplier: state.handMultiplier,
    players,
    humanNetChips,
  };
}

export function nextHandMultiplier(state: MatgoGameState): number {
  if (state.finishReason === 'nagari') {
    return state.handMultiplier * 2;
  }
  return 1;
}
