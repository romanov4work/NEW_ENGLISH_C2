// Все типы упражнений + диспетчер ExerciseView. Тёмная тема.
import { useState, useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, DARK } from '../lib/theme';
import { Exercise, ModuleId } from '../lib/types';
import { speak } from '../lib/speech';
import { checkSentence, checkResponse } from '../lib/sentenceCheck';

type Ex<T extends Exercise['type']> = Extract<Exercise, { type: T }>;
type Done = (correct: boolean) => void;

export function ExerciseView({ exercise, onComplete, module }: { exercise: Exercise; onComplete: Done; module: ModuleId }) {
  switch (exercise.type) {
    case 'choose': return <ChooseEx exercise={exercise} onComplete={onComplete} speakable={module === 'words' || module === 'pronunciation'} />;
    case 'multiple_choice': return <MultipleChoiceEx exercise={exercise} onComplete={onComplete} />;
    case 'true_false': return <TrueFalseEx exercise={exercise} onComplete={onComplete} />;
    case 'assemble': return <AssembleEx exercise={exercise} onComplete={onComplete} />;
    case 'type': return <TypeEx exercise={exercise} onComplete={onComplete} />;
    case 'sentence': return <SentenceEx exercise={exercise} onComplete={onComplete} />;
    case 'fill': return <FillEx exercise={exercise} onComplete={onComplete} />;
    case 'write': return <WriteEx exercise={exercise} onComplete={onComplete} />;
    case 'respond': return <RespondEx exercise={exercise} onComplete={onComplete} />;
    default: return null;
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function Keyboard({ onKeyPress }: { onKeyPress: (key: string) => void }) {
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', '←'],
  ];
  return (
    <View style={styles.keyboard}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.keyboardRow}>
          {row.map((k) => (
            <Pressable key={k} style={styles.key} onPress={() => onKeyPress(k)}>
              <Text style={styles.keyText}>{k}</Text>
            </Pressable>
          ))}
        </View>
      ))}
      <View style={styles.keyboardRow}>
        <Pressable style={[styles.key, styles.spaceKey]} onPress={() => onKeyPress(' ')}>
          <Text style={styles.keyText}>space</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  phaseContent: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxxl },
  title: { fontSize: TYPOGRAPHY.size.xxl, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text, textAlign: 'center', marginBottom: SPACING.sm },
  prompt: { fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text, textAlign: 'center', marginBottom: SPACING.xl },
  promptSmall: { fontSize: TYPOGRAPHY.size.md, color: DARK.textDim, textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 22 },
  translation: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.semibold, color: DARK.text, textAlign: 'center' },

  bottomBar: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl, paddingTop: SPACING.md, backgroundColor: DARK.bg },
  options: { gap: SPACING.sm, marginBottom: SPACING.md },
  option: { backgroundColor: DARK.card, paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl, borderRadius: 12, borderWidth: 2, borderColor: DARK.border },
  optionCorrect: { backgroundColor: 'rgba(52,211,153,0.18)', borderColor: '#34D399' },
  optionWrong: { backgroundColor: 'rgba(255,92,122,0.18)', borderColor: '#FF5C7A' },
  optionText: { fontSize: TYPOGRAPHY.size.md, color: DARK.text, textAlign: 'center' },

  btn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold },
  btnRow: { flexDirection: 'row', gap: SPACING.sm },
  btnHalf: { flex: 1, paddingVertical: SPACING.lg, borderRadius: 12, alignItems: 'center' },
  btnHalfText: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.semibold, color: '#fff' },
  btnDisabled: { opacity: 0.5 },

  inputBox: { backgroundColor: DARK.card, borderRadius: 12, paddingVertical: SPACING.xl, paddingHorizontal: SPACING.lg, marginTop: SPACING.xl, minHeight: 60, justifyContent: 'center', alignItems: 'center' },
  inputText: { fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text },
  textArea: { backgroundColor: DARK.card, borderRadius: 12, padding: SPACING.lg, marginTop: SPACING.lg, minHeight: 120, color: DARK.text, fontSize: TYPOGRAPHY.size.base, borderWidth: 1, borderColor: DARK.border, textAlignVertical: 'top' },
  speakBtn: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: DARK.card, borderWidth: 1, borderColor: DARK.border, borderRadius: 30, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  speakText: { color: DARK.text, fontSize: TYPOGRAPHY.size.base },
  result: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold, textAlign: 'center', marginTop: SPACING.lg },

  letters: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center', marginBottom: SPACING.md },
  letter: { backgroundColor: DARK.cardAlt, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderRadius: 8, minWidth: 40, alignItems: 'center' },
  letterUsed: { opacity: 0.3 },
  letterText: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.semibold, color: DARK.text },

  keyboard: { marginBottom: SPACING.md, width: '100%' },
  keyboardRow: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginBottom: 4 },
  key: { backgroundColor: DARK.cardAlt, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 6, minWidth: 32, alignItems: 'center', justifyContent: 'center' },
  spaceKey: { flex: 1 },
  keyText: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold, color: DARK.text },
});

