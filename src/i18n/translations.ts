import type { AppLanguage } from '../types/game';

export type TranslationKey =
  | 'home.title'
  | 'home.play'
  | 'home.howToPlay'
  | 'home.settings'
  | 'setup.gameMode'
  | 'setup.aiDifficulty'
  | 'setup.comingSoon'
  | 'settings.title'
  | 'settings.language'
  | 'settings.feedback'
  | 'settings.sound'
  | 'settings.soundDesc'
  | 'settings.soundVolume'
  | 'settings.haptics'
  | 'settings.hapticsDesc'
  | 'settings.credit'
  | 'game.leave'
  | 'game.yourTurn'
  | 'game.aiTurn'
  | 'game.goStop'
  | 'game.loadingResults'
  | 'game.dealer'
  | 'game.points'
  | 'game.handCount'
  | 'game.table'
  | 'game.cardCount'
  | 'game.chooseTable'
  | 'game.chooseFlipMatch'
  | 'game.stack'
  | 'game.deck'
  | 'game.flipped'
  | 'game.target'
  | 'game.yourHand'
  | 'game.yaku.godori'
  | 'game.yaku.hongdan'
  | 'game.yaku.cheongdan'
  | 'game.yaku.chodan'
  | 'rules.title'
  | 'rules.back'
  | 'rules.credit'
  | 'rules.deck.title'
  | 'rules.deck.body'
  | 'rules.setup.title'
  | 'rules.setup.body'
  | 'rules.turn.title'
  | 'rules.turn.body'
  | 'rules.scoring.title'
  | 'rules.scoring.body'
  | 'rules.goStop.title'
  | 'rules.goStop.body'
  | 'rules.special.title'
  | 'rules.special.body'
  | 'rules.september.title'
  | 'rules.september.body'
  | 'common.back'
  | 'common.home'
  | 'common.player'
  | 'result.headline.win'
  | 'result.headline.lose'
  | 'result.headline.draw'
  | 'result.headline.nagari'
  | 'result.headline.autoWinHuman'
  | 'result.headline.autoWinAi'
  | 'result.goCount'
  | 'result.nagariHint'
  | 'result.settlement'
  | 'result.netChips'
  | 'result.pays'
  | 'result.goBak'
  | 'result.piBak'
  | 'result.gwangBak'
  | 'result.scoreBreakdown'
  | 'result.collectedCounts'
  | 'result.scorePoints'
  | 'result.godoriSuffix'
  | 'result.hongdanSuffix'
  | 'result.cheongdanSuffix'
  | 'result.chodanSuffix'
  | 'result.bonusPiLine'
  | 'result.bonusPiSuffix'
  | 'result.collected'
  | 'result.playAgain';

type TranslationParams = Record<string, string | number>;

