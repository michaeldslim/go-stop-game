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
  getLocalizedText,
} from '../src/constants/gameOptions';
import { colors } from '../src/constants/colors';
import { expandTableCard } from '../src/game/tableCards';
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
      <HandFanView
        cardIds={player.hand}
        playerIndex={playerIndex}
        faceDown
        fanDirection="down"
        size="small"
        style={styles.aiHandFan}
      />
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
    pendingTableChoice,
    highlightedHandCards,
    choosableTableIndices,
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

      <SpecialMoveBar
        language={language}
        canShake={canShake}
        canBomb={canBomb}
        onShake={callShake}
        onBomb={callBomb}
        disabled={!isHumanTurn || isAnimating}
      />

      <View style={styles.playArea}>
        <View style={styles.topHandDock}>
          {opponents.map((opponent) => {
            const playerIndex = game.players.findIndex((player) => player.id === opponent.id);
            return (
              <OpponentBar
                key={opponent.id}
                player={opponent}
                playerIndex={playerIndex}
                isDealer={game.dealerIndex === playerIndex}
                difficultyLabel={difficultyLabel}
                dealerLabel={t('game.dealer')}
                pointsLabel={`${t('game.points', { score: opponent.score })}${opponent.goCount > 0 ? ` · ${opponent.goCount}고` : ''}`}
                handCountLabel={t('game.handCount', { count: opponent.hand.length })}
              />
            );
          })}
        </View>

        <ScrollView
          style={styles.middleScroll}
          contentContainerStyle={styles.middleContent}
          showsVerticalScrollIndicator={false}
        >
          {opponents.map((opponent) => {
            const playerIndex = game.players.findIndex((player) => player.id === opponent.id);
            return (
              <CollectedPileView
                key={`pile-${opponent.id}`}
                cardIds={opponent.collected}
                playerIndex={playerIndex}
              />
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
              <Text style={styles.prompt}>
                {pendingTableChoice?.flippedCardId
                  ? t('game.chooseFlipMatch')
                  : t('game.chooseTable')}
              </Text>
            ) : null}
            <View style={styles.tableField}>
              <View style={styles.tableRow}>
                <LayoutAnchor anchorKey={anchorKeys.deck} style={styles.deckSlot}>
                  <CardView card={getCardById('jan-junk-1')} size="pile" faceDown />
                  <Text style={styles.deckCount}>
                    {t('game.deck', { count: game.deck.length })}
                  </Text>
                </LayoutAnchor>
                <View style={styles.tableGrid}>
              {game.table.map((tableCard, index) => {
                const card = getCardById(tableCard.cardId);
                const stackSize = expandTableCard(tableCard).length;
                const choosable = choosableTableIndices.has(index);
                const hidden = hiddenCards?.has(tableCard.cardId);

                return (
                  <LayoutAnchor
                    key={`table-${index}-${tableCard.cardId}`}
                    anchorKey={anchorKeys.table(index)}
                    style={[styles.tableItem, choosable && styles.tableItemChoosable]}
                  >
                    <CardView
                      card={card}
                      size="table"
                      onPress={choosable ? () => chooseTable(index) : undefined}
                      choosable={choosable}
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
                {game.lastFlippedCardId && !hiddenCards?.has(game.lastFlippedCardId) ? (
                  <View style={styles.flippedSlot}>
                    <Text style={styles.flippedLabel}>{t('game.flipped')}</Text>
                    <CardView card={getCardById(game.lastFlippedCardId)} size="pile" />
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <CollectedPileView cardIds={human.collected} playerIndex={humanIndex} />
        </ScrollView>

        <View style={styles.bottomHandDock}>
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
            highlightedCardIds={highlightedHandCards}
            onCardPress={playCard}
            selected={isHumanTurn && !needsTableChoice}
            disabled={!isHumanTurn || needsTableChoice || game.phase !== 'playing' || isAnimating}
            style={styles.playerHandFan}
          />
        </View>
      </View>

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
  playArea: {
    flex: 1,
  },
  topHandDock: {
    paddingTop: 4,
    paddingBottom: 8,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(245, 230, 200, 0.15)',
  },
  middleScroll: {
    flex: 1,
  },
  middleContent: {
    paddingVertical: 12,
    gap: 14,
  },
  bottomHandDock: {
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 16,
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245, 230, 200, 0.15)',
  },
  opponentBar: {
    paddingHorizontal: 16,
    gap: 4,
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
  aiHandFan: {
    alignSelf: 'center',
  },
  playerHandFan: {
    alignSelf: 'center',
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
  tableField: {
    gap: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  deckSlot: {
    alignItems: 'center',
    gap: 2,
  },
  flippedSlot: {
    alignItems: 'center',
    gap: 2,
  },
  tableGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  tableItem: {
    alignItems: 'center',
    gap: 4,
  },
  tableItemChoosable: {
    zIndex: 2,
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
  deckCount: {
    color: colors.cream,
    opacity: 0.75,
    fontSize: 10,
    fontWeight: '600',
  },
  flippedLabel: {
    color: colors.cream,
    opacity: 0.65,
    fontSize: 10,
  },
});
