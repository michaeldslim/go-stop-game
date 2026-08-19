/**
 * Verify buildTurnSteps includes flipDeck across many turns.
 * Run: npx tsx scripts/verify-turn-steps.ts
 */
import { createMatgoGame } from '../src/game/createGame';
import { runAiTurn } from '../src/game/ai';
import { chooseTableForPending, playHandCard } from '../src/game/turnEngine';
import { buildTurnSteps } from '../src/game/turnSteps';
import { getGameSpeedTimings } from '../src/game/gameSpeed';

function mulberry32(seed: number): () => number {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const timing = getGameSpeedTimings('medium');
let failures = 0;

for (let seed = 0; seed < 20; seed += 1) {
  let before = createMatgoGame({ aiDifficulty: 'intermediate', rng: mulberry32(seed) });
  let turnNumber = 0;

  while (before.phase === 'playing' && turnNumber < 12) {
    turnNumber += 1;
    const player = before.players[before.currentPlayerIndex];
    if (player.hand.length === 0) {
      break;
    }

    let after = player.isHuman
      ? playHandCard(before, player.hand[0])
      : runAiTurn(before);

    while (after.pendingAction) {
      if (
        after.pendingAction.type === 'chooseHandMatch' ||
        after.pendingAction.type === 'chooseFlipMatch'
      ) {
        after = chooseTableForPending(after, after.pendingAction.matchIndices[0]);
      } else {
        break;
      }
    }

    const steps = buildTurnSteps(before, after, timing);
    const flipSteps = steps.filter((step) => step.type === 'flipDeck');

    if (before.deck.length > 0 && flipSteps.length === 0 && !after.pendingAction) {
      console.error(
        `seed ${seed} turn ${turnNumber}: deck had ${before.deck.length} cards but no flipDeck step`,
      );
      console.error('  status:', after.statusMessage);
      console.error('  deck before/after:', before.deck.length, after.deck.length);
      failures += 1;
    }

    before = after;
  }
}

if (failures > 0) {
  console.error(`FAILED with ${failures} errors`);
  process.exit(1);
}

console.log('OK — flipDeck steps present for all turns with deck cards');
