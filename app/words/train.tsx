import { useState, useMemo, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '../../lib/theme';
import cardsData from './cards_database/cards_database.json';

type Phase = 'review' | 'select' | 'exercises' | 'results';

// Exercise types
type ChooseExercise = {
  type: 'choose';
  question: string;
  options: string[];
  correctIndex: number;
};

type AssembleExercise = {
  type: 'assemble';
  targetWord: string;
  translation: string;
  letters: string[];
};

type TypeExercise = {
  type: 'type';
  targetWord: string;
  translation: string;
};

type SentenceExercise = {
  type: 'sentence';
  targetWord: string;
  translation: string;
};

type Exercise = ChooseExercise | AssembleExercise | TypeExercise | SentenceExercise;

// Mock sentence checker
async function checkSentence(text: string, word: string): Promise<boolean> {
  return true;
}

// Export types and components for unified-train
export type { Exercise, ChooseExercise, AssembleExercise, TypeExercise, SentenceExercise };
export { ChooseExercise as ChooseExerciseComponent, AssembleExercise as AssembleExerciseComponent, TypeExercise as TypeExerciseComponent, SentenceExercise as SentenceExerciseComponent };

// Собираем карточки из активных коллекций
const allCards = cardsData
  .filter(collection => collection.active)
  .flatMap(c => c.cards);

// Review: карточки на повторение (пока пустой, т.к. нет dueDate)
const REVIEW_CARDS = allCards.filter(card => card.status === "studying");

// Select: новые карточки
const SELECT_CARDS = allCards.filter(card => card.status === 'new');

// Exercises: берем первые 10 новых карточек для упражнений
const EXERCISES_CARDS = allCards.filter(card => card.status === 'new').slice(0, 10);

function getActivePhases(): Phase[] {
  const phases: Phase[] = [];
  if (REVIEW_CARDS.length > 0) phases.push('review');
  if (SELECT_CARDS.length > 0) phases.push('select');
  if (EXERCISES_CARDS.length > 0) phases.push('exercises');
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
        <Text style={COMMON_STYLES.title}>Тренировка слов</Text>
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
          <Text style={styles.cardWord}>{currentCard.en}</Text>
          <Text style={styles.cardTranslation}>{Array.isArray(currentCard.ru) ? currentCard.ru.join(', ') : currentCard.ru}</Text>
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
        <Text style={styles.phaseTitle}>Выбор новых слов</Text>
        <Text style={styles.phaseText}>Карточка {current + 1} из {total}</Text>
        <View style={styles.card}>
          <Text style={styles.cardWord}>{currentCard.en}</Text>
          <Text style={styles.cardTranslation}>{Array.isArray(currentCard.ru) ? currentCard.ru.join(', ') : currentCard.ru}</Text>
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

// Keyboard component
function Keyboard({ onKeyPress, disabled }: { onKeyPress: (key: string) => void; disabled?: boolean }) {
  const keys = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', '←'],
  ];

  return (
    <View style={styles.keyboard}>
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.keyboardRow}>
          {row.map((key) => (
            <Pressable
              key={key}
              style={styles.key}
              onPress={() => !disabled && onKeyPress(key)}
              disabled={disabled}
            >
              <Text style={styles.keyText}>{key}</Text>
            </Pressable>
          ))}
        </View>
      ))}
      <View style={styles.keyboardRow}>
        <Pressable
          style={[styles.key, styles.spaceKey]}
          onPress={() => !disabled && onKeyPress(' ')}
          disabled={disabled}
        >
          <Text style={styles.keyText}>space</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Choose Exercise Component
