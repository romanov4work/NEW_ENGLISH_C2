import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../lib/theme';

const MODULES = [
  [
    { title: 'Слова', route: '/words' },
  ],
  [
    { title: 'Фонетика', route: '/pronunciation' },
    { title: 'Грамматика', route: '/grammar' },
  ],
  [
    { title: 'Чтение', route: '/reading' },
    { title: 'Письмо', route: '/writing' },
  ],
  [
    { title: 'Аудирование', route: '/listening' },
    { title: 'Говорение', route: '/speaking' },
  ],
];

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Английский C2</Text>
      </View>
      <View style={styles.content}>
        {MODULES.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((item) => (
              <Pressable
                key={item.title}
                style={row.length === 1 ? styles.cellFull : styles.cell}
                onPress={() => item.route && router.push(item.route as any)}
              >
                <Text style={styles.cellText}>{item.title}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.black },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  cell: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  cellFull: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  cellText: {
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.black,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});
