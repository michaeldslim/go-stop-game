import type { CardDefinition } from '../types/hwatu';

const MONTH_NAMES = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
] as const;

function monthId(month: number): string {
  return MONTH_NAMES[month - 1];
}

function makeCard(
  month: CardDefinition['month'],
  suffix: string,
  type: CardDefinition['type'],
  labels: CardDefinition['labels'],
  extras: Partial<CardDefinition> = {},
): CardDefinition {
  return {
    id: `${monthId(month)}-${suffix}`,
    month,
    type,
    piValue: 1,
    labels,
    ...extras,
  };
}

/** Full 48-card Hwatu deck */
export const CARD_CATALOG: CardDefinition[] = [
  // January
  makeCard(1, 'bright', 'bright', { en: 'Pine Bright', ko: '송학광' }),
  makeCard(1, 'ribbon', 'ribbon', { en: 'Red Ribbon', ko: '홍단 띠' }, { flags: { hongdan: true } }),
  makeCard(1, 'junk-1', 'junk', { en: 'Pine Junk', ko: '송학 피' }),
  makeCard(1, 'junk-2', 'junk', { en: 'Pine Junk', ko: '송학 피' }),

  // February
  makeCard(2, 'animal', 'animal', { en: 'Nightingale', ko: '고도리' }, { flags: { godori: true } }),
  makeCard(2, 'ribbon', 'ribbon', { en: 'Red Ribbon', ko: '홍단 띠' }, { flags: { hongdan: true } }),
  makeCard(2, 'junk-1', 'junk', { en: 'Plum Junk', ko: '매화 피' }),
  makeCard(2, 'junk-2', 'junk', { en: 'Plum Junk', ko: '매화 피' }),

  // March
  makeCard(3, 'bright', 'bright', { en: 'Cherry Bright', ko: '벚꽃광' }),
  makeCard(3, 'ribbon', 'ribbon', { en: 'Red Ribbon', ko: '홍단 띠' }, { flags: { hongdan: true } }),
  makeCard(3, 'junk-1', 'junk', { en: 'Cherry Junk', ko: '벚꽃 피' }),
  makeCard(3, 'junk-2', 'junk', { en: 'Cherry Junk', ko: '벚꽃 피' }),

  // April
  makeCard(4, 'animal', 'animal', { en: 'Cuckoo', ko: '고도리' }, { flags: { godori: true } }),
  makeCard(4, 'ribbon', 'ribbon', { en: 'Blue Ribbon', ko: '청단 띠' }, { flags: { cheongdan: true } }),
  makeCard(4, 'junk-1', 'junk', { en: 'Wisteria Junk', ko: '등 피' }),
  makeCard(4, 'junk-2', 'junk', { en: 'Wisteria Junk', ko: '등 피' }),

  // May
  makeCard(5, 'animal', 'animal', { en: 'Iris Animal', ko: '참새' }),
  makeCard(5, 'ribbon', 'ribbon', { en: 'Blue Ribbon', ko: '청단 띠' }, { flags: { cheongdan: true } }),
  makeCard(5, 'junk-1', 'junk', { en: 'Iris Junk', ko: '붓꽃 피' }),
  makeCard(5, 'junk-2', 'junk', { en: 'Iris Junk', ko: '붓꽃 피' }),

  // June
  makeCard(6, 'animal', 'animal', { en: 'Butterfly', ko: '나비' }),
  makeCard(6, 'ribbon', 'ribbon', { en: 'Blue Ribbon', ko: '청단 띠' }, { flags: { cheongdan: true } }),
  makeCard(6, 'junk-1', 'junk', { en: 'Peony Junk', ko: '모란 피' }),
  makeCard(6, 'junk-2', 'junk', { en: 'Peony Junk', ko: '모란 피' }),

  // July
  makeCard(7, 'animal', 'animal', { en: 'Boar', ko: '멧돼지' }),
  makeCard(7, 'ribbon', 'ribbon', { en: 'Plain Ribbon', ko: '초단 띠' }, { flags: { chodan: true } }),
  makeCard(7, 'junk-1', 'junk', { en: 'Clover Junk', ko: '싸리 피' }),
  makeCard(7, 'junk-2', 'junk', { en: 'Clover Junk', ko: '싸리 피' }),

  // August
  makeCard(8, 'animal', 'animal', { en: 'Geese', ko: '고도리' }, { flags: { godori: true } }),
  makeCard(8, 'bright', 'bright', { en: 'Moon Bright', ko: '달밝음' }),
  makeCard(8, 'ribbon', 'ribbon', { en: 'Plain Ribbon', ko: '초단 띠' }, { flags: { chodan: true } }),
  makeCard(8, 'junk-1', 'junk', { en: 'Pampas Junk', ko: '억새 피' }),

  // September — cup can be scored as 열끗 or 쌍피 (+2)
  makeCard(
    9,
    'animal-double',
    'animal',
    { en: 'Chrysanthemum Cup', ko: '국화잔' },
    { flags: { flexPiAnimal: true }, piValue: 2 },
  ),
  makeCard(9, 'ribbon', 'ribbon', { en: 'Plain Ribbon', ko: '초단 띠' }, { flags: { chodan: true } }),
  makeCard(9, 'junk-1', 'junk', { en: 'Chrysanthemum Junk', ko: '국화 피' }),
  makeCard(9, 'junk-2', 'junk', { en: 'Chrysanthemum Junk', ko: '국화 피' }),

  // October
  makeCard(10, 'animal', 'animal', { en: 'Deer', ko: '사슴' }),
  makeCard(10, 'junk-1', 'junk', { en: 'Maple Junk', ko: '단풍 피' }),
  makeCard(10, 'junk-2', 'junk', { en: 'Maple Junk', ko: '단풍 피' }),
  makeCard(10, 'junk-3', 'junk', { en: 'Maple Junk', ko: '단풍 피' }),

  // November
  makeCard(11, 'animal', 'animal', { en: 'Raven', ko: '까치' }),
  makeCard(11, 'junk-1', 'junk', { en: 'Willow Junk', ko: '오동 피' }),
  makeCard(11, 'junk-2', 'junk', { en: 'Willow Junk', ko: '오동 피' }),
  { ...makeCard(11, 'junk-double', 'junk', { en: 'Double Junk', ko: '쌍피' }), piValue: 2 },

  // December
  makeCard(12, 'rain', 'bright', { en: 'Rain Bright', ko: '비광' }, { flags: { rainBright: true } }),
  makeCard(12, 'junk-1', 'junk', { en: 'Rain Junk', ko: '비 피' }),
  makeCard(12, 'junk-2', 'junk', { en: 'Rain Junk', ko: '비 피' }),
  { ...makeCard(12, 'junk-double', 'junk', { en: 'Double Junk', ko: '쌍피' }), piValue: 2 },
];

export const CARD_BY_ID = Object.fromEntries(
  CARD_CATALOG.map((card) => [card.id, card]),
) as Record<string, CardDefinition>;
