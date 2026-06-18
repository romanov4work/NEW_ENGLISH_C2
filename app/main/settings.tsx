import { useState, useEffect } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, RADIUS, FONT, COLORS, DARK } from '../../lib/theme';
import { ModuleId } from '../../lib/types';
import { MODULE_LIST, MODULE_ORDER, MODULES } from '../../lib/modules';
import { loadSettings, saveSettings, TrainSettings } from '../../lib/trainSettings';
import { clearAllProgress } from '../../lib/progress';
import { clearStats } from '../../lib/stats';
import { Dialect, RATES, Voice, getEnglishVoices, setSpeechSettings, loadSpeechSettings } from '../../lib/speech';

const NEW_OPTS: (number | '∞')[] = [3, 5, 10];
const REVIEW_OPTS: (number | '∞')[] = [20, 50, '∞'];
const REPEAT_OPTS: (number | '∞')[] = [3, 5, 7];
const EX_LABELS: Record<string, string> = {
  choose: 'Выбор перевода', multiple_choice: 'Тест (выбор)', assemble: 'Собери слово', type: 'Напиши слово',
  sentence: 'Составь предложение', fill: 'Вставь слово', true_false: 'Верно / неверно', write: 'Письмо', respond: 'Устный ответ',
};
type Field = 'newPerSession' | 'reviewsPerSession' | 'repeatsToLearn';

