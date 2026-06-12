import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '../../../lib/theme';

export default function CardDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const card = {
    id,
    title: 'Practice Dialog',
    ru: 'Практический диалог',
    transcript: 'Hello, how are you today? I am fine, thank you. How about you?',
    transcriptRu: 'Здравствуйте, как дела сегодня? У меня всё хорошо, спасибо. А у вас?',
    duration: '2:30',
    status: 'new',
    repeatCount: 0,
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={COMMON_STYLES.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>◀</Text>
        </Pressable>
        <Text style={COMMON_STYLES.title}>Диалог</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.audioCard}>
          <Text style={styles.audioTitle}>{card.title}</Text>
          <Text style={styles.audioRu}>{card.ru}</Text>
          <Text style={styles.audioDuration}>🎧 {card.duration}</Text>
        </View>

        <Text style={styles.sectionLabel}>ТРАНСКРИПТ</Text>
        <View style={styles.transcriptCard}>
          <Text style={styles.transcriptEn}>{card.transcript}</Text>
          <Text style={styles.transcriptRu}>{card.transcriptRu}</Text>
        </View>

        <Text style={styles.sectionLabel}>ПРОГРЕСС</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Статус</Text>
            <Text style={styles.progressValue}>
              {card.status === 'new' && 'Не изучено'}
              {card.status === 'studying' && 'На изучении'}
              {card.status === 'learned' && 'Выучено'}
            </Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Повторений</Text>
            <Text style={styles.progressValue}>{card.repeatCount}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={[styles.actionBtn, styles.actionBtnPrimary]}>
            <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>Тренировать</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.white },
  back: { paddingRight: SPACING.lg },
  backText: { fontSize: TYPOGRAPHY.size.xl, color: COLORS.black },

  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xs, paddingBottom: SPACING.xxxl },

  audioCard: {
    ...COMMON_STYLES.card,
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    marginTop: SPACING.lg,
  },
  audioTitle: { fontSize: 32, fontWeight: TYPOGRAPHY.weight.bold, color: COLORS.black, marginBottom: SPACING.sm },
  audioRu: { fontSize: TYPOGRAPHY.size.lg, color: COLORS.gray[600], marginBottom: SPACING.sm },
  audioDuration: { fontSize: TYPOGRAPHY.size.base, color: COLORS.gray[500] },

  sectionLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.gray[400],
    letterSpacing: 1,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },

  transcriptCard: {
    ...COMMON_STYLES.card,
    marginBottom: SPACING.sm,
  },
  transcriptEn: { fontSize: TYPOGRAPHY.size.base, color: COLORS.black, marginBottom: SPACING.sm, lineHeight: 22 },
  transcriptRu: { fontSize: TYPOGRAPHY.size.sm, color: COLORS.gray[600], lineHeight: 20 },

  progressCard: {
    ...COMMON_STYLES.card,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray[100],
  },
  progressLabel: { fontSize: TYPOGRAPHY.size.base, color: COLORS.black },
  progressValue: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold, color: COLORS.black },

  actions: {
    marginTop: SPACING.xl,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, color: COLORS.white },
  actionBtnPrimary: { backgroundColor: COLORS.primary },
  actionBtnTextPrimary: { color: COLORS.white },
});
