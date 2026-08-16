/**
 * Quick sanity check for matgo deal invariants.
 * Run: npx tsx scripts/verify-matgo-deal.ts
 */
import { createMatgoGame } from '../src/game/createGame';
import { MATGO_HAND_SIZE, MATGO_TABLE_SIZE } from '../src/game/constants';
import { expandTableCard } from '../src/game/tableCards';

function mulberry32(seed: number): () => number {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let failures = 0;

for (let seed = 0; seed < 100; seed += 1) {
  const game = createMatgoGame({ aiDifficulty: 'intermediate', rng: mulberry32(seed) });
  const tableCardIds = game.table.flatMap((tableCard) => expandTableCard(tableCard));
  const allCardIds = [
    ...game.players[0].hand,
    ...game.players[1].hand,
    ...tableCardIds,
    ...game.deck,
  ];

  if (game.players[0].hand.length !== MATGO_HAND_SIZE) {
    console.error(`seed ${seed}: human hand size ${game.players[0].hand.length}`);
    failures += 1;
  }

  if (game.players[1].hand.length !== MATGO_HAND_SIZE) {
    console.error(`seed ${seed}: AI hand size ${game.players[1].hand.length}`);
    failures += 1;
  }

  if (tableCardIds.length !== MATGO_TABLE_SIZE) {
    console.error(`seed ${seed}: table card count ${tableCardIds.length} (piles ${game.table.length})`);
    failures += 1;
  }

  if (game.table.length < MATGO_TABLE_SIZE - 2 || game.table.length > MATGO_TABLE_SIZE) {
    console.error(`seed ${seed}: table pile count ${game.table.length}`);
    failures += 1;
  }

  if (allCardIds.length !== 48) {
    console.error(`seed ${seed}: total cards ${allCardIds.length}`);
    failures += 1;
  }

  const unique = new Set(allCardIds);
  if (unique.size !== 48) {
    console.error(`seed ${seed}: duplicate cards detected`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`FAILED with ${failures} errors`);
  process.exit(1);
}

console.log('OK — 100 matgo deals: 10+10 hand, 8 table cards, 20 deck, 48 unique cards');
