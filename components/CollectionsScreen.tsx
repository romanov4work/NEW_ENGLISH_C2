import { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, RADIUS, FONT, COLORS, DARK } from '../lib/theme';
import { ModuleId, CardStatus, Collection } from '../lib/types';
import { MODULES } from '../lib/modules';
import { loadProgress, effectiveStatus, loadActiveCollections, saveActiveCollections, ProgressMap } from '../lib/progress';

export function CollectionsScreen({ module }: { module: ModuleId }) {
  const router = useRouter();
  const cfg = MODULES[module];
  const defaultActive = cfg.data.filter((c) => c.active).map((c) => c.id);
  const [activeIds, setActiveIds] = useState<string[]>(defaultActive);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [q, setQ] = useState('');

  useFocusEffect(
    useCallback(() => {
      let a = true;
      (async () => {
        const [ids, pr] = await Promise.all([loadActiveCollections(module, defaultActive), loadProgress(module)]);
        if (a) { setActiveIds(ids); setProgress(pr); }
      })();
      return () => { a = false; };
    }, [module]),
  );

  const toggle = (id: string) => {
    setActiveIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveActiveCollections(module, next);
      return next;
    });
  };

  const learnedIn = (c: Collection) => c.cards.filter((card) => effectiveStatus(progress, card.id, (card.status ?? 'new') as CardStatus) === 'learned').length;
  const filtered = cfg.data.filter((c) => q.trim() === '' || c.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace(`/${module}` as never))} style={styles.circleBtn}>
          <Ionicons name="arrow-back" size={20} color={DARK.text} />
        </Pressable>
        <Text style={styles.title}>Коллекции</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchRow}>
        <TextInput style={styles.search} value={q} onChangeText={setQ} placeholder="Поиск коллекции..." placeholderTextColor={DARK.textMute} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.count}>ВЫБЕРИТЕ ДЛЯ ТРЕНИРОВКИ</Text>
        {filtered.map((c) => {
          const isActive = activeIds.includes(c.id);
          const total = c.cards.length;
          const learned = learnedIn(c);
          const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
          return (
            <View key={c.id} style={styles.tile}>
              <Pressable onPress={() => toggle(c.id)} style={styles.checkBtn}>
                <View style={[styles.checkbox, isActive && styles.checkboxOn]}>{isActive && <Text style={styles.check}>✓</Text>}</View>
              </Pressable>
              <Pressable style={styles.tileMain} onPress={() => router.push(`/${module}/collection/${c.id}` as never)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tileTitle} numberOfLines={1}>{c.title}</Text>
                  <Text style={styles.tileMeta}>{learned > 0 ? `Выучено ${learned} из ${total} (${pct}%)` : `Не начато · ${total}`}</Text>
                  <View style={styles.bar}><View style={[styles.barFill, { width: `${pct}%` }]} /></View>
                </View>
                <Text style={styles.arrow}>›</Text>
              </Pressable>
            </View>
          );
        })}
        <Text style={styles.hint}>Отмеченные коллекции используются для тренировки.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DARK.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: DARK.card, borderWidth: 1, borderColor: DARK.border, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text, fontFamily: FONT.bold },
  searchRow: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  search: { height: 44, backgroundColor: DARK.card, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, color: DARK.text, borderWidth: 1, borderColor: DARK.border },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl },
  count: { fontSize: TYPOGRAPHY.size.xs, color: DARK.textMute, letterSpacing: 1, fontWeight: TYPOGRAPHY.weight.semibold, marginVertical: SPACING.sm },
  tile: { flexDirection: 'row', alignItems: 'center', backgroundColor: DARK.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: DARK.border, marginBottom: SPACING.sm },
  checkBtn: { paddingHorizontal: 14, paddingVertical: 18 },
  checkbox: { width: 22, height: 22, borderRadius: RADIUS.sm, borderWidth: 2, borderColor: DARK.border, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  check: { color: '#fff', fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.bold, lineHeight: 16 },
  tileMain: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingRight: SPACING.lg },
  tileTitle: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text },
  tileMeta: { fontSize: TYPOGRAPHY.size.sm, color: DARK.textDim, marginTop: 2 },
  bar: { height: 3, backgroundColor: DARK.border, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  barFill: { height: 3, backgroundColor: COLORS.primary, borderRadius: 2 },
  arrow: { fontSize: TYPOGRAPHY.size.xl, color: DARK.textMute, marginLeft: SPACING.sm },
  hint: { fontSize: TYPOGRAPHY.size.sm, color: DARK.textMute, textAlign: 'center', marginTop: SPACING.lg },
});
