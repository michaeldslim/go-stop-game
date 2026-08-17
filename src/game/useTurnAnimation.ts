import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';
import type { GameSoundEffect, MatgoGameState } from '../types/gameState';
import type { ActiveFlightState } from '../components/TurnAnimationOverlay';
import { anchorKeys, useLayoutAnchors, type AnchorPoint } from '../components/LayoutAnchor';
import {
  applyVisualStep,
  buildTurnSteps,
  soundForStep,
  STEP_TIMING,
  type TurnStep,
} from './turnSteps';

interface ActiveFlight extends ActiveFlightState {}

interface UseTurnAnimationOptions {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  playEffects: (effects: GameSoundEffect[]) => Promise<void>;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function fallbackPoint(): AnchorPoint {
  return { x: 200, y: 400 };
}

export function useTurnAnimation({
  soundEnabled,
  hapticsEnabled,
  playEffects,
}: UseTurnAnimationOptions) {
  const { get } = useLayoutAnchors();
  const [displayGame, setDisplayGame] = useState<MatgoGameState | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeFlight, setActiveFlight] = useState<ActiveFlight | null>(null);
  const flightResolveRef = useRef<(() => void) | null>(null);

  const resolveAnchor = useCallback(
    (key: string): AnchorPoint => get(key) ?? fallbackPoint(),
    [get],
  );

  const resolveStepFlight = useCallback(
    (step: TurnStep, visual: MatgoGameState): ActiveFlight | null => {
      switch (step.type) {
        case 'playHand': {
          const from =
            get(anchorKeys.hand(step.playerIndex, step.cardId)) ??
            resolveAnchor(anchorKeys.aiHand(step.playerIndex));
          const tableIndex = visual.table.length;
          const to = resolveAnchor(anchorKeys.table(tableIndex));
          return {
            id: `play-${step.cardId}`,
            cardId: step.cardId,
            from,
            to,
            size: 'hand',
            faceDown: step.playerIndex !== 0,
            flipOnArrival: false,
            durationMs: STEP_TIMING.playHand,
          };
        }
        case 'flipDeck': {
          return {
            id: `flip-${step.cardId}`,
            cardId: step.cardId,
            from: resolveAnchor(anchorKeys.deck),
            to: resolveAnchor(anchorKeys.table(visual.table.length)),
            size: 'small',
            faceDown: true,
            flipOnArrival: true,
            durationMs: STEP_TIMING.flipDeck,
          };
        }
        case 'collect': {
          const cardId = step.cardIds[0];
          if (!cardId) {
            return null;
          }
          const tableIndex = visual.table.findIndex((tableCard) => {
            const ids = [tableCard.cardId, ...(tableCard.stackedCardIds ?? [])];
            return ids.some((id) => step.cardIds.includes(id));
          });
          const from =
            tableIndex >= 0
              ? resolveAnchor(anchorKeys.table(tableIndex))
              : resolveAnchor(anchorKeys.deck);
          return {
            id: `collect-${cardId}`,
            cardId,
            from,
            to: resolveAnchor(anchorKeys.pile(step.playerIndex)),
            size: 'table',
            faceDown: false,
            flipOnArrival: false,
            durationMs: STEP_TIMING.collect,
          };
        }
        case 'stack': {
          return {
            id: `stack-${step.flippedCardId}`,
            cardId: step.flippedCardId,
            from: resolveAnchor(anchorKeys.deck),
            to: resolveAnchor(anchorKeys.table(Math.max(visual.table.length - 1, 0))),
            size: 'small',
            faceDown: false,
            flipOnArrival: false,
            durationMs: STEP_TIMING.stack,
          };
        }
        default:
          return null;
      }
    },
    [get, resolveAnchor],
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
      const sound = soundForStep(step);
      if (sound && soundEnabled) {
        void playEffects([sound]);
      }
      if (step.type === 'collect' && hapticsEnabled) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (step.type === 'pause') {
        await delay(step.durationMs);
        return visual;
      }

      const flight = resolveStepFlight(step, visual);
      if (flight) {
        await waitForFlight(flight);
      }

      return applyVisualStep(visual, step);
    },
    [hapticsEnabled, playEffects, resolveStepFlight, soundEnabled, waitForFlight],
  );

  const animateTurn = useCallback(
    async (before: MatgoGameState, after: MatgoGameState): Promise<void> => {
      const steps = buildTurnSteps(before, after);
      if (steps.length === 0) {
        return;
      }

      setIsAnimating(true);
      let visual = before;
      setDisplayGame(before);

      for (const step of steps) {
        visual = await runStep(step, visual);
        setDisplayGame(visual);
      }

      setDisplayGame(after);
      setIsAnimating(false);
    },
    [runStep],
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
