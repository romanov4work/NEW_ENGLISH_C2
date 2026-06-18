import { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, RADIUS, FONT, COLORS, DARK } from '../lib/theme';
import { ModuleId, CardStatus, BaseCard } from '../lib/types';
import { MODULES } from '../lib/modules';
import { loadProgress, saveProgress, markLearned, markStudying, resetCardProgress, effectiveStatus, ProgressMap, DEFAULT_REPEATS_TO_LEARN } from '../lib/progress';
import { loadSettings } from '../lib/trainSettings';
import { speak } from '../lib/speech';
import { WordImage } from '../lib/WordImage';

function fmtDate(ts: number) {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </>
  );
}

export function CardDetail({ module }: { module: ModuleId }) {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cfg = MODULES[module];
  const [progress, setProgress] = useState<ProgressMap>({});
  const [repeatsToLearn, setRepeats] = useState(DEFAULT_REPEATS_TO_LEARN);

  useFocusEffect(
    useCallback(() => {
      let a = true;
      (async () => {
        const [pr, st] = await Promise.all([loadProgress(module), loadSettings(module, cfg.exerciseTypes, cfg.defaultNew)]);
        if (a) { setProgress(pr); setRepeats(st.repeatsToLearn); }
      })();
      return () => { a = false; };
    }, [module]),
  );

  const card = cfg.data.flatMap((c) => c.cards).find((c) => c.id === id) as BaseCard | undefined;
  if (!card) {
    return <SafeAreaView style={styles.screen}><Text style={styles.empty}>Карточка не найдена</Text></SafeAreaView>;
  }

  const status = effectiveStatus(progress, card.id, (card.status ?? 'new') as CardStatus);
  const pr = progress[card.id];
  const repeatCount = pr?.repeatCount ?? 0;
  const statusLabel = status === 'new' ? 'Не изучено' : status === 'studying' ? 'На изучении' : 'Выучено';
  const update = (np: ProgressMap) => { setProgress(np); saveProgress(module, np); };
  const audioText = card.audioText ?? card.front;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.circleBtn}><Ionicons name="arrow-back" size={20} color={DARK.text} /></Pressable>
        <Text style={styles.title}>Карточка</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Лицо */}
        <View style={styles.hero}>
          {cfg.hasImage ? <View style={{ marginBottom: SPACING.md }}><WordImage id={card.id} word={card.front} size={130} /></View> : null}
          <View style={styles.heroRow}>
            <Text style={styles.heroFront}>{card.front}</Text>
            {cfg.hasAudio ? (
              <Pressable onPress={() => speak(audioText)} hitSlop={12} style={{ marginLeft: SPACING.sm }}><Text style={styles.speak}>🔊</Text></Pressable>
            ) : null}
          </View>
          {card.ipa ? <Text style={styles.ipa}>{card.ipa}</Text> : null}
          {card.pos ? <Text style={styles.pos}>{card.pos}</Text> : null}
          <Text style={styles.heroBack}>{card.back}</Text>
        </View>

        {card.theory ? <Section label="ТЕОРИЯ"><Text style={styles.body}>{card.theory}</Text></Section> : null}
        {card.text ? <Section label="ТЕКСТ"><Text style={styles.body}>{card.text}</Text></Section> : null}
        {card.transcript ? <Section label="ТРАНСКРИПТ"><Text style={styles.body}>{card.transcript}</Text></Section> : null}
        {card.prompt ? <Section label="ЗАДАНИЕ"><Text style={styles.body}>{card.prompt}</Text></Section> : null}
        {card.dialog && card.dialog.length ? (
          <Section label="ДИАЛОГ">
            {card.dialog.map((d, i) => (
              <Text key={i} style={styles.body}><Text style={styles.speaker}>{d.speaker}: </Text>{d.line}</Text>
            ))}
          </Section>
        ) : null}
        {card.examples && card.examples.length ? (
          <Section label="ПРИМЕРЫ">
            {card.examples.map((ex, i) => (
              <View key={i} style={{ marginBottom: SPACING.sm }}>
                <Text style={styles.exEn}>{ex.en}</Text>
                <Text style={styles.exRu}>{ex.ru}</Text>
              </View>
            ))}
          </Section>
        ) : null}

        <Section label="ПРОГРЕСС">
          <View style={styles.pRow}><Text style={styles.pLabel}>Статус</Text><Text style={styles.pVal}>{statusLabel}</Text></View>
          <View style={styles.pRow}><Text style={styles.pLabel}>Повторений до «выучено»</Text><Text style={styles.pVal}>{status === 'learned' ? `${repeatsToLearn} из ${repeatsToLearn}` : `${repeatCount} из ${repeatsToLearn}`}</Text></View>
          {pr && status === 'studying' ? (
            <View style={[styles.pRow, { borderBottomWidth: 0 }]}><Text style={styles.pLabel}>Следующее повторение</Text><Text style={styles.pVal}>{pr.sm2.dueDate <= Date.now() ? 'сейчас' : fmtDate(pr.sm2.dueDate)}</Text></View>
          ) : null}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DARK.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: DARK.card, borderWidth: 1, borderColor: DARK.border, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text, fontFamily: FONT.bold },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl },
  hero: { backgroundColor: DARK.card, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: DARK.border, padding: SPACING.xl, alignItems: 'center', marginTop: SPACING.sm },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroFront: { fontSize: 28, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text, fontFamily: FONT.bold, textAlign: 'center' },
  speak: { fontSize: 22 },
  ipa: { fontSize: TYPOGRAPHY.size.md, color: DARK.textDim, marginTop: SPACING.xs },
  pos: { fontSize: TYPOGRAPHY.size.sm, color: DARK.textMute, fontStyle: 'italic', marginTop: 2 },
  heroBack: { fontSize: TYPOGRAPHY.size.lg, color: DARK.textDim, marginTop: SPACING.sm, textAlign: 'center' },
  sectionLabel: { fontSize: TYPOGRAPHY.size.xs, color: DARK.textMute, letterSpacing: 1, fontWeight: TYPOGRAPHY.weight.semibold, marginTop: SPACING.xl, marginBottom: SPACING.sm },
  sectionCard: { backgroundColor: DARK.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: DARK.border, padding: SPACING.lg },
  body: { fontSize: TYPOGRAPHY.size.base, color: DARK.text, lineHeight: 22, marginBottom: 4 },
  speaker: { fontWeight: TYPOGRAPHY.weight.bold, color: DARK.textDim },
  exEn: { fontSize: TYPOGRAPHY.size.base, color: DARK.text },
  exRu: { fontSize: TYPOGRAPHY.size.sm, color: DARK.textDim, marginTop: 2 },
  pRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: DARK.border },
  pLabel: { fontSize: TYPOGRAPHY.size.base, color: DARK.text },
  pVal: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text },
  btnRow: { flexDirection: 'row', gap: SPACING.sm },
  btnHalf: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: DARK.border },
  btnHalfText: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.semibold, color: DARK.text },
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnText: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, color: '#fff' },
  reset: { alignItems: 'center', paddingVertical: SPACING.md },
  resetText: { fontSize: TYPOGRAPHY.size.sm, color: DARK.textMute },
  empty: { textAlign: 'center', color: DARK.textMute, marginTop: 48 },
});