export { styles as exStyles, shuffle };


function shuffleOpts(e: { options: string[]; correctIndex: number }) {
  const c = e.options[e.correctIndex];
  const s = shuffle(e.options);
  return { options: s, correctIndex: s.indexOf(c) };
}

function ChooseEx({ exercise, onComplete, speakable }: { exercise: Ex<'choose'>; onComplete: Done; speakable?: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const [opts] = useState(() => shuffleOpts(exercise));
  useEffect(() => { if (speakable) speak(exercise.question); }, []);
  const press = (i: number) => { setSel(i); const ok = i === opts.correctIndex; setTimeout(() => onComplete(ok), ok ? 500 : 1500); };
  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.title}>Выберите перевод</Text>
        <Pressable onPress={() => speak(exercise.question)}>
          <Text style={styles.prompt}>{exercise.question}{speakable ? ' 🔊' : ''}</Text>
        </Pressable>
      </View>
      <View style={styles.bottomBar}>
        <View style={styles.options}>
          {opts.options.map((o, i) => (
            <Pressable key={i} style={[styles.option, sel !== null && i === opts.correctIndex && styles.optionCorrect, sel === i && i !== opts.correctIndex && styles.optionWrong]} onPress={() => sel === null && press(i)} disabled={sel !== null}>
              <Text style={styles.optionText}>{o}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </>
  );
}

function MultipleChoiceEx({ exercise, onComplete }: { exercise: Ex<'multiple_choice'>; onComplete: Done }) {
  const [sel, setSel] = useState<number | null>(null);
  const [opts] = useState(() => shuffleOpts(exercise));
  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.title}>Вопрос</Text>
        <Text style={styles.promptSmall}>{exercise.question}</Text>
      </View>
      <View style={styles.bottomBar}>
        <View style={styles.options}>
          {opts.options.map((o, i) => (
            <Pressable key={i} style={[styles.option, sel !== null && i === opts.correctIndex && styles.optionCorrect, sel === i && i !== opts.correctIndex && styles.optionWrong]} onPress={() => sel === null && setSel(i)} disabled={sel !== null}>
              <Text style={styles.optionText}>{o}</Text>
            </Pressable>
          ))}
        </View>
        {sel !== null && (
          <Pressable style={styles.btn} onPress={() => onComplete(sel === opts.correctIndex)}>
            <Text style={styles.btnText}>Далее</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

function TrueFalseEx({ exercise, onComplete }: { exercise: Ex<'true_false'>; onComplete: Done }) {
  const [ans, setAns] = useState<boolean | null>(null);
  const choose = (v: boolean) => { setAns(v); setTimeout(() => onComplete(v === exercise.answer), 900); };
  const col = (v: boolean) => (ans === v ? (exercise.answer === v ? '#34D399' : '#FF5C7A') : v ? COLORS.primary : '#3A3D4D');
  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.title}>Верно или нет?</Text>
        <Text style={styles.promptSmall}>{exercise.statement}</Text>
      </View>
      <View style={styles.bottomBar}>
        <View style={styles.btnRow}>
          <Pressable style={[styles.btnHalf, { backgroundColor: col(false) }]} onPress={() => ans === null && choose(false)} disabled={ans !== null}>
            <Text style={styles.btnHalfText}>Неверно</Text>
          </Pressable>
          <Pressable style={[styles.btnHalf, { backgroundColor: col(true) }]} onPress={() => ans === null && choose(true)} disabled={ans !== null}>
            <Text style={styles.btnHalfText}>Верно</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}


function AssembleEx({ exercise, onComplete }: { exercise: Ex<'assemble'>; onComplete: Done }) {
  const [letters] = useState(() => shuffle(exercise.letters));
  const [assembled, setAssembled] = useState('');
  const [used, setUsed] = useState<number[]>([]);
  const [show, setShow] = useState(false);
  const tap = (l: string, i: number) => { if (!used.includes(i)) { setAssembled(assembled + l); setUsed([...used, i]); } };
  const back = () => { if (assembled.length) { setAssembled(assembled.slice(0, -1)); setUsed(used.slice(0, -1)); } };
  const ok = assembled.toLowerCase() === exercise.targetWord.toLowerCase();
  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.title}>Составьте слово</Text>
        <Text style={styles.translation}>{exercise.translation}</Text>
        <View style={styles.inputBox}><Text style={styles.inputText}>{assembled || '_'}</Text></View>
      </View>
      <View style={styles.bottomBar}>
        {!show ? (
          <>
            <View style={styles.letters}>
              {letters.map((l, i) => (
                <Pressable key={i} style={[styles.letter, used.includes(i) && styles.letterUsed]} onPress={() => tap(l, i)} disabled={used.includes(i)}>
                  <Text style={styles.letterText}>{l}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.btnRow}>
              <Pressable style={[styles.btnHalf, { backgroundColor: '#3A3D4D' }, !assembled.length && styles.btnDisabled]} onPress={back} disabled={!assembled.length}><Text style={styles.btnHalfText}>Стереть</Text></Pressable>
              <Pressable style={[styles.btnHalf, { backgroundColor: COLORS.primary }, !assembled.length && styles.btnDisabled]} onPress={() => setShow(true)} disabled={!assembled.length}><Text style={styles.btnHalfText}>Проверить</Text></Pressable>
            </View>
          </>
        ) : (
          <Pressable style={styles.btn} onPress={() => onComplete(ok)}><Text style={styles.btnText}>Далее</Text></Pressable>
        )}
      </View>
    </>
  );
}

function TypeEx({ exercise, onComplete }: { exercise: Ex<'type'>; onComplete: Done }) {
  const [typed, setTyped] = useState('');
  const [show, setShow] = useState(false);
  const key = (k: string) => { if (k === '←') setTyped(typed.slice(0, -1)); else setTyped(typed + k); };
  const ok = typed.toLowerCase() === exercise.targetWord.toLowerCase();
  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.title}>Напишите слово</Text>
        <Text style={styles.translation}>{exercise.translation}</Text>
        <View style={styles.inputBox}><Text style={styles.inputText}>{typed || '_'}</Text></View>
      </View>
      <View style={styles.bottomBar}>
        {!show ? (
          <>
            <Keyboard onKeyPress={key} />
            <Pressable style={[styles.btn, !typed.length && styles.btnDisabled]} onPress={() => setShow(true)} disabled={!typed.length}><Text style={styles.btnText}>Проверить</Text></Pressable>
          </>
        ) : (
          <Pressable style={styles.btn} onPress={() => onComplete(ok)}><Text style={styles.btnText}>Далее</Text></Pressable>
        )}
      </View>
    </>
  );
}


function SentenceEx({ exercise, onComplete }: { exercise: Ex<'sentence'>; onComplete: Done }) {
  const [text, setText] = useState('');
  const [checking, setChecking] = useState(false);
  const [show, setShow] = useState(false);
  const [ok, setOk] = useState(false);
  const check = async () => { setChecking(true); const r = await checkSentence(text, exercise.targetWord); setOk(r); setChecking(false); setShow(true); };
  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.title}>Составьте предложение</Text>
        <Text style={styles.promptSmall}>Используйте слово: {exercise.targetWord} ({exercise.translation})</Text>
        <TextInput style={styles.textArea} value={text} onChangeText={setText} multiline placeholder="Введите предложение..." placeholderTextColor={DARK.textMute} />
        {show && <Text style={[styles.result, { color: ok ? '#34D399' : '#FF5C7A' }]}>{ok ? 'Верно — слово использовано' : 'Слово не использовано или есть ошибка'}</Text>}
      </View>
      <View style={styles.bottomBar}>
        {!show ? (
          <Pressable style={[styles.btn, (!text.trim() || checking) && styles.btnDisabled]} onPress={check} disabled={!text.trim() || checking}>
            {checking ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Проверить</Text>}
          </Pressable>
        ) : (
          <Pressable style={styles.btn} onPress={() => onComplete(ok)}><Text style={styles.btnText}>Далее</Text></Pressable>
        )}
      </View>
    </>
  );
}