export default function Settings() {
  const router = useRouter();
  const [open, setOpen] = useState<ModuleId | null>(null);
  const [map, setMap] = useState<Partial<Record<ModuleId, TrainSettings>>>({});
  const [dialect, setDialect] = useState<Dialect>('us');
  const [rate, setRate] = useState(1.0);
  const [voiceId, setVoiceId] = useState<string | undefined>(undefined);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceModal, setVoiceModal] = useState(false);
  const [custom, setCustom] = useState<{ m: ModuleId; field: Field } | null>(null);
  const [customVal, setCustomVal] = useState('');

  useEffect(() => {
    (async () => {
      const entries = await Promise.all(MODULE_ORDER.map(async (m) => [m, await loadSettings(m, MODULES[m].exerciseTypes, MODULES[m].defaultNew)] as const));
      setMap(Object.fromEntries(entries) as Record<ModuleId, TrainSettings>);
      const s = await loadSpeechSettings();
      setDialect(s.dialect); setRate(s.rate); setVoiceId(s.voiceId);
      getEnglishVoices().then(setVoices).catch(() => {});
    })();
  }, []);

  const setS = (m: ModuleId, patch: Partial<TrainSettings>) => {
    setMap((prev) => { const next = { ...prev[m]!, ...patch }; saveSettings(m, next); return { ...prev, [m]: next }; });
  };
  const applyCustom = () => {
    const n = parseInt(customVal, 10);
    if (!isNaN(n) && n > 0 && custom) setS(custom.m, { [custom.field]: n } as Partial<TrainSettings>);
    setCustom(null); setCustomVal('');
  };
  const pickVoice = (id: string | undefined) => { setVoiceId(id); setSpeechSettings({ voiceId: id }); setVoiceModal(false); };
  const resetAll = () => {
    Alert.alert('Сбросить весь прогресс?', 'Прогресс и статистика по ВСЕМ модулям будут удалены. Необратимо.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Сбросить', style: 'destructive', onPress: async () => { for (const m of MODULE_ORDER) { await clearAllProgress(m); await clearStats(m); } } },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/main'))} style={styles.circleBtn}>
          <Ionicons name="arrow-back" size={20} color={DARK.text} />
        </Pressable>
        <Text style={styles.title}>Настройки</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>ТРЕНИРОВКА ПО МОДУЛЯМ</Text>
        {MODULE_LIST.map((cfg) => {
          const isOpen = open === cfg.id;
          const s = map[cfg.id];
          return (
            <View key={cfg.id} style={styles.acc}>
              <Pressable style={styles.accHeader} onPress={() => setOpen(isOpen ? null : cfg.id)}>
                <Ionicons name={cfg.icon} size={18} color={DARK.textDim} />
                <Text style={styles.accTitle}>{cfg.title}</Text>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={DARK.textMute} />
              </Pressable>
              {isOpen && s && (
                <View style={styles.accBody}>
                  <OptionRow label="Сколько новых учить за раз" value={s.newPerSession} presets={NEW_OPTS} onPick={(v) => setS(cfg.id, { newPerSession: v as number })} onCustom={() => { setCustom({ m: cfg.id, field: 'newPerSession' }); setCustomVal(''); }} />
                  <OptionRow label="Сколько повторять за раз" value={s.reviewsPerSession} presets={REVIEW_OPTS} onPick={(v) => setS(cfg.id, { reviewsPerSession: v as number | '∞' })} onCustom={() => { setCustom({ m: cfg.id, field: 'reviewsPerSession' }); setCustomVal(''); }} />
                  <OptionRow label="Сколько раз повторить, чтобы выучить" value={s.repeatsToLearn} presets={REPEAT_OPTS} onPick={(v) => setS(cfg.id, { repeatsToLearn: v as number })} onCustom={() => { setCustom({ m: cfg.id, field: 'repeatsToLearn' }); setCustomVal(''); }} />
                  <Text style={styles.sub}>Упражнения</Text>
                  {cfg.exerciseTypes.map((t, i) => (
                    <Toggle key={t} label={EX_LABELS[t] ?? t} value={s.exercises[t] !== false} onToggle={(v) => setS(cfg.id, { exercises: { ...s.exercises, [t]: v } })} last={i === cfg.exerciseTypes.length - 1} />
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <Text style={styles.section}>ОЗВУЧКА</Text>
        <View style={styles.block}>
          <Text style={styles.sub}>Диалект</Text>
          <View style={styles.chips}>
            <Chip label="US" active={dialect === 'us'} onPress={() => { setDialect('us'); setSpeechSettings({ dialect: 'us' }); }} />
            <Chip label="UK" active={dialect === 'uk'} onPress={() => { setDialect('uk'); setSpeechSettings({ dialect: 'uk' }); }} />
          </View>
          <Text style={styles.sub}>Скорость</Text>
          <View style={styles.chips}>{RATES.map((r) => <Chip key={r} label={`${r}x`} active={rate === r} onPress={() => { setRate(r); setSpeechSettings({ rate: r }); }} />)}</View>
          <Text style={styles.sub}>Голос</Text>
          <Pressable style={styles.voiceRow} onPress={() => setVoiceModal(true)}>
            <Text style={styles.voiceVal} numberOfLines={1}>{voiceId ? (voices.find((v) => v.identifier === voiceId)?.name ?? voiceId) : 'Системный по умолчанию'}</Text>
            <Text style={styles.chev}>▾</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>ДАННЫЕ</Text>
        <View style={styles.block}>
          <Pressable style={styles.danger} onPress={resetAll}><Text style={styles.dangerText}>Сбросить весь прогресс</Text></Pressable>
        </View>

        <Text style={styles.section}>О ПРИЛОЖЕНИИ</Text>
        <View style={styles.block}>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Версия</Text><Text style={styles.infoVal}>8.0.0</Text></View>
        </View>
      </ScrollView>

      {/* Модалка ввода своего значения */}
      <Modal visible={custom !== null} transparent animationType="fade" onRequestClose={() => setCustom(null)}>
        <Pressable style={styles.overlay} onPress={() => setCustom(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Своё значение</Text>
            <View style={styles.numDisplay}><Text style={styles.numDisplayText}>{customVal || '0'}</Text></View>
            <View style={styles.numpad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '←', 0, '✓'].map((k, idx) => (
                <Pressable key={idx} style={styles.numKey} onPress={() => {
                  if (k === '←') setCustomVal((p) => p.slice(0, -1));
                  else if (k === '✓') applyCustom();
                  else setCustomVal((p) => (p + k).slice(0, 4));
                }}>
                  <Text style={styles.numKeyText}>{k}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Модалка выбора голоса */}
      <Modal visible={voiceModal} transparent animationType="fade" onRequestClose={() => setVoiceModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setVoiceModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Выберите голос</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              <Pressable style={styles.vItem} onPress={() => pickVoice(undefined)}>
                <Text style={styles.vText}>Системный по умолчанию</Text>{!voiceId && <Text style={styles.vCheck}>✓</Text>}
              </Pressable>
              {voices.map((v) => (
                <Pressable key={v.identifier} style={styles.vItem} onPress={() => pickVoice(v.identifier)}>
                  <Text style={styles.vText} numberOfLines={1}>{(v.name || v.identifier)} · {v.language}</Text>
                  {voiceId === v.identifier && <Text style={styles.vCheck}>✓</Text>}
                </Pressable>
              ))}
              {voices.length === 0 && <Text style={styles.vEmpty}>Голоса не найдены на этом устройстве.</Text>}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function OptionRow({ label, value, presets, onPick, onCustom }: { label: string; value: number | string; presets: (number | '∞')[]; onPick: (v: number | '∞') => void; onCustom: () => void }) {
  const isCustom = typeof value === 'number' && !presets.includes(value);
  return (
    <>
      <Text style={styles.sub}>{label}</Text>
      <View style={styles.chips}>
        {presets.map((p) => <Chip key={String(p)} label={String(p)} active={value === p} onPress={() => onPick(p)} />)}
        <Chip label={isCustom ? String(value) : 'Своё'} active={isCustom} onPress={onCustom} />
      </View>
    </>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, active && styles.chipOn]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

function Toggle({ label, value, onToggle, last }: { label: string; value: boolean; onToggle: (v: boolean) => void; last?: boolean }) {
  return (
    <View style={[styles.toggleRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Pressable style={[styles.toggle, value && styles.toggleOn]} onPress={() => onToggle(!value)}>
        <View style={[styles.thumb, value && { alignSelf: 'flex-end' }]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DARK.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: DARK.card, borderWidth: 1, borderColor: DARK.border, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text, fontFamily: FONT.bold },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl },
  section: { fontSize: TYPOGRAPHY.size.xs, color: DARK.textMute, letterSpacing: 1, fontWeight: TYPOGRAPHY.weight.semibold, marginTop: SPACING.xl, marginBottom: SPACING.md },
  acc: { backgroundColor: DARK.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: DARK.border, marginBottom: SPACING.sm, overflow: 'hidden' },
  accHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg, paddingHorizontal: SPACING.lg },
  accTitle: { flex: 1, fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.semibold, color: DARK.text },
  accBody: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },
  sub: { fontSize: TYPOGRAPHY.size.sm, color: DARK.text, fontWeight: TYPOGRAPHY.weight.semibold, marginTop: SPACING.md, marginBottom: SPACING.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, backgroundColor: DARK.cardAlt, borderRadius: RADIUS.md, borderWidth: 2, borderColor: 'transparent' },
  chipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold, color: DARK.text },
  chipTextOn: { color: '#fff' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: DARK.border },
  toggleLabel: { fontSize: TYPOGRAPHY.size.base, color: DARK.text },
  toggle: { width: 51, height: 31, borderRadius: 16, backgroundColor: DARK.cardAlt, justifyContent: 'center', paddingHorizontal: 2 },
  toggleOn: { backgroundColor: COLORS.primary },
  thumb: { width: 27, height: 27, borderRadius: 14, backgroundColor: '#fff' },
  block: { backgroundColor: DARK.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: DARK.border, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  voiceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: DARK.cardAlt, borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  voiceVal: { flex: 1, fontSize: TYPOGRAPHY.size.base, color: DARK.text, fontWeight: TYPOGRAPHY.weight.semibold },
  chev: { fontSize: TYPOGRAPHY.size.lg, color: DARK.textMute, marginLeft: SPACING.sm },
  danger: { paddingVertical: 14, alignItems: 'center' },
  dangerText: { fontSize: TYPOGRAPHY.size.base, color: COLORS.error, fontWeight: TYPOGRAPHY.weight.semibold },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  infoLabel: { fontSize: TYPOGRAPHY.size.base, color: DARK.text },
  infoVal: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold, color: DARK.textDim },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl },
  modalCard: { backgroundColor: DARK.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: DARK.border, padding: SPACING.xl, width: '100%', maxWidth: 320 },
  modalTitle: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text, textAlign: 'center', marginBottom: SPACING.lg },
  numDisplay: { backgroundColor: DARK.cardAlt, borderRadius: RADIUS.md, paddingVertical: SPACING.lg, alignItems: 'center', marginBottom: SPACING.lg },
  numDisplayText: { fontSize: 24, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  numKey: { width: '30%', flexGrow: 1, aspectRatio: 1.6, backgroundColor: DARK.cardAlt, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  numKeyText: { fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.semibold, color: DARK.text },
  vItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: DARK.border },
  vText: { flex: 1, fontSize: TYPOGRAPHY.size.base, color: DARK.text },
  vCheck: { fontSize: TYPOGRAPHY.size.lg, color: DARK.text, marginLeft: SPACING.sm },
  vEmpty: { fontSize: TYPOGRAPHY.size.base, color: DARK.textMute, textAlign: 'center', paddingVertical: SPACING.lg },
});
