import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, RADIUS, FONT, DARK } from '../lib/theme';
import { ModuleId } from '../lib/types';
import { MODULES } from '../lib/modules';

export function CollectionDetail({ module }: { module: ModuleId }) {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cfg = MODULES[module];
  const [q, setQ] = useState('');
  const collection = cfg.data.find((c) => c.id === id);

  if (!collection) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.empty}>Коллекция не найдена</Text>
      </SafeAreaView>
    );
  }

  const filtered = collection.cards.filter((c) => q.trim() === '' || c.front.toLowerCase().includes(q.toLowerCase()) || c.back.toLowerCase().includes(q.toLowerCase()));

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace(`/${module}/collections` as never))} style={styles.circleBtn}>
          <Ionicons name="arrow-back" size={20} color={DARK.text} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{collection.title}</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DARK.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: DARK.card, borderWidth: 1, borderColor: DARK.border, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text, fontFamily: FONT.bold, paddingHorizontal: SPACING.sm },
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