function FillEx({ exercise, onComplete }: { exercise: Ex<'fill'>; onComplete: Done }) {
  const [text, setText] = useState('');
  const [show, setShow] = useState(false);
  const ok = text.trim().toLowerCase() === exercise.answer.toLowerCase();
  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.title}>{exercise.question}</Text>
        <Text style={styles.promptSmall}>{exercise.sentence}</Text>
        <TextInput style={styles.textArea} value={text} onChangeText={setText} placeholder="Ваш ответ..." placeholderTextColor={DARK.textMute} autoCapitalize="none" />
        {show && <Text style={[styles.result, { color: ok ? '#34D399' : '#FF5C7A' }]}>{ok ? 'Верно!' : `Правильно: ${exercise.answer}`}</Text>}
      </View>
      <View style={styles.bottomBar}>
        {!show ? (
          <Pressable style={[styles.btn, !text.trim() && styles.btnDisabled]} onPress={() => setShow(true)} disabled={!text.trim()}><Text style={styles.btnText}>Проверить</Text></Pressable>
        ) : (
          <Pressable style={styles.btn} onPress={() => onComplete(ok)}><Text style={styles.btnText}>Далее</Text></Pressable>
        )}
      </View>
    </>
  );
}


function WriteEx({ exercise, onComplete }: { exercise: Ex<'write'>; onComplete: Done }) {
  const [text, setText] = useState('');
  const [checking, setChecking] = useState(false);
  const [show, setShow] = useState(false);
  const [ok, setOk] = useState(false);
  const check = async () => { setChecking(true); const r = await checkResponse(text, exercise.prompt); setOk(r); setChecking(false); setShow(true); };
  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.title}>Письменное задание</Text>
        <Text style={styles.promptSmall}>{exercise.prompt}</Text>
        <TextInput style={styles.textArea} value={text} onChangeText={setText} multiline placeholder="Ваш ответ на английском..." placeholderTextColor={DARK.textMute} />
        {show && <Text style={[styles.result, { color: ok ? '#34D399' : '#FF5C7A' }]}>{ok ? 'Хороший ответ!' : 'Ответ слишком короткий или есть ошибки'}</Text>}
      </View>
      <View style={styles.bottomBar}>
        {!show ? (
          <Pressable style={[styles.btn, (!text.trim() || checking) && styles.btnDisabled]} onPress={check} disabled={!text.trim() || checking}>
            {checking ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Проверить</Text>}
          </Pressable>
        ) : (
          <Pressable style={styles.btn} onPress={() => onComplete(ok)}><Text style={styles.btnText}>Далее</Text></Pressable>
        )}
      </View>
    </>
  );
}