const en: Record<TranslationKey, string> = {
  'home.title': 'Hwatu',
  'home.play': 'Play',
  'home.howToPlay': 'How to Play',
  'home.settings': 'Settings',
  'setup.gameMode': 'Game Mode',
  'setup.aiDifficulty': 'AI Difficulty',
  'setup.comingSoon': 'Coming soon',
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.feedback': 'Feedback',
  'settings.sound': 'Sound Effects',
  'settings.soundDesc': 'Card flip, match, Go/Stop',
  'settings.soundVolume': 'Volume',
  'settings.haptics': 'Haptics',
  'settings.hapticsDesc': 'Vibration on match and Go',
  'settings.credit': 'Card art: Wikimedia Commons (CC BY-SA 4.0)',
  'game.leave': '← Leave',
  'game.yourTurn': 'Your turn',
  'game.aiTurn': 'AI turn…',
  'game.goStop': 'Go / Stop',
  'game.loadingResults': 'Loading results…',
  'game.dealer': 'Dealer',
  'game.points': '{score} pts',
  'game.handCount': '{count} in hand',
  'game.table': 'Table',
  'game.cardCount': '{count} cards',
  'game.chooseTable': 'Tap a matching table card',
  'game.chooseFlipMatch': 'Tap a table card to match the flipped card',
  'game.stack': 'Stack {count}',
  'game.deck': 'Deck {count}',
  'game.flipped': 'Flipped',
  'game.target': 'Target {score} · {mode}',
  'game.yourHand': 'Your Hand',
  'game.yaku.godori': 'Godori!',
  'game.yaku.hongdan': 'Hongdan!',
  'game.yaku.cheongdan': 'Cheongdan!',
  'game.yaku.chodan': 'Chodan!',
  'rules.title': 'How to Play',
  'rules.back': '← Back',
  'rules.credit': 'Rules based on the 도까함 Go-Stop guide and Instructables.',
  'rules.deck.title': 'The Deck',
  'rules.deck.body':
    'Hwatu has 48 cards — 4 per month. Match by month (same flower). Types: Bright (광), Animal (열끗), Ribbon (띠), Junk (피). 25 pi total including 3 쌍피 (double junk).',
  'rules.setup.title': 'Setup',
  'rules.setup.body':
    'Go-Stop (3P): 7 cards each, 6 on table, stop at 3 points. Matgo (2P): 10 cards each, 8 on table, stop at 7 points.',
  'rules.turn.title': 'Your Turn',
  'rules.turn.body':
    'Play one hand card, flip the top deck card, then collect matches by month. If 3 same-month cards stack (뻑), they cannot be taken until a fourth match.',
  'rules.scoring.title': 'Scoring',
  'rules.scoring.body':
    '3 광 = 3 (비광 with rain = 2) · 4 광 = 4 · 5 광 = 15 · Godori (Feb+Apr+Aug) = 5 · 5+ 열끗/띠 = 1+ · 7+ 열끗 = 2× final · 10+ 피 = 1+ · 쌍피 = 2 pi each',
  'rules.goStop.title': 'Go / Stop',
  'rules.goStop.body':
    'At target score: Stop to win, or Go for bonus (+1 at 1고/2고, then ×2 at 3고+). Risk 고박 if an opponent wins first. 나가리 = void hand, next hand pays double.',
  'rules.special.title': 'Special Moves',
  'rules.special.body':
    '쪽 · 따닥 · 싹쓸이 · 뻑 — take 1 피 from each opponent. 흔들기 · 폭탄 — declare with 3 of a month; 2× score if you win.',
  'rules.september.title': 'September Cup',
  'rules.september.body':
    'The 9월 국화잔 can be scored as either 열끗 (animal) or 쌍피 (double junk, +2 pi). Choose when you collect it.',
  'common.back': '← Back',
  'common.home': '← Home',
  'common.player': 'Player',
  'result.headline.win': 'Congratulations!',
  'result.headline.lose': 'You lose',
  'result.headline.draw': 'Draw',
  'result.headline.nagari': 'Nagari',
  'result.headline.autoWinHuman': 'Four of a month — you win!',
  'result.headline.autoWinAi': 'AI wins — four of a month',
  'result.goCount': '{count} Go',
  'result.nagariHint': 'Next hand pays {multiplier}×',
  'result.settlement': 'Settlement',
  'result.netChips': 'Net chips',
  'result.pays': 'pays',
  'result.goBak': ' · Go bak',
  'result.piBak': ' · Pi bak',
  'result.gwangBak': ' · Gwang bak',
  'result.scoreBreakdown': 'Score breakdown',
  'result.collectedCounts':
    'Collected: {bright} bright · {animal} animals · {ribbon} ribbons · {pi} pi',
  'result.scorePoints':
    'Points: bright {bright} · animals {animal} · ribbons {ribbon} · junk {junk}{extras}',
  'result.godoriSuffix': ' · godori {count}',
  'result.hongdanSuffix': ' · hongdan {count}',
  'result.cheongdanSuffix': ' · cheongdan {count}',
  'result.chodanSuffix': ' · chodan {count}',
  'result.bonusPiLine': 'Bonus pi from special moves: {count}',
  'result.bonusPiSuffix': ' · bonus pi {count}',
  'result.collected': 'Collected',
  'result.playAgain': 'Play Again',
};

