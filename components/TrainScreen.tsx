import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, RADIUS, FONT, COLORS, DARK } from '../lib/theme';
import { ModuleId, CardStatus, BaseCard, Exercise, ProgressMap } from '../lib/types';
import { MODULES } from '../lib/modules';
import {
  loadProgress, saveProgress, markLearned, markStudying, applyReview, recordExerciseResult,
  effectiveStatus, loadActiveCollections,
} from '../lib/progress';
import { loadSettings, TrainSettings } from '../lib/trainSettings';
import { addSession } from '../lib/stats';
import { speak } from '../lib/speech';
import { ExerciseView } from './exercises';

type Phase = 'review' | 'select' | 'exercises' | 'results' | 'empty';
const QUALITY: Record<'good' | 'medium' | 'bad', number> = { bad: 0, medium: 3, good: 5 };

function useCountUp(target: number, duration = 600, delay = 150): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0; let start = 0;
    const tick = () => { if (!start) start = Date.now(); const t = Math.min(1, (Date.now() - start) / duration); setVal(Math.round(target * (t * (2 - t)))); if (t < 1) raf = requestAnimationFrame(tick); else setVal(target); };
    const to = setTimeout(() => { raf = requestAnimationFrame(tick); }, delay);
    return () => { clearTimeout(to); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return val;
}

