import { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, RADIUS, FONT, DARK } from '../lib/theme';
import { ModuleId, CardStatus } from '../lib/types';
import { MODULES } from '../lib/modules';
import { loadProgress, effectiveStatus, ProgressMap } from '../lib/progress';

export function CardsList({ module, filter }: { module: ModuleId; filter: 'learned' | 'studying' }) {
  const router = useRouter();
  const cfg = MODULES[module];
  const [progress, setProgress] = useState<ProgressMap>({});
  const [q, setQ] = useState('');

  useFocusEffect(
    useCallback(() => {
      let a = true;
      loadProgress(module).then((p) => { if (a) setProgress(p); });
      return () => { a = false; };
    }, [module]),
  );

  const all = cfg.data.flatMap((c) => c.cards);
  const items = all.filter((c) => effectiveStatus(progress, c.id, (c.status ?? 'new') as CardStatus) === filter);
  const filtered = items.filter((c) => q.trim() === '' || c.front.toLowerCase().includes(q.toLowerCase()) || c.back.toLowerCase().includes(q.toLowerCase()));
  const title = filter === 'learned' ? cfg.labels.learned : cfg.labels.studying;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace(`/${module}` as never))} style={styles.circleBtn}>
          <Ionicons name="arrow-back" size={20} color={DARK.text} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchRow}>
        <TextInput style={styles.search} value={q} onChangeText={setQ} placeholder="Поиск..." placeholderTextColor={DARK.textMute} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.count}>ВСЕГО: {filtered.length}</Text>
        {filtered.map((c) => (
          <Pressable key={c.id} style={styles.row} onPress={() => router.push(`/${module}/card/${c.id}` as never)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.front}>{c.front}</Text>
              <Text style={styles.back} numberOfLines={1}>{c.back}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
        {filtered.length === 0 && <Text style={styles.empty}>Пока ничего нет</Text>}
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
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: DARK.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: DARK.border, padding: SPACING.lg, marginBottom: SPACING.sm },
  front: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.semibold, color: DARK.text },
  back: { fontSize: TYPOGRAPHY.size.sm, color: DARK.textDim, marginTop: 2 },
  arrow: { fontSize: TYPOGRAPHY.size.xl, color: DARK.textMute, marginLeft: SPACING.sm },
  empty: { textAlign: 'center', color: DARK.textMute, marginTop: 48 },
});
