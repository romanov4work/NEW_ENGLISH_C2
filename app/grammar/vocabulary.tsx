import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, COMMON_STYLES } from '../../lib/theme';

// Мок-данные выученных правил
const MOCK_RULES = [
  { id: '1', title: 'Present Simple', ru: 'Простое настоящее время' },
  { id: '2', title: 'Past Simple', ru: 'Простое прошедшее время' },
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
        <Text style={COMMON_STYLES.title}>Выученные правила</Text>
        <View style={styles.spacer} />
        <Pressable onPress={() => setSearchOpen(!searchOpen)} style={styles.iconBtn}>
          <Text style={[styles.iconText, searchOpen && styles.iconActive]}>🔍</Text>
        </Pressable>
        <Pressable style={styles.iconBtn}>
          <Text style={styles.iconText}>＋</Text>
        </Pressable>
      </View>

      {/* Строка поиска */}
      {searchOpen && (
        <View style={styles.searchRow}>
          <TextInput
            style={[
              styles.searchInput,
              isFocused && styles.searchInputFocused
            ]}
            value={query}
            onChangeText={setQuery}
            placeholder="Поиск правил..."
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
        <Text style={styles.sectionLabel}>ВСЕГО ВЫУЧЕНО: {MOCK_RULES.length}</Text>

        {MOCK_RULES.map((rule) => (
          <Pressable
            key={rule.id}
            style={styles.ruleCard}
            onPress={() => router.push(`/grammar/card/${rule.id}`)}
          >
            <View style={styles.ruleText}>
              <Text style={styles.ruleTitle}>{rule.title}</Text>
              <Text style={styles.ruleRu}>{rule.ru}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}

        {MOCK_RULES.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Пока ничего нет</Text>
            <Text style={styles.emptyText}>
              Начните обучение, и здесь появятся выученные правила
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

  ruleCard: {
    ...COMMON_STYLES.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ruleText: { flex: 1 },
  ruleTitle: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.semibold, color: COLORS.black, marginBottom: 2 },
  ruleRu: { fontSize: TYPOGRAPHY.size.sm, color: COLORS.gray[600] },
  arrow: { fontSize: TYPOGRAPHY.size.xl, color: COLORS.gray[200], marginLeft: SPACING.sm },

  empty: { alignItems: 'center', paddingVertical: 64 },
  emptyTitle: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, color: COLORS.black, marginBottom: SPACING.sm },
  emptyText: { fontSize: TYPOGRAPHY.size.base, color: COLORS.gray[500], textAlign: 'center', paddingHorizontal: SPACING.xxxl },
});
