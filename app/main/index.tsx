import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TYPOGRAPHY, SPACING, RADIUS, FONT, DARK } from '../../lib/theme';
import { MODULE_LIST } from '../../lib/modules';

export default function Home() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Английский C2</Text>
        <Pressable onPress={() => router.push('/main/settings')} style={({ pressed }) => [styles.circleBtn, pressed && styles.pressed]}>
          <Ionicons name="settings-outline" size={18} color={DARK.text} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Выберите модуль</Text>
        <View style={styles.grid}>
          {MODULE_LIST.map((m) => (
            <Pressable key={m.id} style={({ pressed }) => [styles.cell, pressed && styles.pressed]} onPress={() => router.push(`/${m.id}` as never)}>
              <LinearGradient colors={m.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.icon}>
                <Ionicons name={m.icon} size={26} color="#fff" />
              </LinearGradient>
              <Text style={styles.cellText}>{m.title}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DARK.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  title: { fontSize: TYPOGRAPHY.size.xxl, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text, fontFamily: FONT.bold },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: DARK.card, borderWidth: 1, borderColor: DARK.border, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl },
  subtitle: { fontSize: TYPOGRAPHY.size.sm, color: DARK.textDim, marginBottom: SPACING.md, marginTop: SPACING.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  cell: { width: '48%', flexGrow: 1, backgroundColor: DARK.card, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: DARK.border, paddingVertical: SPACING.xl, alignItems: 'center', minHeight: 120, justifyContent: 'center' },
  icon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  cellText: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.semibold, color: DARK.text, fontFamily: FONT.semibold },
});