function ChooseExercise({
  exercise,
  onComplete,
}: {
  exercise: ChooseExercise;
  onComplete: (correct: boolean) => void;
}) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    playAudio();
    return () => {
      sound?.unloadAsync();
    };
  }, []);

  const playAudio = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `https://api.dictionaryapi.dev/media/pronunciations/en/${exercise.question.toLowerCase()}.mp3` },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  const handleOptionPress = (index: number) => {
    setSelectedOption(index);
    const isCorrect = index === exercise.correctIndex;

    if (isCorrect) {
      // Если правильно — сразу переход через 0.5 сек
      setTimeout(() => onComplete(true), 500);
    } else {
      // Если неправильно — показываем правильный ответ 2 секунды, потом переход
      setTimeout(() => onComplete(false), 2000);
    }
  };

  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.phaseTitle}>Выберите перевод</Text>
        <Pressable onPress={playAudio} style={styles.audioButton}>
          <Text style={styles.exerciseQuestion}>{exercise.question} 🔊</Text>
        </Pressable>
      </View>
      <View style={styles.bottomBar}>
        <View style={styles.exerciseOptions}>
          {exercise.options.map((option, index) => (
            <Pressable
              key={index}
              style={[
                styles.exerciseOption,
                selectedOption !== null && index === exercise.correctIndex && styles.exerciseOptionCorrect,
                selectedOption === index && index !== exercise.correctIndex && styles.exerciseOptionWrong,
              ]}
              onPress={() => selectedOption === null && handleOptionPress(index)}
              disabled={selectedOption !== null}
            >
              <Text style={styles.exerciseOptionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </>
  );
}

// Assemble Exercise Component
function AssembleExercise({
  exercise,
  onComplete,
}: {
  exercise: AssembleExercise;
  onComplete: (correct: boolean) => void;
}) {
  const [assembled, setAssembled] = useState('');
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    playAudio();
    return () => {
      sound?.unloadAsync();
    };
  }, []);

  const playAudio = async () => {
    try {
      const word = exercise.targetWord.split(' ')[0];
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `https://api.dictionaryapi.dev/media/pronunciations/en/${word.toLowerCase()}.mp3` },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  const handleLetterPress = (letter: string, index: number) => {
    if (!usedIndices.includes(index)) {
      setAssembled(assembled + letter);
      setUsedIndices([...usedIndices, index]);
    }
  };

  const handleBackspace = () => {
    if (assembled.length > 0) {
      setAssembled(assembled.slice(0, -1));
      setUsedIndices(usedIndices.slice(0, -1));
    }
  };

  const handleCheck = () => {
    setShowResult(true);
  };

  const handleNext = () => {
    onComplete(assembled.toLowerCase() === exercise.targetWord.toLowerCase());
  };

  const isCorrect = assembled.toLowerCase() === exercise.targetWord.toLowerCase();

  // Split letters into 2 rows
  const midpoint = Math.ceil(exercise.letters.length / 2);
  const row1 = exercise.letters.slice(0, midpoint);
  const row2 = exercise.letters.slice(midpoint);

  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.phaseTitle}>Составьте слово</Text>
        <Pressable onPress={playAudio} style={styles.audioButton}>
          <Text style={styles.exerciseTranslation}>{exercise.translation} 🔊</Text>
        </Pressable>
        <View style={styles.assembledContainer}>
          <Text style={styles.assembledText}>{assembled || '_'}</Text>
        </View>
      </View>
      <View style={styles.bottomBar}>
        {!showResult ? (
          <>
            <View style={styles.lettersGrid}>
              <View style={styles.lettersRow}>
                {row1.map((letter, index) => (
                  <Pressable
                    key={index}
                    style={[styles.letterButton, usedIndices.includes(index) && styles.letterButtonUsed]}
                    onPress={() => handleLetterPress(letter, index)}
                  >
                    <Text style={[styles.letterButtonText, usedIndices.includes(index) && styles.letterButtonTextUsed]}>
                      {usedIndices.includes(index) ? '' : letter}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.lettersRow}>
                {row2.map((letter, index) => {
                  const actualIndex = midpoint + index;
                  return (
                    <Pressable
                      key={actualIndex}
                      style={[styles.letterButton, usedIndices.includes(actualIndex) && styles.letterButtonUsed]}
                      onPress={() => handleLetterPress(letter, actualIndex)}
                    >
                      <Text style={[styles.letterButtonText, usedIndices.includes(actualIndex) && styles.letterButtonTextUsed]}>
                        {usedIndices.includes(actualIndex) ? '' : letter}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.buttonHalf, styles.buttonLightGray]}
                onPress={handleBackspace}
                disabled={assembled.length === 0}
              >
                <Text style={styles.buttonHalfText}>Стереть</Text>
              </Pressable>
              <Pressable
                style={[styles.buttonHalf, styles.buttonBlack]}
                onPress={handleCheck}
                disabled={assembled.length === 0}
              >
                <Text style={[styles.buttonHalfText, styles.buttonBlackText]}>Проверить</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable style={COMMON_STYLES.button} onPress={handleNext}>
            <Text style={COMMON_STYLES.buttonText}>Далее</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

// Type Exercise Component
function TypeExercise({
  exercise,
  onComplete,
}: {
  exercise: TypeExercise;
  onComplete: (correct: boolean) => void;
}) {
  const [typed, setTyped] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    playAudio();
    return () => {
      sound?.unloadAsync();
    };
  }, []);

  const playAudio = async () => {
    try {
      const word = exercise.targetWord.split(' ')[0];
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `https://api.dictionaryapi.dev/media/pronunciations/en/${word.toLowerCase()}.mp3` },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === '←') {
      setTyped(typed.slice(0, -1));
    } else {
      setTyped(typed + key);
    }
  };

  const handleCheck = () => {
    setShowResult(true);
  };

  const handleNext = () => {
    onComplete(typed.toLowerCase() === exercise.targetWord.toLowerCase());
  };

  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.phaseTitle}>Напишите слово</Text>
        <Pressable onPress={playAudio} style={styles.audioButton}>
          <Text style={styles.exerciseTranslation}>{exercise.translation} 🔊</Text>
        </Pressable>
        <View style={styles.typedContainer}>
          <Text style={styles.typedText}>{typed || '_'}</Text>
        </View>
      </View>
      <View style={styles.bottomBar}>
        {!showResult ? (
          <>
            <Keyboard onKeyPress={handleKeyPress} />
            <Pressable
              style={COMMON_STYLES.button}
              onPress={handleCheck}
              disabled={typed.length === 0}
            >
              <Text style={COMMON_STYLES.buttonText}>Проверить</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={COMMON_STYLES.button} onPress={handleNext}>
            <Text style={COMMON_STYLES.buttonText}>Далее</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

// Sentence Exercise Component
function SentenceExercise({
  exercise,
  onComplete,
}: {
  exercise: SentenceExercise;
  onComplete: (correct: boolean) => void;
}) {
  const [sentence, setSentence] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [showSystemKeyboard, setShowSystemKeyboard] = useState(false);

  useEffect(() => {
    playAudio();
    return () => {
      sound?.unloadAsync();
    };
  }, []);

  const playAudio = async () => {
    try {
      const word = exercise.targetWord.split(' ')[0];
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `https://api.dictionaryapi.dev/media/pronunciations/en/${word.toLowerCase()}.mp3` },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === '←') {
      setSentence(sentence.slice(0, -1));
    } else {
      setSentence(sentence + key);
    }
  };

  const handleCheck = async () => {
    const result = await checkSentence(sentence, exercise.targetWord);
    setIsCorrect(result);
    setShowResult(true);
  };

  const handleNext = () => {
    onComplete(isCorrect);
  };

  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.phaseTitle}>Составьте предложение</Text>
        <Pressable onPress={playAudio} style={styles.audioButton}>
          <Text style={styles.exerciseInfo}>Используйте слово: {exercise.targetWord} 🔊</Text>
        </Pressable>
        <Text style={styles.exerciseTranslation}>{exercise.translation}</Text>
        <Pressable
          style={styles.sentenceInput}
          onPress={() => setShowSystemKeyboard(!showSystemKeyboard)}
        >
          <Text style={styles.sentenceInputText}>{sentence || 'Нажмите для ввода...'}</Text>
        </Pressable>
        {showSystemKeyboard && (
          <TextInput
            style={styles.hiddenInput}
            value={sentence}
            onChangeText={setSentence}
            autoFocus
            onBlur={() => setShowSystemKeyboard(false)}
          />
        )}
      </View>
      <View style={styles.bottomBar}>
        {!showResult ? (
          <>
            <Keyboard onKeyPress={handleKeyPress} />
            <Pressable
              style={COMMON_STYLES.button}
              onPress={handleCheck}
              disabled={sentence.trim().length === 0}
            >
              <Text style={COMMON_STYLES.buttonText}>Проверить</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={COMMON_STYLES.button} onPress={handleNext}>
            <Text style={COMMON_STYLES.buttonText}>Далее</Text>
          </Pressable>
        )}
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
  const [settings, setSettings] = useState<{ choose: boolean; assemble: boolean; type: boolean; sentence: boolean } | null>(null);
  const [currentExerciseTypeIndex, setCurrentExerciseTypeIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [exerciseTypes, setExerciseTypes] = useState<string[]>([]);
  const [allCardsExercises, setAllCardsExercises] = useState<{ [cardIndex: number]: { [type: string]: Exercise } }>({});

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings !== null) {
      loadAllExercises();
    }
  }, [settings]);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('@words_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      } else {
        setSettings({ choose: true, assemble: true, type: true, sentence: true });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSettings({ choose: true, assemble: true, type: true, sentence: true });
    }
  };

  const loadAllExercises = () => {
    if (!settings) return;

    // Определяем порядок типов упражнений (sentence всегда последнее)
    const types: string[] = [];
    if (settings.choose) types.push('choose');
    if (settings.assemble) types.push('assemble');
    if (settings.type) types.push('type');
    if (settings.sentence) types.push('sentence');

    setExerciseTypes(types);

    // Загружаем все упражнения для всех карточек
    const exercises: { [cardIndex: number]: { [type: string]: Exercise } } = {};
    EXERCISES_CARDS.forEach((card, index) => {
      if (card.exercises) {
        exercises[index] = {};
        if (settings.choose && card.exercises.choose) exercises[index]['choose'] = card.exercises.choose as Exercise;
        if (settings.assemble && card.exercises.assemble) exercises[index]['assemble'] = card.exercises.assemble as Exercise;
        if (settings.type && card.exercises.type) exercises[index]['type'] = card.exercises.type as Exercise;
        if (settings.sentence && card.exercises.sentence) exercises[index]['sentence'] = card.exercises.sentence as Exercise;
      }
    });

    setAllCardsExercises(exercises);
    setCurrentExerciseTypeIndex(0);
    setCurrentCardIndex(0);
  };

  const handleExerciseComplete = (correct: boolean) => {
    // Переходим к следующей карточке того же типа упражнения
    if (currentCardIndex < total - 1) {
      const newIndex = currentCardIndex + 1;
      setCurrentCardIndex(newIndex);
      setCurrent(newIndex);
    } else {
      // Все карточки прошли текущий тип упражнения
      if (currentExerciseTypeIndex < exerciseTypes.length - 1) {
        // Переходим к следующему типу упражнения, начинаем с первой карточки
        setCurrentExerciseTypeIndex(currentExerciseTypeIndex + 1);
        setCurrentCardIndex(0);
        setCurrent(0);
      } else {
        // Все типы упражнений завершены
        onNext();
      }
    }
  };

  if (settings === null) {
    return (
      <>
        <View style={styles.phaseContent}>
          <Text style={styles.phaseTitle}>Загрузка...</Text>
        </View>
        <View style={styles.bottomBar} />
      </>
    );
  }

  if (exerciseTypes.length === 0) {
    return (
      <>
        <View style={styles.phaseContent}>
          <Text style={styles.phaseTitle}>Нет упражнений</Text>
          <Text style={styles.phaseText}>Включите упражнения в настройках</Text>
        </View>
        <View style={styles.bottomBar}>
          <Pressable style={COMMON_STYLES.button} onPress={onNext}>
            <Text style={COMMON_STYLES.buttonText}>Далее</Text>
          </Pressable>
        </View>
      </>
    );
  }

  const currentType = exerciseTypes[currentExerciseTypeIndex];
  const currentExercise = allCardsExercises[currentCardIndex]?.[currentType];

  if (!currentExercise) {
    return (
      <>
        <View style={styles.phaseContent}>
          <Text style={styles.phaseTitle}>Ошибка</Text>
          <Text style={styles.phaseText}>Упражнение не найдено</Text>
        </View>
        <View style={styles.bottomBar}>
          <Pressable style={COMMON_STYLES.button} onPress={onNext}>
            <Text style={COMMON_STYLES.buttonText}>Далее</Text>
          </Pressable>
        </View>
      </>
    );
  }

  if (currentExercise.type === 'choose') {
    return <ChooseExercise exercise={currentExercise} onComplete={handleExerciseComplete} />;
  }

  if (currentExercise.type === 'assemble') {
    return <AssembleExercise exercise={currentExercise} onComplete={handleExerciseComplete} />;
  }

  if (currentExercise.type === 'type') {
    return <TypeExercise exercise={currentExercise} onComplete={handleExerciseComplete} />;
  }

  if (currentExercise.type === 'sentence') {
    return <SentenceExercise exercise={currentExercise} onComplete={handleExerciseComplete} />;
  }

  return null;
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
    textAlign: 'center',
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
    backgroundColor: '#D4EDDA',
    borderColor: '#28A745',
  },
  exerciseOptionWrong: {
    backgroundColor: '#F8D7DA',
    borderColor: '#DC3545',
  },
  exerciseOptionText: {
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.black,
    textAlign: 'center',
  },

  // Audio button
  audioButton: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  // Exercise info
  exerciseInfo: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  exerciseTranslation: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.black,
    textAlign: 'center',
  },

  // Assemble styles
  assembledContainer: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assembledText: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.black,
  },
  lettersGrid: {
    marginBottom: SPACING.md,
  },
  lettersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    justifyContent: 'center',
  },
  lettersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    justifyContent: 'center',
  },
  letterButton: {
    backgroundColor: COLORS.gray[100],
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  letterButtonUsed: {
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderStyle: 'dashed',
  },
  letterButtonText: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.black,
  },
  letterButtonTextUsed: {
    color: 'transparent',
  },

  // Type styles
  typedContainer: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typedText: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.black,
  },
  keyboard: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 4,
  },
  key: {
    backgroundColor: COLORS.gray[100],
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceKey: {
    flex: 1,
  },
  keyText: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.black,
  },

  // Sentence styles
  sentenceInput: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    minHeight: 80,
    justifyContent: 'center',
  },
  sentenceInputText: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.black,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
  },
});
