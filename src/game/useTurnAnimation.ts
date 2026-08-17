import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';
import type { MatgoGameState } from '../types/gameState';
import type { ActiveFlightState } from '../components/TurnAnimationOverlay';
import { anchorKeys, useLayoutAnchors, type AnchorPoint } from '../components/LayoutAnchor';
import {
  applyVisualStep,
  buildTurnSteps,
  type TurnStep,
} from './turnSteps';
import type { GameSpeedTimings } from './gameSpeed';

interface ActiveFlight extends ActiveFlightState {}

interface UseTurnAnimationOptions {
  hapticsEnabled: boolean;
  stepTiming: GameSpeedTimings;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function fallbackPoint(): AnchorPoint {
  return { x: 200, y: 400 };
}

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export function useTurnAnimation({
  hapticsEnabled,
  stepTiming,
}: UseTurnAnimationOptions) {
  const { get, remeasureAll } = useLayoutAnchors();
  const [displayGame, setDisplayGame] = useState<MatgoGameState | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeFlight, setActiveFlight] = useState<ActiveFlight | null>(null);
  const flightResolveRef = useRef<(() => void) | null>(null);

  const resolveAnchor = useCallback(
    (key: string): AnchorPoint => get(key) ?? fallbackPoint(),
    [get],
  );

  const resolveTableTarget = useCallback(
    (targetTableIndex: number): AnchorPoint =>
      get(anchorKeys.table(targetTableIndex)) ??
      get(anchorKeys.tableCenter) ??
      fallbackPoint(),
    [get],
  );

  const resolveStepFlight = useCallback(
    (step: TurnStep, visual: MatgoGameState): ActiveFlight | null => {
      switch (step.type) {
        case 'playHand': {
          const from =
            get(anchorKeys.hand(step.playerIndex, step.cardId)) ??
            resolveAnchor(anchorKeys.aiHand(step.playerIndex));
          const to = resolveTableTarget(step.targetTableIndex);
          return {
            id: `play-${step.cardId}`,
            cardId: step.cardId,
            from,
            to,
            size: 'hand',
            faceDown: step.playerIndex !== 0,
            flipOnArrival: false,
            durationMs: stepTiming.playHand,
          };
        }
        case 'flipDeck': {
          return {
            id: `flip-${step.cardId}`,
            cardId: step.cardId,
            from: resolveAnchor(anchorKeys.deck),
            to: resolveTableTarget(step.targetTableIndex),
            size: 'small',
            faceDown: true,
            flipOnArrival: true,
            durationMs: stepTiming.flipDeck,
          };
        }
        case 'collect': {
          const cardId = step.cardIds[0];
          if (!cardId) {
            return null;
          }
          const tableIndex =
            step.sourceTableIndex ??
            visual.table.findIndex((tableCard) => {
              const ids = [tableCard.cardId, ...(tableCard.stackedCardIds ?? [])];
              return ids.some((id) => step.cardIds.includes(id));
            });
          const from =
            tableIndex >= 0
              ? resolveTableTarget(tableIndex)
              : resolveAnchor(anchorKeys.deck);
          return {
            id: `collect-${cardId}`,
            cardId,
            from,
            to: resolveAnchor(anchorKeys.pile(step.playerIndex)),
            size: 'table',
            faceDown: false,
            flipOnArrival: false,
            durationMs: stepTiming.collect,
          };
        }
        case 'stack': {
          return {
            id: `stack-${step.flippedCardId}`,
            cardId: step.flippedCardId,
            from: resolveAnchor(anchorKeys.deck),
            to: resolveTableTarget(step.targetTableIndex),
            size: 'small',
            faceDown: false,
            flipOnArrival: false,
            durationMs: stepTiming.stack,
          };
        }
        default:
          return null;
      }
    },
    [get, resolveAnchor, resolveTableTarget, stepTiming],
  );

  const waitForFlight = useCallback(
    (flight: ActiveFlight): Promise<void> =>
      new Promise((resolve) => {
        flightResolveRef.current = resolve;
        setActiveFlight(flight);
      }),
    [],
  );

  const onFlightComplete = useCallback(() => {
    setActiveFlight(null);
    flightResolveRef.current?.();
    flightResolveRef.current = null;
  }, []);

  const runStep = useCallback(
    async (step: TurnStep, visual: MatgoGameState): Promise<MatgoGameState> => {
      if (step.type === 'collect' && hapticsEnabled) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (step.type === 'pause') {
        await delay(step.durationMs);
        return visual;
      }

      await waitForNextFrame();
      await remeasureAll();

      const flight = resolveStepFlight(step, visual);
      if (flight) {
        await waitForFlight(flight);
      }

      return applyVisualStep(visual, step);
    },
    [hapticsEnabled, remeasureAll, resolveStepFlight, waitForFlight],
  );

  const animateTurn = useCallback(
    async (before: MatgoGameState, after: MatgoGameState): Promise<void> => {
      const steps = buildTurnSteps(before, after, stepTiming);
      if (steps.length === 0) {
        return;
      }

      setIsAnimating(true);
      let visual = before;
      setDisplayGame(before);
      await waitForNextFrame();
      await remeasureAll();

      for (const step of steps) {
        visual = await runStep(step, visual);
        setDisplayGame(visual);
      }

      setDisplayGame(after);
      setIsAnimating(false);
    },
    [remeasureAll, runStep, stepTiming],
  );

  return {
    displayGame,
    isAnimating,
    animateTurn,
    setDisplayGame,
    activeFlight,
    onFlightComplete,
    inFlightCardId: activeFlight?.cardId ?? null,
  };
}
