import { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '../../lib/theme';

export default function Settings() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [dialect, setDialect] = useState('US');
  const [speed, setSpeed] = useState('1.0x');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveSettings();
    }
  }, [dialect, speed]);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('@main_settings');
      if (stored) {
        const data = JSON.parse(stored);
        setDialect(data.dialect ?? 'US');
        setSpeed(data.speed ?? '1.0x');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    setIsLoaded(true);
  };

  const saveSettings = async () => {
    try {
      const data = { dialect, speed };
      await AsyncStorage.setItem('@main_settings', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/main');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      router.replace('/main');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={COMMON_STYLES.header}>
        <Pressable onPress={handleBack} style={styles.back}>
          <Text style={styles.backText}>◀</Text>
        </Pressable>
        <Text style={COMMON_STYLES.title}>Общие настройки</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Произношение */}
        <Text style={styles.sectionLabel}>ПРОИЗНОШЕНИЕ</Text>
        <View style={styles.infoCard}>
          <SettingRow label="Диалект" value="US" isButton onPress={() => {}} />
          <SettingRow label="Скорость" value="1.0x" isButton onPress={() => {}} isLast />
        </View>

        {/* Данные */}
        <Text style={styles.sectionLabel}>ДАННЫЕ</Text>
        <Pressable style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Экспорт прогресса</Text>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Импорт прогресса</Text>
        </Pressable>

        {/* О приложении */}
        <Text style={styles.sectionLabel}>О ПРИЛОЖЕНИИ</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Версия" value="8.0.0" />
          <InfoRow label="Разработчик" value="Victor Romanov" isLast />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  label,
  value,
  isButton,
  onPress,
  isLast
}: {
  label: string;
  value: string;
  isButton?: boolean;
  onPress?: () => void;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.settingRow, isLast && styles.settingRowLast]}>
      <Text style={styles.settingLabel}>{label}</Text>
      {isButton ? (
        <Pressable onPress={onPress} style={styles.settingButton}>
          <Text style={styles.settingButtonText}>{value}</Text>
        </Pressable>
      ) : (
        <Text style={styles.settingValue}>{value}</Text>
      )}
    </View>
  );
}

function InfoRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.white },
  back: { paddingRight: SPACING.lg },
  backText: { fontSize: TYPOGRAPHY.size.xl, color: COLORS.black },

  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.xxxl },

  sectionLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.gray[400],
    letterSpacing: 1,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.lg,
    marginTop: SPACING.xl,
  },

  actionBtn: {
    ...COMMON_STYLES.card,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionBtnText: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold, color: COLORS.black },

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
    borderRadius: 8,
  },
  settingButtonText: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold, color: COLORS.black },

  infoCard: {
    ...COMMON_STYLES.card,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray[100],
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: { fontSize: TYPOGRAPHY.size.base, color: COLORS.black },
  infoValue: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold, color: COLORS.gray[600] },
});
