import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCardById } from '../src/cards/getCardById';
import { CardView } from '../src/components/CardView';
import { CollectedPileView } from '../src/components/CollectedPileView';
import { GoStopModal } from '../src/components/GoStopModal';
import { HandFanView } from '../src/components/HandFanView';
import { LayoutAnchor, LayoutAnchorProvider, anchorKeys } from '../src/components/LayoutAnchor';
import { SepCupModal } from '../src/components/SepCupModal';
import { SpecialMoveBar } from '../src/components/SpecialMoveBar';
import { TurnAnimationOverlay } from '../src/components/TurnAnimationOverlay';
import {
  getAiDifficultyOption,
  getGameModeOption,
  getLocalizedText,
} from '../src/constants/gameOptions';
import { colors } from '../src/constants/colors';
import { expandTableCard } from '../src/game/tableCards';
import { canChooseTableIndex } from '../src/game/turnEngine';
import { useMatgoGame } from '../src/game/useMatgoGame';
import { useTranslation } from '../src/i18n/useTranslation';
import type { AiDifficulty, GameMode } from '../src/types/game';
import type { PlayerState } from '../src/types/gameState';

function parseMode(value: string | string[] | undefined): GameMode {
  if (value === 'gostop' || value === 'hwatu') {
    return value;
  }
  return 'matgo';
}

function parseDifficulty(value: string | string[] | undefined): AiDifficulty {
  if (
    value === 'beginner' ||
    value === 'intermediate' ||
    value === 'advanced' ||
    value === 'expert'
  ) {
    return value;
  }
  return 'intermediate';
}

function parseHandMultiplier(value: string | string[] | undefined): number {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return parsed > 1 ? parsed : 1;
}

export default function GameScreen() {
  return (
    <LayoutAnchorProvider>
      <GameScreenContent />
    </LayoutAnchorProvider>
  );
}

function OpponentBar({
  player,
  playerIndex,
  isDealer,
  difficultyLabel,
  dealerLabel,
  pointsLabel,
  handCountLabel,
}: {
  player: PlayerState;
  playerIndex: number;
  isDealer: boolean;
  difficultyLabel: string;
  dealerLabel: string;
  pointsLabel: string;
  handCountLabel: string;
}) {
  return (
    <View style={styles.opponentBar}>
      <View style={styles.opponentInfo}>
        <Text style={styles.opponentName}>
          {player.name} · {difficultyLabel}
        </Text>
        {isDealer ? <Text style={styles.dealerBadge}>{dealerLabel}</Text> : null}
        <Text style={styles.scoreBadge}>{pointsLabel}</Text>
        <Text style={styles.handCount}>{handCountLabel}</Text>
      </View>
      <LayoutAnchor anchorKey={anchorKeys.aiHand(playerIndex)} style={styles.aiHandRow}>
        {player.hand.map((_, index) => (
          <CardView key={`ai-${playerIndex}-${index}`} card={getCardById('jan-junk-1')} size="small" faceDown />
        ))}
      </LayoutAnchor>
    </View>
  );
}

