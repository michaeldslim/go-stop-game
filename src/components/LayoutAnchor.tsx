import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { View, type LayoutChangeEvent, type ViewProps } from 'react-native';

export interface AnchorPoint {
  x: number;
  y: number;
}

interface LayoutAnchorContextValue {
  register: (key: string, point: AnchorPoint) => void;
  get: (key: string) => AnchorPoint | undefined;
}

const LayoutAnchorContext = createContext<LayoutAnchorContextValue | null>(null);

export function LayoutAnchorProvider({ children }: { children: ReactNode }) {
  const anchors = useRef<Record<string, AnchorPoint>>({});

  const register = useCallback((key: string, point: AnchorPoint) => {
    anchors.current[key] = point;
  }, []);

  const get = useCallback((key: string) => anchors.current[key], []);

  const value = useMemo(() => ({ register, get }), [register, get]);

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

export function LayoutAnchor({ anchorKey, children, style, ...rest }: LayoutAnchorProps) {
  const { register } = useLayoutAnchors();
  const viewRef = useRef<View>(null);

  const measure = useCallback(() => {
    viewRef.current?.measureInWindow((x, y, width, height) => {
      register(anchorKey, { x: x + width / 2, y: y + height / 2 });
    });
  }, [anchorKey, register]);

  const onLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      measure();
    },
    [measure],
  );

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
  pile: (playerIndex: number) => `pile-${playerIndex}`,
};
