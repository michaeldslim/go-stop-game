import { applyMatchResult, DEFAULT_CAREER_STATE } from '../src/career/careerProgress';
import type { CareerState } from '../src/types/career';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function win(
  state: CareerState,
  aiDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner',
) {
  return applyMatchResult(state, { won: true, aiDifficulty }).nextState;
}

function lose(state: CareerState) {
  return applyMatchResult(state, { won: false, aiDifficulty: 'beginner' });
}

let state = DEFAULT_CAREER_STATE;

for (let index = 0; index < 2; index += 1) {
  const result = applyMatchResult(state, { won: true, aiDifficulty: 'beginner' });
  assert(result.promoted === null, '2 wins should not promote from intern');
  assert(result.nextState.promotionWins === index + 1, 'win count should increment');
  state = result.nextState;
}

const thirdWin = applyMatchResult(state, { won: true, aiDifficulty: 'beginner' });
assert(thirdWin.promoted === 'staff', '3 wins should promote intern to staff');
assert(thirdWin.nextState.rank === 'staff', 'rank should be staff');
assert(thirdWin.nextState.promotionWins === 0, 'wins reset on promotion');
state = thirdWin.nextState;

const staffWin = applyMatchResult(state, { won: true, aiDifficulty: 'beginner' });
assert(staffWin.nextState.promotionWins === 1, 'staff should start 1/5 wins');
state = staffWin.nextState;

const afterLoss = lose(state);
assert(afterLoss.lost, 'loss should set lost flag');
assert(afterLoss.nextState.promotionWins === 1, 'win count should stay after loss');
assert(afterLoss.nextState.rank === 'staff', 'rank should stay staff after loss');
state = afterLoss.nextState;

const nagari = applyMatchResult(state, {
  won: false,
  aiDifficulty: 'beginner',
  finishReason: 'nagari',
});
assert(nagari.unchanged, 'nagari should leave wins unchanged');
assert(nagari.nextState.promotionWins === 1, 'nagari should not change win count');

const draw = applyMatchResult(state, {
  won: false,
  aiDifficulty: 'beginner',
  finishReason: 'draw',
});
assert(draw.unchanged, 'draw should leave wins unchanged');

state = { rank: 'deputy', promotionWins: 0, highestRankAchieved: 'deputy' };
const lowDifficultyWin = applyMatchResult(state, { won: true, aiDifficulty: 'beginner' });
assert(lowDifficultyWin.noProgressDifficulty, 'deputy win on beginner should not count');
assert(lowDifficultyWin.nextState.promotionWins === 0, 'wins should stay 0 on difficulty gate');

let deputyState = state;
for (let index = 0; index < 4; index += 1) {
  deputyState = win(deputyState, 'intermediate');
}
assert(deputyState.rank === 'deputy', '4 intermediate wins should not promote yet');
assert(deputyState.promotionWins === 4, 'deputy wins should be 4/5');

deputyState = win(deputyState, 'intermediate');
assert(deputyState.rank === 'director', '5 intermediate wins should promote deputy to director');
assert(deputyState.promotionWins === 0, 'promotion should reset win count');

let staffState = DEFAULT_CAREER_STATE;
for (let index = 0; index < 3; index += 1) {
  staffState = win(staffState, 'beginner');
}
assert(staffState.rank === 'staff', 'intern should reach staff after 3 wins');

for (let index = 0; index < 5; index += 1) {
  staffState = win(staffState, 'beginner');
}
assert(staffState.rank === 'assistant', 'staff should reach assistant after 5 more wins');

let ceoState = { rank: 'ceo' as const, promotionWins: 0, highestRankAchieved: 'ceo' as const };
const ceoWin = applyMatchResult(ceoState, { won: true, aiDifficulty: 'expert' });
assert(ceoWin.promoted === null, 'ceo should not promote further');
assert(ceoWin.nextState.rank === 'ceo', 'ceo rank should remain');

console.log('All career progress checks passed.');
