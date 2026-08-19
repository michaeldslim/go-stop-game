import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { View, type LayoutChangeEvent, type ViewProps } from 'react-native';

export interface AnchorPoint {
  x: number;
  y: number;
}

type RemeasureFn = (onComplete: () => void) => void;

interface LayoutAnchorContextValue {
  register: (key: string, point: AnchorPoint) => void;
  unregister: (key: string) => void;
  get: (key: string) => AnchorPoint | undefined;
  remeasureAll: () => Promise<void>;
  subscribeRemeasure: (fn: RemeasureFn) => () => void;
}

const LayoutAnchorContext = createContext<LayoutAnchorContextValue | null>(null);

export function LayoutAnchorProvider({ children }: { children: ReactNode }) {
  const anchors = useRef<Record<string, AnchorPoint>>({});
  const remeasureFns = useRef<Set<RemeasureFn>>(new Set());

  const register = useCallback((key: string, point: AnchorPoint) => {
    anchors.current[key] = point;
  }, []);

  const unregister = useCallback((key: string) => {
    delete anchors.current[key];
  }, []);

  const get = useCallback((key: string) => anchors.current[key], []);

  const subscribeRemeasure = useCallback((fn: RemeasureFn) => {
    remeasureFns.current.add(fn);
    return () => {
      remeasureFns.current.delete(fn);
    };
  }, []);

  const remeasureAll = useCallback((): Promise<void> => {
    const fns = [...remeasureFns.current];
    if (fns.length === 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let remaining = fns.length;
      const done = () => {
        remaining -= 1;
        if (remaining === 0) {
          requestAnimationFrame(() => resolve());
        }
      };

      for (const fn of fns) {
        fn(done);
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      register,
      unregister,
      get,
      remeasureAll,
      subscribeRemeasure,
    }),
    [register, unregister, get, remeasureAll, subscribeRemeasure],
  );

  return <LayoutAnchorContext.Provider value={value}>{children}</LayoutAnchorContext.Provider>;
}

export function useLayoutAnchors() {
  const context = useContext(LayoutAnchorContext);
  if (!context) {
    throw new Error('useLayoutAnchors must be used within LayoutAnchorProvider');
  }
  return context;
}

interface LayoutAnchorProps extends ViewProps {
  anchorKey: string;
  children: ReactNode;
}

export function LayoutAnchor({
  anchorKey,
  children,
  style,
  ...rest
}: LayoutAnchorProps) {
  const context = useContext(LayoutAnchorContext);
  const viewRef = useRef<View>(null);

  if (!context) {
    return (
      <View style={style} {...rest}>
        {children}
      </View>
    );
  }

  const { register, unregister, subscribeRemeasure } = context;

  const measure = useCallback(
    (onComplete?: () => void) => {
      if (!viewRef.current) {
        onComplete?.();
        return;
      }

      viewRef.current.measureInWindow((x, y, width, height) => {
        const point = { x: x + width / 2, y: y + height / 2 };
        register(anchorKey, point);
        onComplete?.();
      });
    },
    [anchorKey, register],
  );

  const onLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      measure();
    },
    [measure],
  );

  useEffect(() => {
    return subscribeRemeasure((onComplete) => {
      measure(onComplete);
    });
  }, [subscribeRemeasure, measure]);

  useEffect(() => {
    return () => {
      unregister(anchorKey);
    };
  }, [anchorKey, unregister]);

  return (
    <View ref={viewRef} onLayout={onLayout} style={style} collapsable={false} {...rest}>
      {children}
    </View>
  );
}

export const anchorKeys = {
  deck: 'deck',
  hand: (playerIndex: number, cardId: string) => `hand-${playerIndex}-${cardId}`,
  aiHand: (playerIndex: number) => `ai-hand-${playerIndex}`,
  table: (index: number) => `table-${index}`,
  tableCenter: 'table-center',
  pile: (playerIndex: number) => `pile-${playerIndex}`,
};
