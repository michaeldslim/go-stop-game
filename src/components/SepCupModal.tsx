import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import type { AppLanguage } from '../types/game';

interface SepCupModalProps {
  visible: boolean;
  language: AppLanguage;
  onAnimal: () => void;
  onJunk: () => void;
}

export function SepCupModal({ visible, language, onAnimal, onJunk }: SepCupModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {language === 'ko' ? '국화잔 역할 선택' : 'September cup role'}
          </Text>
          <Text style={styles.body}>
            {language === 'ko'
              ? '9월 국화잔을 열끗 또는 쌍피(+2)로 사용합니다.'
              : 'Count the September cup as animal (열끗) or double junk (+2 pi).'}
          </Text>
          <Pressable style={styles.button} onPress={onAnimal}>
            <Text style={styles.buttonText}>
              {language === 'ko' ? '열끗 (동물)' : 'Animal (열끗)'}
            </Text>
          </Pressable>
          <Pressable style={styles.buttonOutline} onPress={onJunk}>
            <Text style={styles.buttonOutlineText}>
              {language === 'ko' ? '쌍피 (+2)' : 'Double junk (+2 pi)'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.felt,
    borderRadius: 16,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,162,39,0.4)',
    width: '100%',
    maxWidth: 340,
  },
  title: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    color: colors.cream,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    opacity: 0.85,
  },
  button: {
    backgroundColor: colors.gold,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.felt,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: colors.gold,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonOutlineText: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '700',
  },
});
