import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '../../lib/theme';

type Phase = 'review' | 'select' | 'exercises' | 'results';

export default function Train() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('review');

  // Прогресс для каждой фазы
  const [reviewCurrent, setReviewCurrent] = useState(0);
  const [selectCurrent, setSelectCurrent] = useState(0);
  const [exercisesCurrent, setExercisesCurrent] = useState(0);

  const reviewTotal = 10;
  const selectTotal = 10;
  const exercisesTotal = 10;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={COMMON_STYLES.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>◀</Text>
        </Pressable>
        <Text style={COMMON_STYLES.title}>Тренировка</Text>
      </View>

      {/* Progress bar */}
      {phase !== 'results' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressSection}>
              {Array.from({ length: reviewTotal }).map((_, idx) => (
                <View
                  key={`review-${idx}`}
                  style={[
                    styles.progressSegment,
                    phase === 'review' && idx < reviewCurrent && styles.progressSegmentActive,
                    (phase === 'select' || phase === 'exercises') && styles.progressSegmentActive,
                  ]}
                />
              ))}
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressSection}>
              {Array.from({ length: selectTotal }).map((_, idx) => (
                <View
                  key={`select-${idx}`}
                  style={[
                    styles.progressSegment,
                    phase === 'select' && idx < selectCurrent && styles.progressSegmentActive,
                    phase === 'exercises' && styles.progressSegmentActive,
                  ]}
                />
              ))}
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressSection}>
              {Array.from({ length: exercisesTotal }).map((_, idx) => (
                <View
                  key={`exercises-${idx}`}
                  style={[
                    styles.progressSegment,
                    phase === 'exercises' && idx < exercisesCurrent && styles.progressSegmentActive,
                  ]}
                />
              ))}
            </View>
          </View>
          <View style={styles.progressLabels}>
            <View style={styles.progressLabelContainer}>
              <Text style={styles.progressLabel}>Повторение</Text>
            </View>
            <View style={styles.progressLabelDivider} />
            <View style={styles.progressLabelContainer}>
              <Text style={styles.progressLabel}>Выбор</Text>
            </View>
            <View style={styles.progressLabelDivider} />
            <View style={styles.progressLabelContainer}>
              <Text style={styles.progressLabel}>Упражнения</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.content}>
        {phase === 'review' && <ReviewPhase onNext={() => setPhase('select')} />}
        {phase === 'select' && <SelectPhase onNext={() => setPhase('exercises')} />}
        {phase === 'exercises' && <ExercisesPhase onNext={() => setPhase('results')} />}
        {phase === 'results' && <ResultsPhase onFinish={() => router.back()} />}
      </View>
    </SafeAreaView>
  );
}

function ReviewPhase({ onNext }: { onNext: () => void }) {
  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.phaseTitle}>Повторение</Text>
        <Text style={styles.phaseText}>Повторите карточки с истекшим интервалом</Text>
        <View style={styles.card}>
          <Text style={styles.cardInfo}>Нет карточек для повторения</Text>
        </View>
      </View>
      <View style={styles.bottomBar}>
        <Pressable style={COMMON_STYLES.button} onPress={onNext}>
          <Text style={COMMON_STYLES.buttonText}>Далее</Text>
        </Pressable>
      </View>
    </>
  );
}

function SelectPhase({ onNext }: { onNext: () => void }) {
  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.phaseTitle}>Выбор новых слов</Text>
        <Text style={styles.phaseText}>Отметьте слова, которые хотите изучить</Text>
        <View style={styles.card}>
          <Text style={styles.cardWord}>example</Text>
          <Text style={styles.cardTranslation}>пример, образец</Text>
        </View>
      </View>
      <View style={styles.bottomBar}>
        <View style={styles.buttonRow}>
          <Pressable style={styles.buttonHalf} onPress={onNext}>
            <Text style={styles.buttonHalfText}>Знаю</Text>
          </Pressable>
          <Pressable style={[styles.buttonHalf, styles.buttonPrimary]} onPress={onNext}>
            <Text style={[styles.buttonHalfText, styles.buttonPrimaryText]}>Учить</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

function ExercisesPhase({ onNext }: { onNext: () => void }) {
  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.phaseTitle}>Упражнения</Text>
        <Text style={styles.phaseText}>Карточка 1 из 5</Text>
        <View style={styles.card}>
          <Text style={styles.cardWord}>example</Text>
          <Text style={styles.cardTranslation}>пример, образец</Text>
        </View>
      </View>
      <View style={styles.bottomBar}>
        <Pressable style={COMMON_STYLES.button} onPress={onNext}>
          <Text style={COMMON_STYLES.buttonText}>Далее</Text>
        </Pressable>
      </View>
    </>
  );
}

function ResultsPhase({ onFinish }: { onFinish: () => void }) {
  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.phaseTitle}>Результаты</Text>
        <View style={styles.statsCard}>
          <StatRow label="Новых слов изучено" value="0" />
          <StatRow label="Повторений сделано" value="0" />
          <StatRow label="Время" value="0 мин" />
        </View>
      </View>
      <View style={styles.bottomBar}>
        <Pressable style={COMMON_STYLES.button} onPress={onFinish}>
          <Text style={COMMON_STYLES.buttonText}>Готово</Text>
        </Pressable>
      </View>
    </>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.white },
  back: { paddingRight: SPACING.lg },
  backText: { fontSize: TYPOGRAPHY.size.xl, color: COLORS.black },

  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  progressBar: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  progressSection: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.gray[100],
    borderRadius: 2,
  },
  progressSegmentActive: {
    backgroundColor: COLORS.black,
  },
  progressDivider: {
    width: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  progressLabelContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressLabelDivider: {
    width: 8,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.gray[500],
    fontWeight: TYPOGRAPHY.weight.semibold,
  },

  content: { flex: 1 },

  phaseContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxxl,
    justifyContent: 'flex-start',
  },
  phaseTitle: {
    fontSize: TYPOGRAPHY.size.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  phaseText: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
  },

  card: {
    ...COMMON_STYLES.card,
    alignItems: 'center',
    paddingVertical: 48,
  },
  cardWord: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  cardTranslation: {
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.gray[600],
  },
  cardInfo: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.gray[500],
  },

  statsCard: {
    ...COMMON_STYLES.card,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray[100],
  },
  statLabel: { fontSize: TYPOGRAPHY.size.base, color: COLORS.black },
  statValue: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.black,
  },

  bottomBar: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.white,
  },
  buttonRow: { flexDirection: 'row', gap: SPACING.sm },
  buttonHalf: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonHalfText: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.primary,
  },
  buttonPrimary: { backgroundColor: COLORS.primary },
  buttonPrimaryText: { color: COLORS.white },
});