export function TrainScreen({ module }: { module: ModuleId }) {
  const router = useRouter();
  const cfg = MODULES[module];

  const [progress, setProgress] = useState<ProgressMap | null>(null);
  const [activeIds, setActiveIds] = useState<string[] | null>(null);
  const [settings, setSettings] = useState<TrainSettings | null>(null);
  const [ready, setReady] = useState(false);

  const [phase, setPhase] = useState<Phase>('review');
  const [reviewIndex, setReviewIndex] = useState(0);
  const [selectIndex, setSelectIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [toStudy, setToStudy] = useState<string[]>([]);
  const [reviewPool, setReviewPool] = useState<BaseCard[]>([]);
  const [newPool, setNewPool] = useState<BaseCard[]>([]);
  const [errorsByCard, setErrorsByCard] = useState<Record<string, number>>({});
  const [startTime] = useState(() => Date.now());
  const [stats, setStats] = useState({ reviews: 0, added: 0, learned: 0 });
  const [saved, setSaved] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const def = cfg.data.filter((c) => c.active).map((c) => c.id);
      const [pr, active, st] = await Promise.all([loadProgress(module), loadActiveCollections(module, def), loadSettings(module, cfg.exerciseTypes, cfg.defaultNew)]);
      setProgress(pr); setActiveIds(active); setSettings(st); setReady(true);
    })();
  }, [module]);

  const repeatsToLearn = settings?.repeatsToLearn ?? 5;
  const newPerSession = settings?.newPerSession ?? 5;
  const maxReviews = settings ? (settings.reviewsPerSession === '∞' ? Number.MAX_SAFE_INTEGER : settings.reviewsPerSession) : 50;

  const activeCards = useMemo<BaseCard[]>(() => (!activeIds ? [] : cfg.data.filter((c) => activeIds.includes(c.id)).flatMap((c) => c.cards)), [activeIds, cfg.data]);
  const selectTarget = Math.min(newPerSession, newPool.length);
  const studyCards = useMemo<BaseCard[]>(() => activeCards.filter((c) => toStudy.includes(c.id)), [activeCards, toStudy]);

  const enabledTypes = useMemo(() => cfg.exerciseTypes.filter((t) => settings?.exercises[t] !== false), [settings, cfg.exerciseTypes]);
  const steps = useMemo(() => {
    const out: { cardId: string; ex: Exercise }[] = [];
    for (const t of enabledTypes) for (const c of studyCards) { const ex = c.exercises?.find((e) => e.type === t); if (ex) out.push({ cardId: c.id, ex }); }
    return out;
  }, [enabledTypes, studyCards]);

  const activePhases = useMemo<Phase[]>(() => {
    const ph: Phase[] = [];
    if (reviewPool.length > 0) ph.push('review');
    if (newPool.length > 0) { ph.push('select'); ph.push('exercises'); }
    return ph;
  }, [reviewPool.length, newPool.length]);

  useEffect(() => {
    if (!ready || !progress || !activeIds) return;
    const now = Date.now();
    const ac = cfg.data.filter((c) => activeIds.includes(c.id)).flatMap((c) => c.cards);
    const rev = ac.filter((c) => { const p = progress[c.id]; return p && p.status === 'studying' && p.sm2.dueDate <= now; }).slice(0, maxReviews);
    const neu = ac.filter((c) => effectiveStatus(progress, c.id, (c.status ?? 'new') as CardStatus) === 'new');
    setReviewPool(rev);
    setNewPool(neu);
    setPhase(rev.length ? 'review' : neu.length ? 'select' : 'empty');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  useEffect(() => { fade.setValue(0); Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start(); }, [phase, fade]);
  useEffect(() => {
    if (phase === 'results' && !saved) {
      setSaved(true);
      const minutes = Math.round((Date.now() - startTime) / 60000);
      if (stats.reviews || stats.added || stats.learned) addSession(module, { ...stats, minutes });
    }
    // eslint-disable-next-line
  }, [phase]);

  const persist = (np: ProgressMap) => { setProgress(np); saveProgress(module, np); };
  const goResults = () => setPhase('results');

  const handleReview = (q: 'good' | 'medium' | 'bad') => {
    const card = reviewPool[reviewIndex];
    if (!progress || !card) return;
    const was = progress[card.id]?.status === 'learned';
    const np = applyReview(progress, card.id, QUALITY[q], repeatsToLearn);
    persist(np);
    const now = np[card.id].status === 'learned' && !was;
    setStats((s) => ({ ...s, reviews: s.reviews + 1, learned: s.learned + (now ? 1 : 0) }));
    if (reviewIndex < reviewPool.length - 1) setReviewIndex(reviewIndex + 1);
    else if (activePhases.includes('select')) setPhase('select');
    else goResults();
  };

  const handleSelect = (knows: boolean) => {
    const card = newPool[selectIndex];
    if (!progress || !card) return;
    let next = toStudy;
    if (knows) { persist(markLearned(progress, card.id, repeatsToLearn)); setStats((s) => ({ ...s, learned: s.learned + 1 })); }
    else { next = [...toStudy, card.id]; setToStudy(next); }
    if (next.length >= newPerSession) { setPhase('exercises'); return; }
    if (selectIndex < newPool.length - 1) { setSelectIndex(selectIndex + 1); return; }
    if (next.length > 0) setPhase('exercises'); else goResults();
  };

  const finishExercises = (errors: Record<string, number>) => {
    if (!progress) { goResults(); return; }
    const withSteps = new Set(steps.map((s) => s.cardId));
    let np = progress; let learnedGained = 0;
    for (const c of studyCards) {
      const before = np[c.id]?.status;
      if (withSteps.has(c.id)) np = recordExerciseResult(np, c.id, (errors[c.id] ?? 0) === 0, repeatsToLearn);
      else np = markStudying(np, c.id);
      if (np[c.id]?.status === 'learned' && before !== 'learned') learnedGained++;
    }
    persist(np);
    setStats((s) => ({ ...s, added: s.added + studyCards.length, learned: s.learned + learnedGained }));
    goResults();
  };

  const onExerciseComplete = (correct: boolean) => {
    const cur = steps[stepIndex];
    const errors = { ...errorsByCard };
    if (cur && !correct) errors[cur.cardId] = (errors[cur.cardId] ?? 0) + 1;
    setErrorsByCard(errors);
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
    else finishExercises(errors);
  };

  // Прогресс текущей фазы (0..1)
  const phaseProgress = phase === 'review' ? (reviewPool.length ? reviewIndex / reviewPool.length : 0)
    : phase === 'select' ? (selectTarget ? toStudy.length / selectTarget : 0)
    : phase === 'exercises' ? (steps.length ? stepIndex / steps.length : 0) : 0;
  const phaseName = phase === 'review' ? 'Повторение' : phase === 'select' ? 'Выбор новых' : phase === 'exercises' ? 'Упражнения' : '';

  if (!ready || !progress) {
    return <SafeAreaView style={styles.screen}><View style={styles.center}><Text style={styles.title}>Загрузка...</Text></View></SafeAreaView>;
  }

  const reviewCard = reviewPool[reviewIndex];
  const selectCard = newPool[selectIndex];
  const curStep = steps[stepIndex];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.circleBtn}><Ionicons name="arrow-back" size={20} color={DARK.text} /></Pressable>
        <Text style={styles.title}>{cfg.labels.trainTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      {phase !== 'results' && phase !== 'empty' && (
        <View style={styles.progressWrap}>
          <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${Math.round(phaseProgress * 100)}%` }]} /></View>
          <Text style={styles.phaseName}>{phaseName}</Text>
        </View>
      )}

      <Animated.View style={[styles.body, { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
        {phase === 'review' && reviewCard && (
          <>
            <View style={styles.phaseContent}>
              <Text style={styles.sub}>Карточка {reviewIndex + 1} из {reviewPool.length}</Text>
              <Pressable style={styles.card} onPress={() => cfg.hasAudio && speak(reviewCard.audioText ?? reviewCard.front)}>
                <Text style={styles.cardFront}>{reviewCard.front}{cfg.hasAudio ? ' 🔊' : ''}</Text>
                <Text style={styles.cardBack}>{reviewCard.back}</Text>
              </Pressable>
            </View>
            <View style={styles.bottomBar}><View style={styles.btnRow}>
              <Pressable style={[styles.third, { backgroundColor: '#3A3D4D' }]} onPress={() => handleReview('bad')}><Text style={styles.thirdText}>Не помню</Text></Pressable>
              <Pressable style={[styles.third, { backgroundColor: '#565A78' }]} onPress={() => handleReview('medium')}><Text style={styles.thirdText}>Плохо</Text></Pressable>
              <Pressable style={[styles.third, { backgroundColor: COLORS.primary }]} onPress={() => handleReview('good')}><Text style={styles.thirdText}>Помню</Text></Pressable>
            </View></View>
          </>
        )}

        {phase === 'select' && selectCard && (
          <>
            <View style={styles.phaseContent}>
              <Text style={styles.sub}>Набрать {toStudy.length} из {selectTarget}</Text>
              <Pressable style={styles.card} onPress={() => cfg.hasAudio && speak(selectCard.audioText ?? selectCard.front)}>
                <Text style={styles.cardFront}>{selectCard.front}{cfg.hasAudio ? ' 🔊' : ''}</Text>
                <Text style={styles.cardBack}>{selectCard.back}</Text>
              </Pressable>
            </View>
            <View style={styles.bottomBar}><View style={styles.btnRow}>
              <Pressable style={[styles.half, { backgroundColor: '#3A3D4D' }]} onPress={() => handleSelect(false)}><Text style={styles.thirdText}>Не знаю</Text></Pressable>
              <Pressable style={[styles.half, { backgroundColor: COLORS.primary }]} onPress={() => handleSelect(true)}><Text style={styles.thirdText}>Знаю</Text></Pressable>
            </View></View>
          </>
        )}

        {phase === 'exercises' && (curStep
          ? <ExerciseView key={stepIndex} exercise={curStep.ex} onComplete={onExerciseComplete} module={module} />
          : (
            <>
              <View style={styles.phaseContent}><Text style={styles.title}>Нет упражнений</Text></View>
              <View style={styles.bottomBar}><Pressable style={styles.cta} onPress={goResults}><Text style={styles.ctaText}>Далее</Text></Pressable></View>
            </>
          ))}

        {phase === 'results' && <Results stats={stats} onFinish={() => router.back()} />}
        {phase === 'empty' && <Empty activeTotal={activeCards.length} progress={progress} cards={activeCards} onFinish={() => router.back()} />}
      </Animated.View>
    </SafeAreaView>
  );
}

function Results({ stats, onFinish }: { stats: { reviews: number; added: number; learned: number }; onFinish: () => void }) {
  const reviews = stats.reviews;
  const added = stats.added;
  const learned = stats.learned;
  return (
    <>
      <View style={styles.phaseContent}>
        <Text style={styles.title}>Результаты</Text>
        <View style={styles.statsCard}>
          <Row label="Новых на изучении" value={added} />
          <Row label="Повторений" value={reviews} />
          <Row label="Выучено" value={learned} last />
        </View>
      </View>
      <View style={styles.bottomBar}><Pressable style={styles.cta} onPress={onFinish}><Text style={styles.ctaText}>Готово</Text></Pressable></View>
    </>
  );
}

function Empty({ activeTotal, cards, progress, onFinish }: { activeTotal: number; cards: BaseCard[]; progress: ProgressMap; onFinish: () => void }) {
  const learned = cards.filter((c) => effectiveStatus(progress, c.id, (c.status ?? 'new') as CardStatus) === 'learned').length;
  let title = 'На сегодня всё';
  let text = 'Сейчас нет новых карточек и нет карточек к повторению.';
  if (activeTotal === 0) { title = 'Нет активных коллекций'; text = 'Включите коллекции в разделе «Коллекции».'; }
  else if (learned === activeTotal) { title = 'Всё выучено!'; text = 'Вы прошли все карточки в активных коллекциях.'; }
  return (
    <>
      <View style={styles.phaseContent}><Text style={styles.title}>{title}</Text><Text style={styles.sub}>{text}</Text></View>
      <View style={styles.bottomBar}><Pressable style={styles.cta} onPress={onFinish}><Text style={styles.ctaText}>Готово</Text></Pressable></View>
    </>
  );
}

function Row({ label, value, last }: { label: string; value: number; last?: boolean }) {
  return (
    <View style={[styles.statRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DARK.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: DARK.card, borderWidth: 1, borderColor: DARK.border, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text, fontFamily: FONT.bold },
  progressWrap: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  progressBar: { height: 5, backgroundColor: DARK.cardAlt, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 5, backgroundColor: COLORS.primary, borderRadius: 3 },
  phaseName: { fontSize: TYPOGRAPHY.size.xs, color: DARK.textDim, marginTop: 4, textAlign: 'center', fontWeight: TYPOGRAPHY.weight.semibold },
  body: { flex: 1 },
  phaseContent: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxxl },
  sub: { fontSize: TYPOGRAPHY.size.base, color: DARK.textDim, textAlign: 'center', marginBottom: SPACING.xl },
  card: { backgroundColor: DARK.card, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: DARK.border, alignItems: 'center', paddingVertical: 48, paddingHorizontal: SPACING.lg },
  cardFront: { fontSize: 30, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text, fontFamily: FONT.bold, marginBottom: SPACING.sm, textAlign: 'center' },
  cardBack: { fontSize: TYPOGRAPHY.size.lg, color: DARK.textDim, textAlign: 'center' },
  bottomBar: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl, paddingTop: SPACING.md },
  btnRow: { flexDirection: 'row', gap: SPACING.sm },
  third: { flex: 1, paddingVertical: SPACING.lg, borderRadius: 12, alignItems: 'center' },
  thirdText: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.semibold, color: '#fff' },
  half: { flex: 1, paddingVertical: SPACING.lg, borderRadius: 12, alignItems: 'center' },
  cta: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  ctaText: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, color: '#fff' },
  statsCard: { backgroundColor: DARK.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: DARK.border, padding: SPACING.lg },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: DARK.border },
  statLabel: { fontSize: TYPOGRAPHY.size.base, color: DARK.text },
  statValue: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text },
});
