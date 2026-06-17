import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, COMMON_STYLES } from '../../../lib/theme';
import cardsData from '../cards_database/cards_database.json';

export default function CollectionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const collection = cardsData.find(c => c.id === id);

  if (!collection) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.emptyText}>Коллекция не найдена</Text>
      </SafeAreaView>
    );
  }

  const filteredCards = collection.cards.filter(card =>
    query.trim() === '' ||
    card.title.toLowerCase().includes(query.toLowerCase()) ||
    card.ru.toLowerCase().includes(query.toLowerCase())
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/pronunciation/collections');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={COMMON_STYLES.header}>
        <Pressable onPress={handleBack} style={styles.back}>
          <Text style={styles.backText}>◀</Text>
        </Pressable>
        <Text style={COMMON_STYLES.title}>{collection.title}</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={[styles.searchInput, isFocused && styles.searchInputFocused]}
          value={query}
          onChangeText={setQuery}
          placeholder="Поиск звука..."
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
        <Text style={styles.sectionLabel}>ВСЕГО КАРТОЧЕК: {filteredCards.length}</Text>

        {filteredCards.length === 0 ? (
          <Text style={styles.emptyText}>Ничего не найдено</Text>
        ) : (
          filteredCards.map(card => (
            <Pressable
              key={card.id}
              style={styles.card}
              onPress={() => router.push('/pronunciation/card/' + card.id)}
            >
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardRu}>{card.ru}</Text>
                <Text style={styles.cardStatus}>
                  {card.status === 'new' && '🆕 Новое'}
                  {card.status === 'studying' && '📚 Изучается'}
                  {card.status === 'learned' && '✅ Выучено'}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))
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
  searchInputFocused: { borderColor: COLORS.black },
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

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, color: COLORS.black },
  cardRu: { fontSize: TYPOGRAPHY.size.base, color: COLORS.gray[500], marginTop: 4 },
  cardStatus: { fontSize: TYPOGRAPHY.size.sm, color: COLORS.gray[400], marginTop: 8 },
  arrow: { fontSize: TYPOGRAPHY.size.xl, color: COLORS.gray[200], marginLeft: SPACING.sm },
  emptyText: { fontSize: TYPOGRAPHY.size.base, color: COLORS.gray[400], textAlign: 'center', marginTop: SPACING.xl },
});
