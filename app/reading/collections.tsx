import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, COMMON_STYLES } from '../../lib/theme';
import cardsData from './cards_database/cards_database.json';

export default function CollectionsScreen() {
  const router = useRouter();
  const [activeIds, setActiveIds] = useState<string[]>(['1', '2']);
  
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const toggle = (id: string) => {
    setActiveIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const filteredCollections = cardsData.filter(c =>
    query.trim() === '' || c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={COMMON_STYLES.header}>
        <Pressable onPress={handleBack} style={styles.back}>
          <Text style={styles.backText}>◀</Text>
        </Pressable>
        <Text style={COMMON_STYLES.title}>Коллекции текстов</Text>
        <View style={styles.spacer} />
      </View>

      
        <View style={styles.searchRow}>
          <TextInput
            style={[
              styles.searchInput,
              isFocused && styles.searchInputFocused
            ]}
            value={query}
            onChangeText={setQuery}
            placeholder="Поиск коллекции текстов..."
            placeholderTextColor={COLORS.gray[300]}
            
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.searchClear}>
              <Text style={styles.searchClearText}>✕</Text>
            </Pressable>
          )}
        </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>ВЫБЕРИТЕ ДЛЯ ТРЕНИРОВКИ</Text>

        {filteredCollections.map((c) => {
          const isActive = activeIds.includes(c.id);
          const pct = c.total > 0 ? Math.round((c.learned / c.total) * 100) : 0;

          return (
            <View key={c.id} style={styles.tile}>
              <Pressable onPress={() => toggle(c.id)} style={styles.checkboxBtn}>
                <View style={[styles.checkbox, isActive && styles.checkboxChecked]}>
                  {isActive && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </Pressable>

              <Pressable style={styles.tileMain} onPress={() => router.push('/reading/collection/' + c.id)}>
                <View style={styles.tileText}>
                  <Text style={[styles.tileTitle, isActive && styles.tileTitleActive]} numberOfLines={1}>
                    {c.title}
                  </Text>
                  <Text style={styles.tileMeta}>
                    {c.learned > 0 ? `Прослушано ${c.learned} (${pct}%)` : 'Не начато'}
                  </Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${pct}%` }]} />
                  </View>
                </View>
                <Text style={styles.arrow}>›</Text>
              </Pressable>
            </View>
          );
        })}

        <Text style={styles.hint}>
          Отмеченные коллекции используются для тренировки.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.white },
  back: { paddingRight: SPACING.lg },
  backText: { fontSize: TYPOGRAPHY.size.xl, color: COLORS.black },
  spacer: { flex: 1 },

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

  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },

  checkboxBtn: { paddingHorizontal: 14, paddingVertical: 18, justifyContent: 'center', alignItems: 'center' },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxChecked: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  checkmark: { color: COLORS.white, fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.bold, lineHeight: 16 },

  tileMain: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingRight: SPACING.lg },
  tileText: { flex: 1 },
  tileTitle: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.bold, color: COLORS.black },
  tileTitleActive: { color: COLORS.primary },
  tileMeta: { fontSize: TYPOGRAPHY.size.sm, color: COLORS.gray[500], marginTop: 2 },

  progressBar: {
    height: 3,
    backgroundColor: COLORS.gray[100],
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: { height: 3, backgroundColor: COLORS.primary, borderRadius: 2 },

  arrow: { fontSize: TYPOGRAPHY.size.xl, color: COLORS.gray[200], marginLeft: SPACING.sm },
  hint: { fontSize: TYPOGRAPHY.size.sm, color: COLORS.gray[300], textAlign: 'center', marginTop: SPACING.lg, paddingHorizontal: SPACING.sm, lineHeight: 18 },
});
