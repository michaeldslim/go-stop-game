import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/colors';
import { RULE_SECTION_KEYS } from '../src/i18n/translations';
import { useTranslation } from '../src/i18n/useTranslation';

export default function RulesScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{t('rules.back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('rules.title')}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {RULE_SECTION_KEYS.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.ruleTitle}>{t(section.title)}</Text>
            <Text style={styles.ruleBody}>{t(section.body)}</Text>
          </View>
        ))}
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
});
