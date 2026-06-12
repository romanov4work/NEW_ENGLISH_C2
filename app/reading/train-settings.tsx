import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Platform, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, COMMON_STYLES } from '../../lib/theme';

export default function TrainSettings() {
  const router = useRouter();
  const [newPerSession, setNewPerSession] = useState<number>(5);
  const [reviewsPerSession, setReviewsPerSession] = useState<number | '∞'>(50);
  const [preFilter, setPreFilter] = useState<'off' | 'ru' | 'en'>('off');
  const [showCustomModal, setShowCustomModal] = useState<'new' | 'review' | null>(null);
  const [tempCustomValue, setTempCustomValue] = useState('');
  const [exercises, setExercises] = useState({
    reading: true,
    comprehension: true,
    dictation: false,
  });

  const NEW_OPTIONS: Array<number | 'custom'> = [3, 5, 7, 10, 15, 20, 'custom'];
  const REVIEW_OPTIONS: Array<number | '∞' | 'custom'> = [20, 50, 100, 150, 200, '∞', 'custom'];

  const handleCustomNew = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      setNewPerSession(num);
    }
    setShowCustomModal(null);
    setTempCustomValue('');
  };

  const handleCustomReview = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      setReviewsPerSession(num);
    }
    setShowCustomModal(null);
    setTempCustomValue('');
  };

  const resetToDefaults = () => {
    setNewPerSession(5);
    setReviewsPerSession(50);
    setPreFilter('off');
    setExercises({ reading: true, comprehension: true, dictation: false });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={COMMON_STYLES.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>◀</Text>
        </Pressable>
        <Text style={COMMON_STYLES.title}>Настройки</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabelFirst}>ТРЕНИРОВКА</Text>

        <Text style={styles.subsectionLabel}>Новых текстов за сессию</Text>
        <View style={styles.optionsGrid}>
          {NEW_OPTIONS.map((n) => {
            const isActive = n === 'custom' ? !NEW_OPTIONS.slice(0, -1).includes(newPerSession as number) : newPerSession === n;
            return (
              <Pressable
                key={n}
                style={[styles.optionUniform, isActive && styles.optionActive]}
                onPress={() => {
                  if (n === 'custom') {
                    setShowCustomModal('new');
                    setTempCustomValue('');
                  } else {
                    setNewPerSession(n);
                  }
                }}
              >
                <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                  {n === 'custom' ? (NEW_OPTIONS.slice(0, -1).includes(newPerSession as number) ? '...' : newPerSession) : n}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.subsectionLabel}>Повторений за сессию</Text>
        <View style={styles.optionsGrid}>
          {REVIEW_OPTIONS.map((n) => {
            const isActive = n === 'custom' ? (typeof reviewsPerSession === 'number' && !REVIEW_OPTIONS.slice(0, -1).includes(reviewsPerSession)) : reviewsPerSession === n;
            return (
              <Pressable
                key={n}
                style={[styles.optionUniform, isActive && styles.optionActive]}
                onPress={() => {
                  if (n === 'custom') {
                    setShowCustomModal('review');
                    setTempCustomValue('');
                  } else {
                    setReviewsPerSession(n);
                  }
                }}
              >
                <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                  {n === 'custom' ? (typeof reviewsPerSession === 'number' && !REVIEW_OPTIONS.slice(0, -1).includes(reviewsPerSession) ? reviewsPerSession : '...') : n}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.subsectionLabel}>Быстрый отбор</Text>
        <View style={styles.optionsRow}>
          <Pressable
            style={[styles.option, preFilter === 'off' && styles.optionActive]}
            onPress={() => setPreFilter('off')}
          >
            <Text style={[styles.optionText, preFilter === 'off' && styles.optionTextActive]}>Выкл</Text>
          </Pressable>
          <Pressable
            style={[styles.option, preFilter === 'ru' && styles.optionActive]}
            onPress={() => setPreFilter('ru')}
          >
            <Text style={[styles.optionText, preFilter === 'ru' && styles.optionTextActive]}>RU</Text>
          </Pressable>
          <Pressable
            style={[styles.option, preFilter === 'en' && styles.optionActive]}
            onPress={() => setPreFilter('en')}
          >
            <Text style={[styles.optionText, preFilter === 'en' && styles.optionTextActive]}>EN</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>УПРАЖНЕНИЯ</Text>
        <SettingRow
          label="Прослушивание"
          value={exercises.reading}
          onToggle={(v) => setExercises({ ...exercises, reading: v })}
        />
        <SettingRow
          label="Понимание на слух"
          value={exercises.comprehension}
          onToggle={(v) => setExercises({ ...exercises, comprehension: v })}
        />
        <SettingRow
          label="Диктант"
          value={exercises.dictation}
          onToggle={(v) => setExercises({ ...exercises, dictation: v })}
          isLast
        />

        <Text style={styles.sectionLabel}>ПРОИЗНОШЕНИЕ</Text>
        <SettingRow label="Диалект" value="US" isButton onPress={() => {}} />
        <SettingRow label="Скорость" value="1.0x" isButton onPress={() => {}} isLast />

        <Text style={styles.sectionLabel}>ДАННЫЕ</Text>
        <Pressable style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Экспорт прогресса</Text>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Импорт прогресса</Text>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Сбросить прогресс</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>СБРОС</Text>
        <Pressable style={styles.defaultBtn} onPress={resetToDefaults}>
          <Text style={styles.defaultBtnText}>Настроить по умолчанию</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={showCustomModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomModal(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCustomModal(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>
              {showCustomModal === 'new' ? 'Новых текстов за сессию' : 'Повторений за сессию'}
            </Text>
            <View style={styles.modalDisplay}>
              <Text style={styles.modalDisplayText}>{tempCustomValue || '0'}</Text>
            </View>
            <View style={styles.numpadContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '←', 0, '✓'].map((key, idx) => (
                <Pressable
                  key={idx}
                  style={styles.numpadKey}
                  onPress={() => {
                    if (key === '←') {
                      setTempCustomValue((prev) => prev.slice(0, -1));
                    } else if (key === '✓') {
                      if (showCustomModal === 'new') handleCustomNew(tempCustomValue);
                      else if (showCustomModal === 'review') handleCustomReview(tempCustomValue);
                    } else {
                      setTempCustomValue((prev) => prev + key);
                    }
                  }}
                >
                  <Text style={styles.numpadKeyText}>{key}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function SettingRow({
  label,
  value,
  isButton,
  onPress,
  onToggle,
  isLast
}: {
  label: string;
  value: boolean | string;
  isButton?: boolean;
  onPress?: () => void;
  onToggle?: (v: boolean) => void;
  isLast?: boolean;
}) {
  const [animation] = useState(new Animated.Value(typeof value === 'boolean' && value ? 1 : 0));

  const toggleSwitch = () => {
    const newValue = !(value as boolean);
    Animated.timing(animation, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    onToggle?.(newValue);
  };

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <View style={[styles.settingRow, isLast && styles.settingRowLast]}>
      <Text style={styles.settingLabel}>{label}</Text>
      {isButton ? (
        <Pressable onPress={onPress} style={styles.settingButton}>
          <Text style={styles.settingButtonText}>{value}</Text>
        </Pressable>
      ) : typeof value === 'boolean' ? (
        <Pressable
          style={[styles.toggle, value && styles.toggleActive]}
          onPress={toggleSwitch}
        >
          <Animated.View style={[styles.toggleThumb, { transform: [{ translateX }] }]} />
        </Pressable>
      ) : (
        <Text style={styles.settingValue}>{value}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.white },
  back: { paddingRight: SPACING.lg },
  backText: { fontSize: TYPOGRAPHY.size.xl, color: COLORS.black },

  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.xxxl },

  sectionLabelFirst: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.gray[400],
    letterSpacing: 1,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.lg,
  },

  sectionLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.gray[400],
    letterSpacing: 1,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginTop: SPACING.xxxl,
    marginBottom: SPACING.lg,
    paddingTop: SPACING.xl,
    borderTopWidth: 2,
    borderTopColor: COLORS.gray[100],
  },

  subsectionLabel: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.black,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  optionUniform: {
    width: 'calc(14.28% - 7px)' as any,
    minWidth: 45,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  option: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.black,
  },
  optionTextActive: {
    color: COLORS.white,
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray[100],
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingLabel: { fontSize: TYPOGRAPHY.size.base, color: COLORS.black },
  settingValue: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold, color: COLORS.gray[500] },
  settingButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.sm,
  },
  settingButtonText: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold, color: COLORS.black },

  toggle: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: COLORS.gray[200],
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.black,
  },
  toggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  actionBtn: {
    ...COMMON_STYLES.card,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionBtnText: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold, color: COLORS.black },

  defaultBtn: {
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  defaultBtnText: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.black,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: 300,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  modalDisplay: {
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  modalDisplayText: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.black,
  },
  numpadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  numpadKey: {
    width: 'calc(33.33% - 6px)' as any,
    aspectRatio: 1,
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadKeyText: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.black,
  },
});