function GameScreenContent() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    difficulty?: string;
    handMultiplier?: string;
  }>();
  const { t, language } = useTranslation();

  const mode = parseMode(params.mode);
  const difficulty = parseDifficulty(params.difficulty);
  const handMultiplier = parseHandMultiplier(params.handMultiplier);
  const modeOption = getGameModeOption(mode);
  const difficultyOption = getAiDifficultyOption(difficulty);

  const {
    game,
    playCard,
    chooseTable,
    callGo,
    callStop,
    callShake,
    callBomb,
    chooseSepCup,
    playableHandCardIds,
    isHumanTurn,
    needsTableChoice,
    showGoStopModal,
    showSepCupModal,
    canShake,
    canBomb,
    isAnimating,
    activeFlight,
    onFlightComplete,
    inFlightCardId,
  } = useMatgoGame(mode, difficulty, handMultiplier);

  const human = game.players.find((player) => player.isHuman) ?? game.players[0];
  const humanIndex = game.players.findIndex((player) => player.isHuman);
  const opponents = game.players.filter((player) => !player.isHuman);
  const playableSet = new Set(playableHandCardIds);
  const hiddenCards = inFlightCardId ? new Set([inFlightCardId]) : undefined;
  const difficultyLabel = getLocalizedText(language, difficultyOption.labels);

  if (game.phase === 'finished') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>{t('game.loadingResults')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8} disabled={isAnimating}>
          <Text style={styles.back}>{t('game.leave')}</Text>
        </Pressable>
        <Text style={styles.turnHint} numberOfLines={1}>
          {game.phase === 'goStopPrompt'
            ? t('game.goStop')
            : isHumanTurn
              ? t('game.yourTurn')
              : t('game.aiTurn')}
        </Text>
      </View>

      {game.statusMessage ? (
        <Text style={styles.status} numberOfLines={2}>
          {game.statusMessage}
        </Text>
      ) : null}

      <SpecialMoveBar
        language={language}
        canShake={canShake}
        canBomb={canBomb}
        onShake={callShake}
        onBomb={callBomb}
        disabled={!isHumanTurn || isAnimating}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {opponents.map((opponent, index) => {
          const playerIndex = game.players.findIndex((player) => player.id === opponent.id);
          return (
            <View key={opponent.id}>
              <OpponentBar
                player={opponent}
                playerIndex={playerIndex}
                isDealer={game.dealerIndex === playerIndex}
                difficultyLabel={difficultyLabel}
                dealerLabel={t('game.dealer')}
                pointsLabel={`${t('game.points', { score: opponent.score })}${opponent.goCount > 0 ? ` · ${opponent.goCount}고` : ''}`}
                handCountLabel={t('game.handCount', { count: opponent.hand.length })}
              />
              <CollectedPileView cardIds={opponent.collected} playerIndex={playerIndex} />
            </View>
          );
        })}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{t('game.table')}</Text>
            <Text style={styles.sectionMeta}>
              {t('game.cardCount', { count: game.table.length })}
            </Text>
          </View>
          {needsTableChoice ? (
            <Text style={styles.prompt}>{t('game.chooseTable')}</Text>
          ) : null}
          <View style={styles.tableGrid}>
            {game.table.map((tableCard, index) => {
              const card = getCardById(tableCard.cardId);
              const stackSize = expandTableCard(tableCard).length;
              const choosable = canChooseTableIndex(game, index);
              const hidden = hiddenCards?.has(tableCard.cardId);

              return (
                <LayoutAnchor
                  key={`table-${index}-${tableCard.cardId}`}
                  anchorKey={anchorKeys.table(index)}
                  style={styles.tableItem}
                >
                  <CardView
                    card={card}
                    size="table"
                    onPress={choosable ? () => chooseTable(index) : undefined}
                    selected={choosable}
                    style={hidden ? styles.hidden : undefined}
                  />
                  {stackSize > 1 ? (
                    <Text style={styles.stackLabel}>
                      {t('game.stack', { count: stackSize })}
                    </Text>
                  ) : null}
                </LayoutAnchor>
              );
            })}
          </View>
        </View>

        <View style={styles.middleBar}>
          <LayoutAnchor anchorKey={anchorKeys.deck} style={styles.deckPile}>
            <CardView card={getCardById('jan-junk-1')} size="small" faceDown />
            <Text style={styles.deckCount}>
              {t('game.deck', { count: game.deck.length })}
            </Text>
          </LayoutAnchor>
          {game.lastFlippedCardId && !hiddenCards?.has(game.lastFlippedCardId) ? (
            <View style={styles.flippedPreview}>
              <Text style={styles.flippedLabel}>{t('game.flipped')}</Text>
              <CardView card={getCardById(game.lastFlippedCardId)} size="small" />
            </View>
          ) : null}
          <Text style={styles.targetHint}>
            {mode === 'hwatu'
              ? getLocalizedText(language, modeOption.labels)
              : t('game.target', {
                  score: game.targetScore,
                  mode: getLocalizedText(language, modeOption.labels),
                })}
          </Text>
        </View>

        <CollectedPileView cardIds={human.collected} playerIndex={humanIndex} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{t('game.yourHand')}</Text>
            <View style={styles.playerMeta}>
              {game.dealerIndex === humanIndex ? (
                <Text style={styles.dealerBadge}>{t('game.dealer')}</Text>
              ) : null}
              <Text style={styles.scoreBadge}>
                {t('game.points', { score: human.score })}
                {human.goCount > 0 ? ` · ${human.goCount}고` : ''}
              </Text>
              <Text style={styles.sectionMeta}>
                {t('game.cardCount', { count: human.hand.length })}
              </Text>
            </View>
          </View>
          <HandFanView
            cardIds={human.hand}
            playerIndex={humanIndex}
            playableCardIds={playableSet}
            hiddenCardIds={hiddenCards}
            onCardPress={playCard}
            selected={isHumanTurn && !needsTableChoice}
            disabled={!isHumanTurn || needsTableChoice || game.phase !== 'playing' || isAnimating}
          />
        </View>
      </ScrollView>

      <GoStopModal
        visible={showGoStopModal}
        score={human.score}
        targetScore={game.targetScore}
        goCount={human.goCount}
        language={language}
        onGo={callGo}
        onStop={callStop}
      />

      <SepCupModal
        visible={showSepCupModal}
        language={language}
        onAnimal={() => chooseSepCup('animal')}
        onJunk={() => chooseSepCup('junk')}
      />

      <TurnAnimationOverlay activeFlight={activeFlight} onFlightComplete={onFlightComplete} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.felt,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.cream,
    fontSize: 15,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  back: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: '600',
  },
  turnHint: {
    flex: 1,
    color: colors.cream,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  status: {
    color: colors.cream,
    opacity: 0.8,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 14,
  },
  opponentBar: {
    paddingHorizontal: 16,
    gap: 6,
  },
  opponentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  opponentName: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: '600',
  },
  handCount: {
    color: colors.cream,
    opacity: 0.65,
    fontSize: 12,
  },
  scoreBadge: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  aiHandRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  section: {
    gap: 8,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionMeta: {
    color: colors.cream,
    opacity: 0.65,
    fontSize: 13,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dealerBadge: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prompt: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  tableItem: {
    alignItems: 'center',
    gap: 4,
  },
  hidden: {
    opacity: 0,
  },
  stackLabel: {
    color: colors.cream,
    opacity: 0.65,
    fontSize: 11,
    fontWeight: '600',
  },
  middleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 16,
  },
  deckPile: {
    alignItems: 'center',
    gap: 4,
  },
  deckCount: {
    color: colors.cream,
    opacity: 0.75,
    fontSize: 12,
    fontWeight: '600',
  },
  flippedPreview: {
    alignItems: 'center',
    gap: 4,
  },
  flippedLabel: {
    color: colors.cream,
    opacity: 0.65,
    fontSize: 11,
  },
  targetHint: {
    flex: 1,
    color: colors.cream,
    opacity: 0.5,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'right',
  },
});
