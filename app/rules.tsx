import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/colors';

const RULES = [
  {
    title: 'The Deck',
    body:
      'Hwatu has 48 cards — 4 per month. Match by month (same flower). Types: Bright (광), Animal (열끗), Ribbon (띠), Junk (피). 25 pi total including 3 쌍피 (double junk).',
  },
  {
    title: 'Setup',
    body:
      'Go-Stop (3P): 7 cards each, 6 on table, stop at 3 points. Matgo (2P): 10 cards each, 8 on table, stop at 7 points.',
  },
  {
    title: 'Your Turn',
    body:
      'Play one hand card, flip the top deck card, then collect matches by month. If 3 same-month cards stack (뻑), they cannot be taken until a fourth match.',
  },
  {
    title: 'Scoring',
    body:
      '3 광 = 3 (비광 with rain = 2) · 4 광 = 4 · 5 광 = 15 · Godori (Feb+Apr+Aug) = 5 · 5+ 열끗/띠 = 1+ · 7+ 열끗 = 2× final · 10+ 피 = 1+ · 쌍피 = 2 pi each',
  },
  {
    title: 'Go / Stop',
    body:
      'At target score: Stop to win, or Go for bonus (+1 at 1고/2고, then ×2 at 3고+). Risk 고박 if an opponent wins first. 나가리 = void hand, next hand pays double.',
  },
  {
    title: 'Special Moves',
    body:
      '쪽 · 따닥 · 싹쓸이 · 뻑 — take 1 피 from each opponent. 흔들기 · 폭탄 — declare with 3 of a month; 2× score if you win.',
  },
  {
    title: 'September Cup',
    body:
      'The 9월 국화잔 can be scored as either 열끗 (animal) or 쌍피 (double junk, +2 pi). Choose when you collect it.',
  },
];

export default function RulesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>How to Play</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {RULES.map((rule) => (
          <View key={rule.title} style={styles.card}>
            <Text style={styles.ruleTitle}>{rule.title}</Text>
            <Text style={styles.ruleBody}>{rule.body}</Text>
          </View>
        ))}
        <Text style={styles.credit}>
          Rules based on the{' '}
          <Text style={styles.link}>도까함 Go-Stop guide</Text>
          {' '}and Instructables.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.felt,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  back: {
    color: colors.gold,
    fontSize: 16,
  },
  title: {
    color: colors.cream,
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  ruleTitle: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '700',
  },
  ruleBody: {
    color: colors.cream,
    fontSize: 15,
    lineHeight: 22,
  },
  credit: {
    color: colors.cream,
    opacity: 0.6,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  link: {
    color: colors.gold,
  },
});
