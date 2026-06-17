import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, COMMON_STYLES } from '../../lib/theme';

const MODULES = [
  [
    { title: 'Слова', route: '/words', icon: 'library' },
  ],
  [
    { title: 'Фонетика', route: '/pronunciation', icon: 'mic' },
    { title: 'Грамматика', route: '/grammar', icon: 'construct' },
  ],
  [
    { title: 'Чтение', route: '/reading', icon: 'newspaper' },
    { title: 'Письмо', route: '/writing', icon: 'create' },
  ],
  [
    { title: 'Аудирование', route: '/listening', icon: 'headset' },
    { title: 'Говорение', route: '/speaking', icon: 'chatbubbles' },
  ],
];

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={COMMON_STYLES.header}>
        <Text style={COMMON_STYLES.title}>Английский C2</Text>
        <View style={styles.spacer} />
        <Pressable onPress={() => router.push('/main/settings')}>
          <Ionicons name="settings-outline" size={28} color={COLORS.black} />
        </Pressable>
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
                <Ionicons name={item.icon as any} size={32} color={COLORS.black} />
                <Text style={styles.cellText}>{item.title}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
      <View style={styles.bottomBar}>
        <Pressable style={COMMON_STYLES.button} onPress={() => router.push('/main/unified-train')}>
          <Text style={COMMON_STYLES.buttonText}>Начать мульти-тренировку</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.white },
  spacer: { flex: 1 },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: 120 },
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
    marginTop: SPACING.sm,
  },
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
