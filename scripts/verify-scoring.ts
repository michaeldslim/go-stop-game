import { calculateScore } from '../src/game/scoring';
import { CARD_CATALOG } from '../src/cards/cardCatalog';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

// 3 brights without rain = 3
const threeBrights = ['jan-bright', 'mar-bright', 'aug-bright'];
assert(calculateScore(threeBrights).bright === 3, '3 brights without rain should score 3');
assert(calculateScore(threeBrights).total === 3, '3 brights total should be 3');

// 3 brights with rain = 2 (비광)
const biGwang = ['jan-bright', 'mar-bright', 'dec-bright'];
assert(calculateScore(biGwang).bright === 2, '비광 should score 2');
assert(calculateScore(biGwang).total === 2, '비광 total should be 2');

// 4 brights in this deck (Jan, Mar, Aug, Dec rain) = 4 points
const allBrights = CARD_CATALOG.filter((c) => c.type === 'bright').map((c) => c.id);
assert(allBrights.length === 5, 'catalog has 5 bright cards');
assert(calculateScore(allBrights).bright === 15, '5 brights should score 15');
assert(calculateScore(allBrights).total === 15, '5 brights total should be 15');

// Godori
const godori = ['feb-animal', 'apr-animal', 'aug-animal'];
assert(calculateScore(godori).godori === 5, 'godori should score 5');

// Hongdan
const hongdan = ['jan-ribbon', 'feb-ribbon', 'mar-ribbon'];
assert(calculateScore(hongdan).hongdan === 3, 'hongdan should score 3');

// Cheongdan
const cheongdan = ['apr-ribbon', 'may-ribbon', 'jun-ribbon'];
assert(calculateScore(cheongdan).cheongdan === 3, 'cheongdan should score 3');

// Chodan (Jul, Aug, Sep)
const chodan = ['jul-ribbon', 'sep-ribbon', 'dec-ribbon'];
assert(calculateScore(chodan).chodan === 3, 'chodan should score 3');

// 10 pi = 1, each extra +1
const tenPi = CARD_CATALOG.filter((c) => c.type === 'junk' && c.piValue === 1)
  .slice(0, 10)
  .map((c) => c.id);
assert(calculateScore(tenPi).junk === 1, '10 pi should score 1');

// Double junk counts as 2 pi — 10 + 2 = 12 pi → 3 points
const withDouble = [...tenPi, 'nov-junk-double'];
assert(calculateScore(withDouble).junk === 3, '12 pi should score 3');

// 7+ animals doubles score
const sevenAnimals = CARD_CATALOG.filter((c) => c.type === 'animal').map((c) => c.id);
assert(sevenAnimals.length >= 7, 'need 7+ animals in catalog');
const animalScore = calculateScore(sevenAnimals);
assert(animalScore.animalMultiplier === 2, '7+ animals should double');
assert(animalScore.total === animalScore.baseTotal * 2, 'animal multiplier applied');

// Go bonuses
const base = calculateScore(threeBrights);
assert(calculateScore(threeBrights, 1).total === base.total + 1, '1고 adds +1');
assert(calculateScore(threeBrights, 2).total === base.total + 2, '2고 adds +2');
assert(calculateScore(threeBrights, 3).total === (base.total + 2) * 2, '3고 doubles');

// December 초단 counts toward 초단 yaku art only — not generic 띠 totals
const decRibbonOnly = ['dec-ribbon'];
assert(calculateScore(decRibbonOnly).ribbon === 0, 'dec ribbon excluded from 띠 count');

console.log('All scoring checks passed.');
