import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, COMMON_STYLES } from '../../lib/theme';

const TABS = ['Сегодня', 'Неделя', 'Месяц', 'Всего'] as const;
type Tab = (typeof TABS)[number];

export default function PronunciationIndex() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('Сегодня');

  const vocabulary = 0;
  const studying = 0;
  const stats = { learned: 0, added: 0, repeats: 0, minutes: 0 };

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
        <Text style={COMMON_STYLES.title}>Письмо</Text>
        <View style={styles.spacer} />
        <Pressable onPress={() => router.push('/writing/train-settings')} style={styles.gear}>
          <Text style={styles.gearText}>⚙️</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.counterRow}>
          <Pressable style={styles.counterCard} onPress={() => router.push('/writing/vocabulary')}>
            <Text style={styles.counterValue}>{vocabulary}</Text>
            <Text style={styles.counterLabel}>Выполненные задания</Text>
          </Pressable>

          <Pressable style={styles.counterCard} onPress={() => router.push('/writing/studying')}>
            <Text style={styles.counterValue}>{studying}</Text>
            <Text style={styles.counterLabel}>Изучаемые задания</Text>
          </Pressable>
        </View>

        <View style={styles.counterRow}>
          <Pressable style={styles.counterCardFull} onPress={() => router.push('/writing/collections')}>
            <Text style={styles.counterValue}>300</Text>
            <Text style={styles.counterLabel}>Коллекции заданий</Text>
          </Pressable>
        </View>

        <View style={COMMON_STYLES.card}>
          <View style={styles.tabRow}>
            {TABS.map((t, index) => (
              <Pressable
                key={t}
                style={styles.tab}
                onPress={() => setTab(t)}
              >
                <Text style={[
                  styles.tabText,
                  tab === t && styles.tabTextActive,
                  index === 0 && styles.tabTextFirst,
                  index === TABS.length - 1 && styles.tabTextLast,
                  (index === 1 || index === 2) && styles.tabTextCenter,
                ]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <StatRow label="Повторений" value={stats.repeats} />
          <StatRow label="Добавлено на изучение" value={stats.added} />
          <StatRow label="Начато изучение" value={0} />
          <StatRow label="Полностью выучено" value={stats.learned} />
          <StatRow label="Время обучения" value={`${stats.minutes} мин`} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={COMMON_STYLES.button} onPress={() => router.push('/writing/train')}>
          <Text style={COMMON_STYLES.buttonText}>Тренировать письмо</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.white },
  back: { paddingRight: SPACING.lg },
  backText: { fontSize: TYPOGRAPHY.size.xl, color: COLORS.black },
  spacer: { flex: 1 },
  gear: {},
  gearText: { fontSize: TYPOGRAPHY.size.xxl, color: COLORS.black },

  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: 120 },

  counterRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  counterCard: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  counterCardFull: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  counterValue: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  counterLabel: {
    fontSize: TYPOGRAPHY.size.md / 1.4,
    color: COLORS.gray[500],
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
  },

  tabRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    marginHorizontal: -SPACING.xl,
    marginTop: -SPACING.lg,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
  },
  tabText: {
    fontSize: TYPOGRAPHY.size.md / 1.4,
    color: COLORS.gray[500],
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  tabTextActive: { color: COLORS.black },
  tabTextFirst: {
    textAlign: 'left',
  },
  tabTextCenter: {
    textAlign: 'center',
  },
  tabTextLast: {
    textAlign: 'right',
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray[100],
  },
  statLabel: { fontSize: TYPOGRAPHY.size.base, color: COLORS.black },
  statValue: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold, color: COLORS.black },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.white,
  },
});
