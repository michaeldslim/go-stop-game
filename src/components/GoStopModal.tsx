import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

interface GoStopModalProps {
  visible: boolean;
  score: number;
  targetScore: number;
  goCount: number;
  language: 'en' | 'ko';
  onGo: () => void;
  onStop: () => void;
}

export function GoStopModal({
  visible,
  score,
  targetScore,
  goCount,
  language,
  onGo,
  onStop,
}: GoStopModalProps) {
  const isKo = language === 'ko';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {isKo ? `${score}점 달성!` : `You have ${score} points!`}
          </Text>
          <Text style={styles.subtitle}>
            {isKo
              ? `목표 ${targetScore}점 — 고를 부르거나 스톱하세요`
              : `Target is ${targetScore} — call Go or Stop`}
          </Text>
          {goCount > 0 ? (
            <Text style={styles.goHint}>
              {isKo ? `현재 ${goCount}고` : `Current: ${goCount} Go`}
            </Text>
          ) : null}
          <Text style={styles.risk}>
            {isKo
              ? '고: 계속 플레이 (상대가 먼저 목표 달성 시 고박 위험)'
              : 'Go: keep playing (risk 고박 if opponent reaches target first)'}
          </Text>

          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.stopButton]} onPress={onStop}>
              <Text style={styles.stopText}>{isKo ? '스톱' : 'Stop'}</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.goButton]} onPress={onGo}>
              <Text style={styles.goText}>{isKo ? '고!' : 'Go!'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.felt,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.gold,
    padding: 24,
    gap: 12,
  },
  title: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.cream,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  goHint: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  risk: {
    color: colors.cream,
    opacity: 0.7,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  stopButton: {
    borderWidth: 2,
    borderColor: colors.gold,
  },
  goButton: {
    backgroundColor: colors.gold,
  },
  stopText: {
    color: colors.gold,
    fontSize: 17,
    fontWeight: '700',
  },
  goText: {
    color: colors.felt,
    fontSize: 17,
    fontWeight: '700',
  },
});
