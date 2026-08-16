/**
 * Turn engine sanity checks.
 * Run: npx tsx scripts/verify-turn-engine.ts
 */
import { createMatgoGame } from '../src/game/createGame';
import { runAiTurn } from '../src/game/ai';
import { chooseTableForPending, playHandCard } from '../src/game/turnEngine';
import type { MatgoGameState } from '../src/types/gameState';

function mulberry32(seed: number): () => number {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function totalCards(state: MatgoGameState): number {
  const tableCards = state.table.flatMap((tableCard) => [
    ...(tableCard.stackedCardIds ?? []),
    tableCard.cardId,
  ]);

  const pendingFlip =
    state.pendingAction?.type === 'chooseFlipMatch' ? 1 : 0;

  return (
    state.players[0].hand.length +
    state.players[1].hand.length +
    state.players[0].collected.length +
    state.players[1].collected.length +
    tableCards.length +
    state.deck.length +
    pendingFlip
  );
}

let failures = 0;

for (let seed = 0; seed < 50; seed += 1) {
  let state = createMatgoGame({ aiDifficulty: 'intermediate', rng: mulberry32(seed) });

  for (let turn = 0; turn < 40 && state.phase === 'playing'; turn += 1) {
    if (totalCards(state) !== 48) {
      console.error(`seed ${seed} turn ${turn}: card count ${totalCards(state)}`);
      failures += 1;
      break;
    }

    const player = state.players[state.currentPlayerIndex];
    if (player.hand.length === 0) {
      break;
    }

    if (player.isHuman) {
      const cardId = player.hand[0];
      state = playHandCard(state, cardId);
      while (state.pendingAction) {
        if (
          state.pendingAction.type === 'chooseHandMatch' ||
          state.pendingAction.type === 'chooseFlipMatch'
        ) {
          state = chooseTableForPending(state, state.pendingAction.matchIndices[0]);
        } else {
          break;
        }
      }
    } else {
      state = runAiTurn(state);
    }
  }

  if (state.phase !== 'finished' && state.players[0].hand.length + state.players[1].hand.length > 0) {
    // Not all simulations finish in 40 turns — only check card conservation.
    if (totalCards(state) !== 48) {
      console.error(`seed ${seed}: unfinished but card count ${totalCards(state)}`);
      failures += 1;
    }
  }
}

// Explicit match test: hand play collects, flip collects.
const base = createMatgoGame({ aiDifficulty: 'beginner', rng: () => 0.42 });
const humanHand = base.players[0].hand[0];
const played = playHandCard(base, humanHand);
if (played.deck.length !== base.deck.length - 1 && base.deck.length > 0) {
  // Hand play should flip unless deck was empty (not here).
  if (base.deck.length > 0 && played.lastFlippedCardId === null && played.pendingAction === null) {
    console.error('Expected a flip after hand play');
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`FAILED with ${failures} errors`);
  process.exit(1);
}

console.log('OK — turn engine conserves 48 cards across simulated play');