const ko: Record<TranslationKey, string> = {
  'home.title': 'Hwatu',
  'home.play': '플레이',
  'home.howToPlay': '게임 방법',
  'home.settings': '설정',
  'setup.gameMode': '게임 모드',
  'setup.aiDifficulty': 'AI 난이도',
  'setup.comingSoon': '준비 중',
  'settings.title': '설정',
  'settings.language': '언어',
  'settings.feedback': '피드백',
  'settings.sound': '효과음',
  'settings.soundDesc': '카드 뒤집기, 매칭, 고/스톱',
  'settings.soundVolume': '볼륨',
  'settings.haptics': '햅틱',
  'settings.hapticsDesc': '매칭 및 고 선언 시 진동',
  'settings.credit': '카드 아트: Wikimedia Commons (CC BY-SA 4.0)',
  'game.leave': '← 나가기',
  'game.yourTurn': '당신 차례',
  'game.aiTurn': 'AI 차례…',
  'game.goStop': '고 / 스톱',
  'game.loadingResults': '결과로 이동 중…',
  'game.dealer': '선',
  'game.points': '{score}점',
  'game.handCount': '손패 {count}',
  'game.table': '바닥',
  'game.cardCount': '{count}장',
  'game.chooseTable': '가져갈 바닥 패를 선택하세요',
  'game.chooseFlipMatch': '뒤집은 패와 맞출 바닥 패를 선택하세요',
  'game.stack': '스택 {count}',
  'game.deck': '덱 {count}',
  'game.flipped': '방금 뒤집음',
  'game.target': '목표 {score}점 · {mode}',
  'game.yourHand': '내 손패',
  'game.yaku.godori': '고도리!',
  'game.yaku.hongdan': '홍단!',
  'game.yaku.cheongdan': '청단!',
  'game.yaku.chodan': '초단!',
  'rules.title': '게임 방법',
  'rules.back': '← 뒤로',
  'rules.credit': '도까함 고스톱 가이드와 Instructables를 참고했습니다.',
  'rules.deck.title': '화투 덱',
  'rules.deck.body':
    '화투는 48장 — 월별 4장. 같은 꽃(월)로 매칭합니다. 종류: 광, 열끗, 띠, 피. 쌍피 3장 포함 총 25피.',
  'rules.setup.title': '셋업',
  'rules.setup.body':
    '고스톱(3인): 손패 7장, 바닥 6장, 3점에서 스톱. 맞고(2인): 손패 10장, 바닥 8장, 7점에서 스톱.',
  'rules.turn.title': '턴 진행',
  'rules.turn.body':
    '손패 1장 내기 → 덱에서 1장 뒤집기 → 같은 월 매칭하여 가져가기. 뻑(3장 스택)은 네 번째가 나올 때까지 가져갈 수 없습니다.',
  'rules.scoring.title': '점수',
  'rules.scoring.body':
    '3광=3(비광=2) · 4광=4 · 5광=15 · 고도리(2·4·8월)=5 · 열끗/띠 5장 이상=1+ · 열끗 7장 이상=2배 · 피 10장 이상=1+ · 쌍피=2피',
  'rules.goStop.title': '고 / 스톱',
  'rules.goStop.body':
    '목표 점수 도달 시: 스톱으로 승리, 또는 고로 보너스(1·2고 +1점, 3고 이상 2배). 상대가 먼저 이기면 고박. 나가리는 무효 판, 다음 판 2배.',
  'rules.special.title': '특수 기술',
  'rules.special.body':
    '쪽·따닥·싹쓸이·뻑 — 상대마다 1피. 흔들기·폭탄 — 같은 월 3장 선언, 승리 시 2배.',
  'rules.september.title': '9월 국화잔',
  'rules.september.body':
    '9월 국화잔은 열끗 또는 쌍피(+2피)로 채점할 수 있습니다. 가져갈 때 선택하세요.',
  'common.back': '← 뒤로',
  'common.home': '← 홈',
  'common.player': '플레이어',
  'result.headline.win': '축하합니다!',
  'result.headline.lose': '패배',
  'result.headline.draw': '무승부',
  'result.headline.nagari': '나가리',
  'result.headline.autoWinHuman': '4월 승 — 자동 승리!',
  'result.headline.autoWinAi': 'AI 4월 승',
  'result.goCount': '{count}고',
  'result.nagariHint': '다음 판 {multiplier}배 정산',
  'result.settlement': '정산',
  'result.netChips': '순 획득 칩',
  'result.pays': '정산',
  'result.goBak': ' · 고박',
  'result.piBak': ' · 피박',
  'result.gwangBak': ' · 광박',
  'result.scoreBreakdown': '점수 내역',
  'result.collectedCounts':
    '따낸 패: 광 {bright} · 열끗 {animal} · 띠 {ribbon} · 피 {pi}',
  'result.scorePoints':
    '점수: 광 {bright} · 열끗 {animal} · 띠 {ribbon} · 피 {junk}{extras}',
  'result.godoriSuffix': ' · 고도리 {count}',
  'result.hongdanSuffix': ' · 홍단 {count}',
  'result.cheongdanSuffix': ' · 청단 {count}',
  'result.chodanSuffix': ' · 초단 {count}',
  'result.bonusPiLine': '특수 패 보너스 피: {count}',
  'result.bonusPiSuffix': ' · 보너스피 {count}',
  'result.collected': '따낸 패',
  'result.playAgain': '다시 하기',
};

const catalogs: Record<AppLanguage, Record<TranslationKey, string>> = { en, ko };

export function translate(
  language: AppLanguage,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  let text = catalogs[language][key] ?? catalogs.en[key] ?? key;

  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replace(`{${paramKey}}`, String(value));
    }
  }

  return text;
}

export const RULE_SECTION_KEYS = [
  { title: 'rules.deck.title' as const, body: 'rules.deck.body' as const },
  { title: 'rules.setup.title' as const, body: 'rules.setup.body' as const },
  { title: 'rules.turn.title' as const, body: 'rules.turn.body' as const },
  { title: 'rules.scoring.title' as const, body: 'rules.scoring.body' as const },
  { title: 'rules.goStop.title' as const, body: 'rules.goStop.body' as const },
  { title: 'rules.special.title' as const, body: 'rules.special.body' as const },
  { title: 'rules.september.title' as const, body: 'rules.september.body' as const },
];
