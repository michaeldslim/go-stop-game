import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/colors';
import { RULE_SECTION_KEYS } from '../src/i18n/translations';
import { useTranslation } from '../src/i18n/useTranslation';

function parseSection(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }
  return undefined;
}

export default function RulesScreen() {
  const router = useRouter();
  const { section: sectionParam } = useLocalSearchParams<{ section?: string }>();
  const scrollTarget = parseSection(sectionParam);
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const pendingScroll = useRef<string | undefined>(scrollTarget);

  const scrollToSection = useCallback((sectionId: string) => {
    const offset = sectionOffsets.current[sectionId];
    if (offset === undefined) {
      pendingScroll.current = sectionId;
      return;
    }

    pendingScroll.current = undefined;
    scrollRef.current?.scrollTo({ y: Math.max(0, offset - 12), animated: true });
  }, []);

  useEffect(() => {
    if (scrollTarget) {
      scrollToSection(scrollTarget);
    }
  }, [scrollTarget, scrollToSection]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{t('rules.back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('rules.title')}</Text>
      </View>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        {RULE_SECTION_KEYS.map((section) => (
          <View
            key={section.title}
            style={styles.card}
            onLayout={(event) => {
              if (!section.id) {
                return;
              }

              sectionOffsets.current[section.id] = event.nativeEvent.layout.y;
              if (pendingScroll.current === section.id) {
                scrollToSection(section.id);
              }
            }}
          >
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
