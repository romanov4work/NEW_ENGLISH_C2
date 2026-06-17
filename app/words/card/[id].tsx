import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '../../../lib/theme';
import cardsData from '../cards_database/cards_database.json';

export default function CardDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Ищем карточку по ID во всех коллекциях
  const allCards = cardsData.flatMap(c => c.cards);
  const card = allCards.find(c => c.id === id);

  if (!card) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={{ textAlign: 'center', marginTop: 50, color: COLORS.gray[400] }}>
          Карточка не найдена
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={COMMON_STYLES.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>◀</Text>
        </Pressable>
        <Text style={COMMON_STYLES.title}>Карточка</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Слово */}
        <View style={styles.wordCard}>
          <Text style={styles.wordEn}>{card.en}</Text>
          <Text style={styles.wordRu}>{card.ru.join(', ')}</Text>
        </View>

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
        </View>

        {/* Кнопки */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => router.push('/words/train')}
          >
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

  wordCard: {
    ...COMMON_STYLES.card,
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    marginTop: SPACING.lg,
  },
  wordEn: { fontSize: 32, fontWeight: TYPOGRAPHY.weight.bold, color: COLORS.black, marginBottom: SPACING.sm },
  wordRu: { fontSize: TYPOGRAPHY.size.lg, color: COLORS.gray[600] },

  sectionLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.gray[400],
    letterSpacing: 1,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },

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
