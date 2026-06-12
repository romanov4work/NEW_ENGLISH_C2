import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, COMMON_STYLES } from '../../lib/theme';

const MOCK_AUDIO = [
  { id: '1', title: 'Essay Task', ru: 'Задание на эссе' },
  { id: '2', title: 'News Report', ru: 'Новостной репортаж' },
];

export default function Vocabulary() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={COMMON_STYLES.header}>
        <Pressable onPress={handleBack} style={styles.back}>
          <Text style={styles.backText}>◀</Text>
        </Pressable>
        <Text style={COMMON_STYLES.title}>Выполненные задания</Text>
        <View style={styles.spacer} />
        <Pressable onPress={() => setSearchOpen(!searchOpen)} style={styles.iconBtn}>
          <Text style={[styles.iconText, searchOpen && styles.iconActive]}>🔍</Text>
        </Pressable>
        <Pressable style={styles.iconBtn}>
          <Text style={styles.iconText}>＋</Text>
        </Pressable>
      </View>

      {searchOpen && (
        <View style={styles.searchRow}>
          <TextInput
            style={[
              styles.searchInput,
              isFocused && styles.searchInputFocused
            ]}
            value={query}
            onChangeText={setQuery}
            placeholder="Поиск заданий..."
            placeholderTextColor={COLORS.gray[300]}
            autoFocus
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.searchClear}>
              <Text style={styles.searchClearText}>✕</Text>
            </Pressable>
          )}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>ВСЕГО ВЫПОЛНЕНО: {MOCK_AUDIO.length}</Text>

        {MOCK_AUDIO.map((audio) => (
          <Pressable
            key={audio.id}
            style={styles.audioCard}
            onPress={() => router.push(`/writing/card/${audio.id}`)}
          >
            <View style={styles.audioText}>
              <Text style={styles.audioTitle}>{audio.title}</Text>
              <Text style={styles.audioRu}>{audio.ru}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}

        {MOCK_AUDIO.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Пока ничего нет</Text>
            <Text style={styles.emptyText}>
              Начните обучение, и здесь появятся выполненные задания
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.white },
  back: { paddingRight: SPACING.lg },
  backText: { fontSize: TYPOGRAPHY.size.xl, color: COLORS.black },
  spacer: { flex: 1 },
  iconBtn: { paddingLeft: SPACING.sm },
  iconText: { fontSize: TYPOGRAPHY.size.xl, color: COLORS.gray[700] },
  iconActive: { color: COLORS.primary },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.black,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchInputFocused: {
    borderColor: COLORS.black,
  },
  searchClear: {
    position: 'absolute',
    right: SPACING.sm,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchClearText: { fontSize: TYPOGRAPHY.size.lg, color: COLORS.gray[400] },

  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xs, paddingBottom: SPACING.xxxl },
  sectionLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.gray[400],
    letterSpacing: 1,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },

  audioCard: {
    ...COMMON_STYLES.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  audioText: { flex: 1 },
  audioTitle: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.semibold, color: COLORS.black, marginBottom: 2 },
  audioRu: { fontSize: TYPOGRAPHY.size.sm, color: COLORS.gray[600] },
  arrow: { fontSize: TYPOGRAPHY.size.xl, color: COLORS.gray[200], marginLeft: SPACING.sm },

  empty: { alignItems: 'center', paddingVertical: 64 },
  emptyTitle: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, color: COLORS.black, marginBottom: SPACING.sm },
  emptyText: { fontSize: TYPOGRAPHY.size.base, color: COLORS.gray[500], textAlign: 'center', paddingHorizontal: SPACING.xxxl },
});