function RespondEx({ exercise, onComplete }: { exercise: Ex<'respond'>; onComplete: Done }) {
  const [text, setText] = useState('');
  const [checking, setChecking] = useState(false);
  const [show, setShow] = useState(false);
  const [ok, setOk] = useState(false);
  const check = async () => { setChecking(true); const r = await checkResponse(text, exercise.prompt); setOk(r); setChecking(false); setShow(true); };
  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.title}>Ответьте на вопрос</Text>
        <Text style={styles.promptSmall}>{exercise.prompt}</Text>
        {exercise.sample ? (
          <Pressable style={styles.speakBtn} onPress={() => speak(exercise.sample!)}>
            <Text style={styles.speakText}>🔊 Прослушать образец</Text>
          </Pressable>
        ) : null}
        <TextInput style={styles.textArea} value={text} onChangeText={setText} multiline placeholder="Ваш ответ на английском..." placeholderTextColor={DARK.textMute} />
        {show && <Text style={[styles.result, { color: ok ? '#34D399' : '#FF5C7A' }]}>{ok ? 'Отлично!' : 'Попробуйте ответить полнее и без ошибок'}</Text>}
        {show && exercise.sample ? <Text style={styles.promptSmall}>Образец: {exercise.sample}</Text> : null}
      </View>
      <View style={styles.bottomBar}>
        {!show ? (
          <Pressable style={[styles.btn, (!text.trim() || checking) && styles.btnDisabled]} onPress={check} disabled={!text.trim() || checking}>
            {checking ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Проверить</Text>}
          </Pressable>
        ) : (
          <Pressable style={styles.btn} onPress={() => onComplete(ok)}><Text style={styles.btnText}>Далее</Text></Pressable>
        )}
      </View>
    </>
  );
}
