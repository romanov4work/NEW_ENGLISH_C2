import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '../../../lib/theme';

export default function CardDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Мок-данные карточки правила
  const card = {
    id,
    title: 'Present Simple',
    ru: 'Простое настоящее время',
    theory: 'Используется для описания регулярных действий, фактов и общих истин.',
    examples: [
      { en: 'I work every day.', ru: 'Я работаю каждый день.' },
      { en: 'She speaks English.', ru: 'Она говорит по-английски.' },
    ],
    status: 'new', // new | studying | learned
    repeatCount: 0,
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={COMMON_STYLES.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>◀</Text>
        </Pressable>
        <Text style={COMMON_STYLES.title}>Правило</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Правило */}
        <View style={styles.ruleCard}>
          <Text style={styles.ruleTitle}>{card.title}</Text>
          <Text style={styles.ruleRu}>{card.ru}</Text>
        </View>

        {/* Теория */}
        <Text style={styles.sectionLabel}>ТЕОРИЯ</Text>
        <View style={styles.theoryCard}>
          <Text style={styles.theoryText}>{card.theory}</Text>
        </View>

        {/* Примеры */}
        <Text style={styles.sectionLabel}>ПРИМЕРЫ</Text>
        {card.examples.map((ex, idx) => (
          <View key={idx} style={styles.exampleCard}>
            <Text style={styles.exampleEn}>{ex.en}</Text>
            <Text style={styles.exampleRu}>{ex.ru}</Text>
          </View>
        ))}

        {/* Прогресс */}
        <Text style={styles.sectionLabel}>ПРОГРЕСС</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Статус</Text>
            <Text style={styles.progressValue}>
              {card.status === 'new' && 'Не изучено'}
              {card.status === 'studying' && 'На изучении'}
              {card.status === 'learned' && 'Выучено'}
            </Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Повторений</Text>
            <Text style={styles.progressValue}>{card.repeatCount}</Text>
          </View>
        </View>

        {/* Кнопки */}
        <View style={styles.actions}>
          <Pressable style={[styles.actionBtn, styles.actionBtnPrimary]}>
            <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>Тренировать</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.white },
  back: { paddingRight: SPACING.lg },
  backText: { fontSize: TYPOGRAPHY.size.xl, color: COLORS.black },

  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xs, paddingBottom: SPACING.xxxl },

  ruleCard: {
    ...COMMON_STYLES.card,
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    marginTop: SPACING.lg,
  },
  ruleTitle: { fontSize: 32, fontWeight: TYPOGRAPHY.weight.bold, color: COLORS.black, marginBottom: SPACING.sm },
  ruleRu: { fontSize: TYPOGRAPHY.size.lg, color: COLORS.gray[600] },

  sectionLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.gray[400],
    letterSpacing: 1,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },

  theoryCard: {
    ...COMMON_STYLES.card,
    marginBottom: SPACING.sm,
  },
  theoryText: { fontSize: TYPOGRAPHY.size.base, color: COLORS.black, lineHeight: 22 },

  exampleCard: {
    ...COMMON_STYLES.card,
    marginBottom: SPACING.sm,
  },
  exampleEn: { fontSize: TYPOGRAPHY.size.base, color: COLORS.black, marginBottom: SPACING.xs },
  exampleRu: { fontSize: TYPOGRAPHY.size.sm, color: COLORS.gray[600] },

  progressCard: {
    ...COMMON_STYLES.card,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray[100],
  },
  progressLabel: { fontSize: TYPOGRAPHY.size.base, color: COLORS.black },
  progressValue: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold, color: COLORS.black },

  actions: {
    marginTop: SPACING.xl,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, color: COLORS.white },
  actionBtnPrimary: { backgroundColor: COLORS.primary },
  actionBtnTextPrimary: { color: COLORS.white },
});
