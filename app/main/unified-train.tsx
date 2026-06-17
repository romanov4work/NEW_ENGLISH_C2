import { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '../../lib/theme';
import { UnifiedCard, normalizeCard, ModuleId } from '../../lib/cardAdapter';
import {
  ChooseExerciseComponent,
  AssembleExerciseComponent,
  TypeExerciseComponent,
  SentenceExerciseComponent,
  Exercise,
} from '../words/train';
import wordsData from '../words/cards_database/cards_database.json';
import grammarData from '../grammar/cards_database/cards_database.json';
import listeningData from '../listening/cards_database/cards_database.json';
import readingData from '../reading/cards_database/cards_database.json';
import pronunciationData from '../pronunciation/cards_database/cards_database.json';
import speakingData from '../speaking/cards_database/cards_database.json';
import writingData from '../writing/cards_database/cards_database.json';

type Phase = 'selection' | 'review' | 'select' | 'exercises' | 'results';

interface Module {
  id: ModuleId;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const MODULES: Module[] = [
  { id: 'words', title: 'Слова', icon: 'library' },
  { id: 'pronunciation', title: 'Фонетика', icon: 'mic' },
  { id: 'grammar', title: 'Грамматика', icon: 'construct' },
  { id: 'reading', title: 'Чтение', icon: 'newspaper' },
  { id: 'writing', title: 'Письмо', icon: 'create' },
  { id: 'listening', title: 'Аудирование', icon: 'headset' },
  { id: 'speaking', title: 'Говорение', icon: 'chatbubbles' },
];

const MODULE_DATA: Record<ModuleId, any> = {
  words: wordsData,
  grammar: grammarData,
  listening: listeningData,
  reading: readingData,
  pronunciation: pronunciationData,
  speaking: speakingData,
  writing: writingData,
};

function getCardsFromModule(moduleId: ModuleId, status: string): UnifiedCard[] {
  const data = MODULE_DATA[moduleId];
  return data
    .filter((collection: any) => collection.active)
    .flatMap((c: any) => c.cards)
    .filter((card: any) => card.status === status)
    .map((card: any) => normalizeCard(card, moduleId));
}

const STORAGE_KEY = '@unified_train_selected_modules';

export default function UnifiedTrain() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('selection');
  const [selectedModules, setSelectedModules] = useState<ModuleId[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentModuleCards, setCurrentModuleCards] = useState<UnifiedCard[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Words exercises state (always declared, used only when phase === 'exercises' && module === 'words')
  const [wordsSettings, setWordsSettings] = useState<{ choose: boolean; assemble: boolean; type: boolean; sentence: boolean } | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentCardExercises, setCurrentCardExercises] = useState<Exercise[]>([]);

  // Сбрасываем состояние упражнений при смене карточки
  useEffect(() => {
    setSelectedOption(null);
    setShowResult(false);
  }, [currentCardIndex]);
  const [moduleProgress, setModuleProgress] = useState<Record<ModuleId, { reviewCompleted: boolean; selectCompleted: boolean; exercisesCompleted: boolean }>>({
    words: { reviewCompleted: false, selectCompleted: false, exercisesCompleted: false },
    pronunciation: { reviewCompleted: false, selectCompleted: false, exercisesCompleted: false },
    grammar: { reviewCompleted: false, selectCompleted: false, exercisesCompleted: false },
    reading: { reviewCompleted: false, selectCompleted: false, exercisesCompleted: false },
    writing: { reviewCompleted: false, selectCompleted: false, exercisesCompleted: false },
    listening: { reviewCompleted: false, selectCompleted: false, exercisesCompleted: false },
    speaking: { reviewCompleted: false, selectCompleted: false, exercisesCompleted: false },
  });

  useEffect(() => {
    loadSelectedModules();
  }, []);

  // Load words settings when entering exercises phase with words module
  useEffect(() => {
    if (phase === 'exercises' && selectedModules[currentModuleIndex] === 'words') {
      loadWordsSettings();
    }
  }, [phase, currentModuleIndex, selectedModules]);

  // Load exercises for current words card
  useEffect(() => {
    if (phase === 'exercises' && selectedModules[currentModuleIndex] === 'words' && wordsSettings !== null) {
      loadWordsExercises();
    }
  }, [phase, currentModuleIndex, currentCardIndex, wordsSettings, selectedModules]);

  const loadWordsSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('@words_settings');
      if (stored) {
        setWordsSettings(JSON.parse(stored));
      } else {
        setWordsSettings({ choose: true, assemble: true, type: true, sentence: true });
      }
    } catch (error) {
      console.error('Failed to load words settings:', error);
      setWordsSettings({ choose: true, assemble: true, type: true, sentence: true });
    }
  };

  const loadWordsExercises = () => {
    if (!wordsSettings) return;

    const rawCard = currentModuleCards[currentCardIndex];
    // Get original card from wordsData
    const originalCard = wordsData
      .filter((c: any) => c.active)
      .flatMap((c: any) => c.cards)
      .find((c: any) => c.id === rawCard.id);

    if (!originalCard?.exercises) {
      setCurrentCardExercises([]);
      return;
    }

    const exercises: Exercise[] = [];
    if (wordsSettings.choose && originalCard.exercises.choose) exercises.push(originalCard.exercises.choose as Exercise);
    if (wordsSettings.assemble && originalCard.exercises.assemble) exercises.push(originalCard.exercises.assemble as Exercise);
    if (wordsSettings.type && originalCard.exercises.type) exercises.push(originalCard.exercises.type as Exercise);
    if (wordsSettings.sentence && originalCard.exercises.sentence) exercises.push(originalCard.exercises.sentence as Exercise);

    setCurrentCardExercises(exercises);
    setCurrentExerciseIndex(0);
  };

  const loadSelectedModules = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSelectedModules(JSON.parse(stored));
      } else {
        setSelectedModules(['words']);
      }
    } catch (error) {
      console.error('Failed to load selected modules:', error);
      setSelectedModules(['words']);
    }
  };

  const saveSelectedModules = async (modules: ModuleId[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
    } catch (error) {
      console.error('Failed to save selected modules:', error);
    }
  };

  const toggle = (id: ModuleId) => {
    setSelectedModules((prev) => {
      const newModules = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveSelectedModules(newModules);
      return newModules;
    });
  };

  const handleBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/main');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      router.replace('/main');
    }
  };

  const startTraining = () => {
    // Начинаем с первого выбранного модуля
    setCurrentModuleIndex(0);
    setCurrentCardIndex(0);
    const firstModule = selectedModules[0];
    setCurrentModuleCards(getCardsFromModule(firstModule, 'studying'));
    setPhase('review');
  };

  const handleReviewAnswer = (quality: 'good' | 'medium' | 'bad') => {
    if (currentCardIndex < currentModuleCards.length - 1) {
      // Переходим к следующей карточке в текущем модуле
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Завершили review для текущего модуля
      const currentModule = selectedModules[currentModuleIndex];

      // Закрашиваем зелёную секцию для текущего модуля
      setModuleProgress((prev) => ({
        ...prev,
        [currentModule]: { ...prev[currentModule], reviewCompleted: true },
      }));

      if (currentModuleIndex < selectedModules.length - 1) {
        // Переходим к следующему модулю в review
        const nextModuleIndex = currentModuleIndex + 1;
        setCurrentModuleIndex(nextModuleIndex);
        setCurrentCardIndex(0);
        setCurrentModuleCards(getCardsFromModule(selectedModules[nextModuleIndex], 'studying'));
      } else {
        // Все модули прошли review → переходим к select
        setCurrentModuleIndex(0);
        setCurrentCardIndex(0);
        setCurrentModuleCards(getCardsFromModule(selectedModules[0], 'new'));
        setPhase('select');
      }
    }
  };

  const handleSelectAnswer = (knows: boolean) => {
    if (currentCardIndex < currentModuleCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Завершили select для текущего модуля
      const currentModule = selectedModules[currentModuleIndex];

      // Закрашиваем жёлтую секцию для текущего модуля
      setModuleProgress((prev) => ({
        ...prev,
        [currentModule]: { ...prev[currentModule], selectCompleted: true },
      }));

      if (currentModuleIndex < selectedModules.length - 1) {
        // Переходим к следующему модулю в select
        const nextModuleIndex = currentModuleIndex + 1;
        setCurrentModuleIndex(nextModuleIndex);
        setCurrentCardIndex(0);
        setCurrentModuleCards(getCardsFromModule(selectedModules[nextModuleIndex], 'new'));
      } else {
        // Все модули прошли select → переходим к exercises
        setCurrentModuleIndex(0);
        setCurrentCardIndex(0);
        setCurrentModuleCards(getCardsFromModule(selectedModules[0], 'new'));
        setPhase('exercises');
      }
    }
  };

  const handleExerciseAnswer = (correct: boolean) => {
    if (currentCardIndex < currentModuleCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Завершили exercises для текущего модуля
      const currentModule = selectedModules[currentModuleIndex];

      // Закрашиваем синюю секцию для текущего модуля
      setModuleProgress((prev) => ({
        ...prev,
        [currentModule]: { ...prev[currentModule], exercisesCompleted: true },
      }));

      if (currentModuleIndex < selectedModules.length - 1) {
        // Переходим к следующему модулю в exercises
        const nextModuleIndex = currentModuleIndex + 1;
        setCurrentModuleIndex(nextModuleIndex);
        setCurrentCardIndex(0);
        setCurrentModuleCards(getCardsFromModule(selectedModules[nextModuleIndex], 'new'));
      } else {
        // Все модули прошли exercises → переходим к results
        setPhase('results');
      }
    }
  };

  const finishTraining = () => {
    router.back();
  };

  // Render helpers для exercises phase
  const handleWordsExerciseComplete = (correct: boolean) => {
    if (currentExerciseIndex < currentCardExercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      handleExerciseAnswer(correct);
    }
  };

  // Рендер экрана выбора модулей
  if (phase === 'selection') {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={COMMON_STYLES.header}>
          <Pressable onPress={handleBack} style={styles.back}>
            <Text style={styles.backText}>◀</Text>
          </Pressable>
          <Text style={COMMON_STYLES.title}>Мульти-тренировка</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionLabel}>ВЫБЕРИТЕ МОДУЛИ</Text>

          {MODULES.map((m) => {
            const isActive = selectedModules.includes(m.id);
            return (
              <Pressable
                key={m.id}
                style={styles.moduleCard}
                onPress={() => toggle(m.id)}
              >
                <View style={styles.checkbox}>
                  <View style={[styles.checkboxInner, isActive && styles.checkboxActive]}>
                    {isActive && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </View>
                <Ionicons name={m.icon} size={24} color={COLORS.black} />
                <Text style={[styles.moduleTitle, isActive && styles.moduleTitleActive]}>
                  {m.title}
                </Text>
              </Pressable>
            );
          })}

          {selectedModules.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Выберите хотя бы один модуль для тренировки</Text>
            </View>
          )}
        </ScrollView>

        {selectedModules.length > 0 && (
          <View style={styles.bottomBar}>
            <Pressable style={COMMON_STYLES.button} onPress={startTraining}>
              <Text style={COMMON_STYLES.buttonText}>Начать тренировку</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Рендер фазы Review
  if (phase === 'review') {
    const currentCard = currentModuleCards[currentCardIndex];
    const currentModule = selectedModules[currentModuleIndex];
    const currentModuleName = MODULES.find((m) => m.id === currentModule)?.title || '';

    return (
      <SafeAreaView style={styles.screen}>
        <View style={COMMON_STYLES.header}>
          <Pressable onPress={handleBack} style={styles.back}>
            <Text style={styles.backText}>◀</Text>
          </Pressable>
          <Text style={COMMON_STYLES.title}>Мульти-тренировка</Text>
        </View>

        {/* Мини прогресс-бары */}
        <View style={styles.miniProgressContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.miniProgressScroll}>
            {selectedModules.map((modId) => {
              const mod = MODULES.find((m) => m.id === modId);
              const progress = moduleProgress[modId];
              return (
                <View key={modId} style={styles.miniProgressItem}>
                  <MiniCircularProgress
                    reviewCompleted={progress.reviewCompleted}
                    selectCompleted={progress.selectCompleted}
                    exercisesCompleted={progress.exercisesCompleted}
                  />
                  <Text style={styles.miniProgressLabel}>{mod!.title}</Text>
                </View>
              );
            })}
          </ScrollView>
          <Text style={styles.phaseTitle}>Повторение: {currentModuleName}</Text>
        </View>

        <View style={styles.phaseContent}>
          <View style={styles.card}>
            <Text style={styles.cardFront}>{currentCard.front}</Text>
            <Text style={styles.cardBack}>{currentCard.back}</Text>
          </View>
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.reviewButtons}>
            <Pressable style={[styles.reviewButton, styles.reviewLightGray]} onPress={() => handleReviewAnswer('bad')}>
              <Text style={styles.reviewButtonText}>Не помню</Text>
            </Pressable>
            <Pressable style={[styles.reviewButton, styles.reviewDarkGray]} onPress={() => handleReviewAnswer('medium')}>
              <Text style={styles.reviewButtonText}>Плохо помню</Text>
            </Pressable>
            <Pressable style={[styles.reviewButton, styles.reviewBlack]} onPress={() => handleReviewAnswer('good')}>
              <Text style={styles.reviewButtonText}>Помню</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Рендер фазы Select
  if (phase === 'select') {
    const currentCard = currentModuleCards[currentCardIndex];
    const currentModule = selectedModules[currentModuleIndex];
    const currentModuleName = MODULES.find((m) => m.id === currentModule)?.title || '';

    return (
      <SafeAreaView style={styles.screen}>
        <View style={COMMON_STYLES.header}>
          <Pressable onPress={handleBack} style={styles.back}>
            <Text style={styles.backText}>◀</Text>
          </Pressable>
          <Text style={COMMON_STYLES.title}>Мульти-тренировка</Text>
        </View>

        <View style={styles.miniProgressContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.miniProgressScroll}>
            {selectedModules.map((modId) => {
              const mod = MODULES.find((m) => m.id === modId);
              const progress = moduleProgress[modId];
              return (
                <View key={modId} style={styles.miniProgressItem}>
                  <MiniCircularProgress
                    reviewCompleted={progress.reviewCompleted}
                    selectCompleted={progress.selectCompleted}
                    exercisesCompleted={progress.exercisesCompleted}
                  />
                  <Text style={styles.miniProgressLabel}>{mod!.title}</Text>
                </View>
              );
            })}
          </ScrollView>
          <Text style={styles.phaseTitle}>Выбор новых: {currentModuleName}</Text>
        </View>

        <View style={styles.phaseContent}>
          <View style={styles.card}>
            <Text style={styles.cardFront}>{currentCard.front}</Text>
            <Text style={styles.cardBack}>{currentCard.back}</Text>
          </View>
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.selectButtons}>
            <Pressable style={[styles.selectButton, styles.selectLightGray]} onPress={() => handleSelectAnswer(false)}>
              <Text style={styles.selectButtonText}>Не знаю</Text>
            </Pressable>
            <Pressable style={[styles.selectButton, styles.selectBlack]} onPress={() => handleSelectAnswer(true)}>
              <Text style={[styles.selectButtonText, styles.selectBlackText]}>Знаю</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Рендер фазы Exercises
  if (phase === 'exercises') {
    const currentCard = currentModuleCards[currentCardIndex];
    const currentModule = selectedModules[currentModuleIndex];
    const currentModuleName = MODULES.find((m) => m.id === currentModule)?.title || '';

    const handleWordsExerciseComplete = (correct: boolean) => {
      if (currentExerciseIndex < currentCardExercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
      } else {
        handleExerciseAnswer(correct);
      }
    };

    // For words module: use new exercise components
    if (currentModule === 'words') {
      if (wordsSettings === null) {
        return (
          <SafeAreaView style={styles.screen}>
            <View style={COMMON_STYLES.header}>
              <Pressable onPress={handleBack} style={styles.back}>
                <Text style={styles.backText}>◀</Text>
              </Pressable>
              <Text style={COMMON_STYLES.title}>Мульти-тренировка</Text>
            </View>
            <View style={styles.phaseContent}>
              <Text style={styles.phaseTitle}>Загрузка...</Text>
            </View>
          </SafeAreaView>
        );
      }

      if (currentCardExercises.length === 0) {
        return (
          <SafeAreaView style={styles.screen}>
            <View style={COMMON_STYLES.header}>
              <Pressable onPress={handleBack} style={styles.back}>
                <Text style={styles.backText}>◀</Text>
              </Pressable>
              <Text style={COMMON_STYLES.title}>Мульти-тренировка</Text>
            </View>
            <View style={styles.phaseContent}>
              <Text style={styles.phaseTitle}>Нет упражнений</Text>
              <Text style={styles.exerciseQuestion}>Включите упражнения в настройках</Text>
            </View>
            <View style={styles.bottomBar}>
              <Pressable style={COMMON_STYLES.button} onPress={() => handleExerciseAnswer(true)}>
                <Text style={COMMON_STYLES.buttonText}>Далее</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        );
      }

      const currentExercise = currentCardExercises[currentExerciseIndex];

      return (
        <SafeAreaView style={styles.screen}>
          <View style={COMMON_STYLES.header}>
            <Pressable onPress={handleBack} style={styles.back}>
              <Text style={styles.backText}>◀</Text>
            </Pressable>
            <Text style={COMMON_STYLES.title}>Мульти-тренировка</Text>
          </View>

          <View style={styles.miniProgressContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.miniProgressScroll}>
              {selectedModules.map((modId) => {
                const mod = MODULES.find((m) => m.id === modId);
                const progress = moduleProgress[modId];
                return (
                  <View key={modId} style={styles.miniProgressItem}>
                    <MiniCircularProgress
                      reviewCompleted={progress.reviewCompleted}
                      selectCompleted={progress.selectCompleted}
                      exercisesCompleted={progress.exercisesCompleted}
                    />
                    <Text style={styles.miniProgressLabel}>{mod!.title}</Text>
                  </View>
                );
              })}
            </ScrollView>
            <Text style={styles.phaseTitle}>Упражнения: {currentModuleName}</Text>
          </View>

          {currentExercise.type === 'choose' && (
            <ChooseExerciseComponent exercise={currentExercise} onComplete={handleWordsExerciseComplete} />
          )}
          {currentExercise.type === 'assemble' && (
            <AssembleExerciseComponent exercise={currentExercise} onComplete={handleWordsExerciseComplete} />
          )}
          {currentExercise.type === 'type' && (
            <TypeExerciseComponent exercise={currentExercise} onComplete={handleWordsExerciseComplete} />
          )}
          {currentExercise.type === 'sentence' && (
            <SentenceExerciseComponent exercise={currentExercise} onComplete={handleWordsExerciseComplete} />
          )}
        </SafeAreaView>
      );
    }

    // For other modules: use old format (question + options)
    const exercise = currentCard.exercises?.[0];

    const handleOptionPress = (index: number) => {
      setSelectedOption(index);
      setShowResult(true);
    };

    const handleNext = () => {
      setSelectedOption(null);
      setShowResult(false);
      handleExerciseAnswer(selectedOption === exercise?.correctIndex);
    };

    return (
      <SafeAreaView style={styles.screen}>
        <View style={COMMON_STYLES.header}>
          <Pressable onPress={handleBack} style={styles.back}>
            <Text style={styles.backText}>◀</Text>
          </Pressable>
          <Text style={COMMON_STYLES.title}>Мульти-тренировка</Text>
        </View>

        <View style={styles.miniProgressContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.miniProgressScroll}>
            {selectedModules.map((modId) => {
              const mod = MODULES.find((m) => m.id === modId);
              const progress = moduleProgress[modId];
              return (
                <View key={modId} style={styles.miniProgressItem}>
                  <MiniCircularProgress
                    reviewCompleted={progress.reviewCompleted}
                    selectCompleted={progress.selectCompleted}
                    exercisesCompleted={progress.exercisesCompleted}
                  />
                  <Text style={styles.miniProgressLabel}>{mod!.title}</Text>
                </View>
              );
            })}
          </ScrollView>
          <Text style={styles.phaseTitle}>Упражнения: {currentModuleName}</Text>
        </View>

        <View style={styles.phaseContent}>
          {exercise ? (
            <Text style={styles.exerciseQuestion}>{exercise.question}</Text>
          ) : (
            <>
              <Text style={styles.exerciseQuestion}>Карточка</Text>
              <Text style={styles.exerciseFront}>{currentCard.front}</Text>
              <Text style={styles.cardBack}>{currentCard.back}</Text>
            </>
          )}
        </View>

        <View style={styles.bottomBar}>
          {exercise ? (
            <>
              <View style={styles.exerciseButtons}>
                {exercise.options.map((option, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.exerciseButton,
                      showResult && index === exercise.correctIndex && styles.exerciseButtonCorrect,
                      showResult && selectedOption === index && index !== exercise.correctIndex && styles.exerciseButtonWrong,
                    ]}
                    onPress={() => !showResult && handleOptionPress(index)}
                    disabled={showResult}
                  >
                    <Text style={styles.exerciseButtonText}>{option}</Text>
                  </Pressable>
                ))}
              </View>
              {showResult && (
                <Pressable style={COMMON_STYLES.button} onPress={handleNext}>
                  <Text style={COMMON_STYLES.buttonText}>
                    {selectedOption === exercise.correctIndex ? 'Правильно! Далее' : 'Далее'}
                  </Text>
                </Pressable>
              )}
            </>
          ) : (
            <Pressable style={COMMON_STYLES.button} onPress={() => handleExerciseAnswer(true)}>
              <Text style={COMMON_STYLES.buttonText}>Далее</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Рендер фазы Results
  if (phase === 'results') {
    const totalCards = selectedModules.reduce((sum, modId) => {
      const studying = getCardsFromModule(modId, 'studying').length;
      const newCards = getCardsFromModule(modId, 'new').length;
      return sum + studying + newCards;
    }, 0);

    return (
      <SafeAreaView style={styles.screen}>
        <View style={COMMON_STYLES.header}>
          <Pressable onPress={handleBack} style={styles.back}>
            <Text style={styles.backText}>◀</Text>
          </Pressable>
          <Text style={COMMON_STYLES.title}>Результаты</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.resultsTitle}>Тренировка завершена!</Text>
          <Text style={styles.resultsSubtitle}>Карточек обработано: {totalCards}</Text>

          <Text style={styles.sectionLabel}>ПРОГРЕСС ПО МОДУЛЯМ</Text>
          {selectedModules.map((modId) => {
            const mod = MODULES.find((m) => m.id === modId);
            const progress = moduleProgress[modId];
            const completed = (progress.reviewCompleted ? 1 : 0) + (progress.selectCompleted ? 1 : 0) + (progress.exercisesCompleted ? 1 : 0);
            const total = Math.round((completed / 3) * 100);
            return (
              <View key={modId} style={styles.resultCard}>
                <Ionicons name={mod!.icon} size={24} color={COLORS.black} />
                <Text style={styles.resultModuleName}>{mod!.title}</Text>
                <Text style={styles.resultPercent}>{total}%</Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable style={COMMON_STYLES.button} onPress={finishTraining}>
            <Text style={COMMON_STYLES.buttonText}>Завершить</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

// Мини круговой прогресс-бар (50px) с тремя секциями
function MiniCircularProgress({
  reviewCompleted,
  selectCompleted,
  exercisesCompleted
}: {
  reviewCompleted: boolean;
  selectCompleted: boolean;
  exercisesCompleted: boolean;
}) {
  const size = 50;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Каждая секция = 33.3% круга (120 градусов)
  const sectionLength = circumference / 3;

  return (
    <Svg width={size} height={size}>
      {/* Фон - три серые секции */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={COLORS.gray[200]}
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* Review секция (0-120°, зелёная если завершена) */}
      {reviewCompleted && (
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#4CAF50"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${sectionLength} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="butt"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      )}

      {/* Select секция (120-240°, жёлтая если завершена) */}
      {selectCompleted && (
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFC107"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${sectionLength} ${circumference}`}
          strokeDashoffset={-sectionLength}
          strokeLinecap="butt"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      )}

      {/* Exercises секция (240-360°, синяя если завершена) */}
      {exercisesCompleted && (
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2196F3"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${sectionLength} ${circumference}`}
          strokeDashoffset={-sectionLength * 2}
          strokeLinecap="butt"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.white },
  back: { paddingRight: SPACING.lg },
  backText: { fontSize: TYPOGRAPHY.size.xl, color: COLORS.black },

  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xs, paddingBottom: 120 },

  sectionLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.gray[400],
    letterSpacing: 1,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },

  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  checkbox: {
    marginRight: SPACING.md,
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  moduleTitle: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.black,
    marginLeft: SPACING.sm,
  },
  moduleTitleActive: {
    color: COLORS.primary,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.gray[500],
    textAlign: 'center',
    paddingHorizontal: SPACING.xxxl,
  },

  // Мини прогресс-бары
  miniProgressContainer: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  miniProgressScroll: {
    paddingHorizontal: SPACING.lg,
  },
  miniProgressItem: {
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  miniProgressLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.gray[600],
    marginTop: 4,
  },
  phaseTitle: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.gray[500],
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },

  // Контент
  phaseContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 16,
    padding: SPACING.xxxl,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFront: {
    fontSize: TYPOGRAPHY.size.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  cardBack: {
    fontSize: TYPOGRAPHY.size.xl,
    color: COLORS.gray[600],
  },

  // Кнопки Review
  reviewButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  reviewButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  reviewLightGray: {
    backgroundColor: COLORS.gray[500],
  },
  reviewDarkGray: {
    backgroundColor: COLORS.gray[700],
  },
  reviewBlack: {
    backgroundColor: COLORS.black,
  },
  reviewButtonText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.white,
  },

  // Кнопки Select
  selectButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  selectButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectLightGray: {
    backgroundColor: COLORS.gray[500],
  },
  selectBlack: {
    backgroundColor: COLORS.black,
  },
  selectButtonText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.white,
  },
  selectBlackText: {
    color: COLORS.white,
  },

  // Упражнения
  exerciseQuestion: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.black,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  exerciseFront: {
    fontSize: TYPOGRAPHY.size.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  exerciseButtons: {
    gap: SPACING.sm,
  },
  exerciseButton: {
    backgroundColor: COLORS.gray[50],
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
  },
  exerciseButtonCorrect: {
    backgroundColor: '#D4EDDA',
    borderColor: '#28A745',
  },
  exerciseButtonWrong: {
    backgroundColor: '#F8D7DA',
    borderColor: '#DC3545',
  },
  exerciseButtonText: {
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.black,
    textAlign: 'center',
  },

  // Нижняя панель с кнопками
  bottomBar: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.white,
  },

  // Результаты
  resultsTitle: {
    fontSize: TYPOGRAPHY.size.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.black,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  resultsSubtitle: {
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  resultModuleName: {
    flex: 1,
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.black,
    marginLeft: SPACING.sm,
  },
  resultPercent: {
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.gray[600],
    fontWeight: TYPOGRAPHY.weight.bold,
  },
});
