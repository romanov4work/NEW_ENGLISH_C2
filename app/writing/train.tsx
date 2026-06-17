import { useState, useMemo, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '../../lib/theme';
import cardsData from './cards_database/cards_database.json';

type Phase = 'review' | 'select' | 'exercises' | 'results';

// Собираем карточки из активных коллекций
const allCards = cardsData
  .filter(collection => collection.active)
  .flatMap(c => c.cards);

// Review: карточки на повторение (пока пустой, т.к. нет dueDate)
const REVIEW_CARDS = allCards.filter(card => card.status === "studying");

// Select: новые карточки
const SELECT_CARDS = allCards.filter(card => card.status === "new");

// Exercises: берем первые 10 новых карточек для упражнений
const EXERCISES_CARDS = allCards.filter(card => card.status === "new").slice(0, 10);

function getActivePhases(): Phase[] {
  const phases: Phase[] = [];
  if (REVIEW_CARDS.length > 0) phases.push("review");
  if (SELECT_CARDS.length > 0) phases.push("select");
  if (EXERCISES_CARDS.length > 0) phases.push("exercises");
  return phases;
}

export default function Train() {
  const router = useRouter();
  const activePhases = useMemo(() => getActivePhases(), []);
  const [phase, setPhase] = useState<Phase>(activePhases[0] || 'results');

  const [reviewCurrent, setReviewCurrent] = useState(0);
  const [selectCurrent, setSelectCurrent] = useState(0);
  const [exercisesCurrent, setExercisesCurrent] = useState(0);

  const goToNextPhase = () => {
    const currentIndex = activePhases.indexOf(phase);
    if (currentIndex < activePhases.length - 1) {
      setPhase(activePhases[currentIndex + 1]);
    } else {
      setPhase('results');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={COMMON_STYLES.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>◀</Text>
        </Pressable>
        <Text style={COMMON_STYLES.title}>Тренировка сочинений</Text>
      </View>

      {/* Progress bar */}
      {phase !== 'results' && activePhases.length > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {activePhases.includes('review') && (
              <>
                <View style={styles.progressSection}>
                  {Array.from({ length: REVIEW_CARDS.length }).map((_, idx) => (
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
                {activePhases.length > 1 && <View style={styles.progressDivider} />}
              </>
            )}
            {activePhases.includes('select') && (
              <>
                <View style={styles.progressSection}>
                  {Array.from({ length: SELECT_CARDS.length }).map((_, idx) => (
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
                {activePhases.indexOf('select') < activePhases.length - 1 && <View style={styles.progressDivider} />}
              </>
            )}
            {activePhases.includes('exercises') && (
              <View style={styles.progressSection}>
                {Array.from({ length: EXERCISES_CARDS.length }).map((_, idx) => (
                  <View
                    key={`exercises-${idx}`}
                    style={[
                      styles.progressSegment,
                      phase === 'exercises' && idx < exercisesCurrent && styles.progressSegmentActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
          <View style={styles.progressLabels}>
            {activePhases.includes('review') && (
              <>
                <View style={styles.progressLabelContainer}>
                  <Text style={styles.progressLabel}>Повторение</Text>
                </View>
                {activePhases.length > 1 && <View style={styles.progressLabelDivider} />}
              </>
            )}
            {activePhases.includes('select') && (
              <>
                <View style={styles.progressLabelContainer}>
                  <Text style={styles.progressLabel}>Выбор</Text>
                </View>
                {activePhases.indexOf('select') < activePhases.length - 1 && <View style={styles.progressLabelDivider} />}
              </>
            )}
            {activePhases.includes('exercises') && (
              <View style={styles.progressLabelContainer}>
                <Text style={styles.progressLabel}>Упражнения</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.content}>
        {phase === 'review' && (
          <ReviewPhase
            onNext={goToNextPhase}
            current={reviewCurrent}
            setCurrent={setReviewCurrent}
            total={REVIEW_CARDS.length}
          />
        )}
        {phase === 'select' && (
          <SelectPhase
            onNext={goToNextPhase}
            current={selectCurrent}
            setCurrent={setSelectCurrent}
            total={SELECT_CARDS.length}
          />
        )}
        {phase === 'exercises' && (
          <ExercisesPhase
            onNext={goToNextPhase}
            current={exercisesCurrent}
            setCurrent={setExercisesCurrent}
            total={EXERCISES_CARDS.length}
          />
        )}
        {phase === 'results' && <ResultsPhase onFinish={() => router.back()} />}
      </View>
    </SafeAreaView>
  );
}

function ReviewPhase({
  onNext,
  current,
  setCurrent,
  total,
}: {
  onNext: () => void;
  current: number;
  setCurrent: (n: number) => void;
  total: number;
}) {
  const currentCard = REVIEW_CARDS[current];

  const handleAnswer = (quality: 'good' | 'medium' | 'bad') => {
    if (current < total - 1) {
      setCurrent(current + 1);
    } else {
      onNext();
    }
  };

  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.phaseTitle}>Повторение</Text>
        <Text style={styles.phaseText}>Карточка {current + 1} из {total}</Text>
        <View style={styles.card}>
          <Text style={styles.cardWord}>{currentCard.title}</Text>
          <Text style={styles.cardTranslation}>{currentCard.ru}</Text>
        </View>
      </View>
      <View style={styles.bottomBar}>
        <View style={styles.buttonRow}>
          <Pressable style={[styles.buttonThird, styles.buttonLightGray]} onPress={() => handleAnswer('bad')}>
            <Text style={styles.buttonThirdText}>Не помню</Text>
          </Pressable>
          <Pressable style={[styles.buttonThird, styles.buttonDarkGray]} onPress={() => handleAnswer('medium')}>
            <Text style={styles.buttonThirdText}>Плохо помню</Text>
          </Pressable>
          <Pressable style={[styles.buttonThird, styles.buttonBlack]} onPress={() => handleAnswer('good')}>
            <Text style={styles.buttonThirdText}>Помню</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

function SelectPhase({
  onNext,
  current,
  setCurrent,
  total,
}: {
  onNext: () => void;
  current: number;
  setCurrent: (n: number) => void;
  total: number;
}) {
  const currentCard = SELECT_CARDS[current];

  const handleAnswer = (knows: boolean) => {
    if (current < total - 1) {
      setCurrent(current + 1);
    } else {
      onNext();
    }
  };

  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.phaseTitle}>Выбор новых сочинений</Text>
        <Text style={styles.phaseText}>Карточка {current + 1} из {total}</Text>
        <View style={styles.card}>
          <Text style={styles.cardWord}>{currentCard.title}</Text>
          <Text style={styles.cardTranslation}>{currentCard.ru}</Text>
        </View>
      </View>
      <View style={styles.bottomBar}>
        <View style={styles.buttonRow}>
          <Pressable style={[styles.buttonHalf, styles.buttonLightGray]} onPress={() => handleAnswer(false)}>
            <Text style={styles.buttonHalfText}>Не знаю</Text>
          </Pressable>
          <Pressable style={[styles.buttonHalf, styles.buttonBlack]} onPress={() => handleAnswer(true)}>
            <Text style={[styles.buttonHalfText, styles.buttonBlackText]}>Знаю</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

function ExercisesPhase({
  onNext,
  current,
  setCurrent,
  total,
}: {
  onNext: () => void;
  current: number;
  setCurrent: (n: number) => void;
  total: number;
}) {
  const currentCard = EXERCISES_CARDS[current];
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const exercise = currentCard.exercises?.[0];

  // Сбрасываем состояние при смене карточки
  useEffect(() => {
    setSelectedOption(null);
    setShowResult(false);
  }, [current]);

  const handleOptionPress = (index: number) => {
    setSelectedOption(index);
    setShowResult(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowResult(false);
    if (current < total - 1) {
      setCurrent(current + 1);
    } else {
      onNext();
    }
  };

  if (!exercise) {
    return (
      <>
        <View style={styles.phaseContent}>
          <Text style={styles.phaseTitle}>Упражнения</Text>
          <Text style={styles.phaseText}>Карточка {current + 1} из {total}</Text>
          <View style={styles.card}>
            <Text style={styles.cardWord}>{currentCard.title}</Text>
            <Text style={styles.cardTranslation}>{currentCard.ru}</Text>
          </View>
        </View>
        <View style={styles.bottomBar}>
          <Pressable style={COMMON_STYLES.button} onPress={handleNext}>
            <Text style={COMMON_STYLES.buttonText}>Далее</Text>
          </Pressable>
        </View>
      </>
    );
  }

  const isCorrect = selectedOption === exercise.correctIndex;

  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.phaseTitle}>Упражнения</Text>
        <Text style={styles.phaseText}>Карточка {current + 1} из {total}</Text>
        <Text style={styles.exerciseQuestion}>{exercise.question}</Text>
      </View>
      <View style={styles.bottomBar}>
        <View style={styles.exerciseOptions}>
          {exercise.options.map((option, index) => (
            <Pressable
              key={index}
              style={[
                styles.exerciseOption,
                showResult && index === exercise.correctIndex && styles.exerciseOptionCorrect,
                showResult && selectedOption === index && index !== exercise.correctIndex && styles.exerciseOptionWrong,
              ]}
              onPress={() => !showResult && handleOptionPress(index)}
              disabled={showResult}
            >
              <Text style={styles.exerciseOptionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
        {showResult && (
          <Pressable style={COMMON_STYLES.button} onPress={handleNext}>
            <Text style={COMMON_STYLES.buttonText}>
              {isCorrect ? 'Правильно! Далее' : 'Далее'}
            </Text>
          </Pressable>
        )}
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
  buttonThird: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonThirdText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.white,
  },
  buttonLightGray: {
    backgroundColor: COLORS.gray[500],
  },
  buttonDarkGray: {
    backgroundColor: COLORS.gray[700],
  },
  buttonBlack: {
    backgroundColor: COLORS.black,
  },
  buttonHalf: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonHalfText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.white,
  },
  buttonBlackText: {
    color: COLORS.white,
  },

  // Exercise styles
  exerciseQuestion: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.black,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  exerciseOptions: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  exerciseOption: {
    backgroundColor: COLORS.gray[50],
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
  },
  exerciseOptionCorrect: {
    backgroundColor: "#D4EDDA",
    borderColor: "#28A745",
  },
  exerciseOptionWrong: {
    backgroundColor: "#F8D7DA",
    borderColor: "#DC3545",
  },
  exerciseOptionText: {
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.black,
    textAlign: "center",
  },
});
