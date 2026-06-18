import { useState, useEffect, useRef, useCallback } from 'react';
import { Animated, GestureResponderEvent, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle, Line as SvgLine, Text as SvgText } from 'react-native-svg';
import { TYPOGRAPHY, SPACING, RADIUS, FONT, DARK, GRADIENTS, STAT_COLORS } from '../lib/theme';
import { ModuleId, CardStatus } from '../lib/types';
import { MODULES } from '../lib/modules';
import { loadProgress, effectiveStatus, ProgressMap } from '../lib/progress';
import { StatsLog, Period, DayStat, aggregate, loadStats } from '../lib/stats';

const TABS = ['Сегодня', 'Неделя', 'Месяц', 'Всё время'] as const;
type Tab = (typeof TABS)[number];
const TAB_PERIOD: Record<Tab, Period> = { 'Сегодня': 'today', 'Неделя': 'week', 'Месяц': 'month', 'Всё время': 'all' };
const WD = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MN = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

type Pt = { label: string; date: string; reviews: number; added: number; learned: number; minutes: number };
const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmt = (n: number) => n.toLocaleString('ru-RU');

function useCountUp(target: number, duration = 650, delay = 350): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const tick = () => {
      if (!start) start = Date.now();
      const t = Math.min(1, (Date.now() - start) / duration);
      setVal(Math.round(target * (t * (2 - t))));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setVal(target);
    };
    const to = setTimeout(() => { raf = requestAnimationFrame(tick); }, delay);
    return () => { clearTimeout(to); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return val;
}

function buildSeries(log: StatsLog, period: Period): Pt[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mk = (d: Date, label: string): Pt => {
    const s = log[dayKey(d)];
    return {
      label,
      date: `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`,
      reviews: s?.reviews ?? 0, added: s?.added ?? 0, learned: s?.learned ?? 0, minutes: s?.minutes ?? 0,
    };
  };
  if (period === 'today') {
    const y = new Date(today); y.setDate(today.getDate() - 1);
    return [mk(y, 'Вчера'), mk(today, 'Сегодня')];
  }
  if (period === 'week') {
    const arr: Pt[] = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i); arr.push(mk(d, WD[d.getDay()])); }
    return arr;
  }
  if (period === 'month') {
    const arr: Pt[] = [];
    for (let i = 29; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i); arr.push(mk(d, `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`)); }
    return arr;
  }
  const arr: Pt[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    let r = 0, a = 0, l = 0, m = 0;
    for (const [k, s] of Object.entries(log)) {
      const dd = new Date(k + 'T00:00:00');
      if (dd.getFullYear() === d.getFullYear() && dd.getMonth() === d.getMonth()) { r += s.reviews; a += s.added; l += s.learned; m += s.minutes; }
    }
    arr.push({ label: MN[d.getMonth()], date: `${MN[d.getMonth()]} ${d.getFullYear()}`, reviews: r, added: a, learned: l, minutes: m });
  }
  return arr;
}

export function ModuleHome({ module }: { module: ModuleId }) {
  const router = useRouter();
  const cfg = MODULES[module];
  const [tab, setTab] = useState<Tab>('Сегодня');
  const [progress, setProgress] = useState<ProgressMap>({});
  const [statsLog, setStatsLog] = useState<StatsLog>({});
  const [sel, setSel] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [pr, log] = await Promise.all([loadProgress(module), loadStats(module)]);
    setProgress(pr);
    setStatsLog(log);
  }, [module]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));
  const onRefresh = useCallback(async () => { setRefreshing(true); await loadData(); setRefreshing(false); }, [loadData]);

  const allCards = cfg.data.flatMap((c) => c.cards);
  const learned = allCards.filter((c) => effectiveStatus(progress, c.id, (c.status ?? 'new') as CardStatus) === 'learned').length;
  const studying = allCards.filter((c) => effectiveStatus(progress, c.id, (c.status ?? 'new') as CardStatus) === 'studying').length;
  const total = allCards.length;

  const agg: DayStat = aggregate(statsLog, TAB_PERIOD[tab]);
  const series = buildSeries(statsLog, TAB_PERIOD[tab]);

  const go = (p: string) => router.push(`/${module}/${p}` as never);
  const changeTab = (t: Tab) => { setTab(t); setSel(null); };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={({ pressed }) => [styles.circleBtn, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={20} color={DARK.text} />
        </Pressable>
        <View style={styles.titleRow}>
          <Ionicons name={cfg.icon} size={20} color={DARK.text} />
          <Text style={styles.title}>{cfg.title}</Text>
        </View>
        <Pressable onPress={() => router.push('/main/settings')} style={({ pressed }) => [styles.circleBtn, pressed && styles.pressed]}>
          <Ionicons name="settings-outline" size={18} color={DARK.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DARK.textDim} colors={['#7C3AED']} progressBackgroundColor={DARK.card} />}
      >
        <Pressable onPress={() => setSel(null)}>
          <View style={styles.chipsRow}>
            <Chip icon="checkmark-circle" colors={GRADIENTS.cta} value={learned} label={cfg.labels.learned} onPress={() => go('vocabulary')} />
            <Chip icon="time" colors={GRADIENTS.cta} value={studying} label={cfg.labels.studying} onPress={() => go('studying')} />
            <Chip icon="albums" colors={GRADIENTS.cta} value={total} label={cfg.labels.items} onPress={() => go('collections')} />
          </View>

          <BlurView intensity={24} tint="dark" style={styles.panel}>
            <Tabs active={tab} onChange={changeTab} gradient={cfg.gradient} />
            <View style={styles.legend}>
              <LegendItem color={STAT_COLORS.reviews} label="Повторения" />
              <LegendItem color={STAT_COLORS.added} label="Добавлено" />
              <LegendItem color={STAT_COLORS.learned} label="Выучено" />
              <LegendItem color={STAT_COLORS.minutes} label="Время" />
            </View>
            <StatChart series={series} sel={sel} setSel={setSel} period={TAB_PERIOD[tab]} />
            <View style={styles.metricsGrid}>
              <Metric label="Повторений" value={agg.reviews} color={STAT_COLORS.reviews} />
              <Metric label="Добавлено" value={agg.added} color={STAT_COLORS.added} />
              <Metric label="Выучено" value={agg.learned} color={STAT_COLORS.learned} />
              <Metric label="Время (мин)" value={agg.minutes} color={STAT_COLORS.minutes} />
            </View>
          </BlurView>
        </Pressable>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable onPress={() => go('train')} style={({ pressed }) => pressed && styles.pressed}>
          <LinearGradient colors={cfg.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={styles.ctaText}>{cfg.labels.train}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function Chip({ icon, colors, value, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; colors: readonly [string, string]; value: number; label: string; onPress: () => void }) {
  const v = value;
  return (
    <Pressable style={({ pressed }) => [styles.chip, pressed && styles.pressed]} onPress={onPress}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.chipIcon}>
        <Ionicons name={icon} size={20} color="#fff" />
      </LinearGradient>
      <Text style={styles.chipValue}>{fmt(v)}</Text>
      <Text style={styles.chipLabel} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  const v = value;
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{fmt(v)}</Text>
    </View>
  );
}

function Tabs({ active, onChange, gradient }: { active: Tab; onChange: (t: Tab) => void; gradient: readonly [string, string] }) {
  const [w, setW] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const initialized = useRef(false);
  const pad = 4;
  const idx = TABS.indexOf(active);
  const pillW = w > 0 ? (w - pad * 2) / TABS.length : 0;

  useEffect(() => {
    if (pillW <= 0) return;
    const target = pad + idx * pillW;
    if (!initialized.current) { x.setValue(target); initialized.current = true; }
    else Animated.timing(x, { toValue: target, duration: 180, useNativeDriver: true }).start();
  }, [idx, pillW, x]);

  return (
    <View style={styles.tabs} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <Animated.View style={[styles.tabPill, { width: pillW, transform: [{ translateX: x }] }]}>
          <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
      {TABS.map((t) => (
        <Pressable key={t} style={styles.tab} onPress={() => onChange(t)}>
          <Text style={[styles.tabText, t === active && styles.tabActiveText]}>{t}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i], p1 = pts[i + 1];
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHART_H = 210;

function StatChart({ series, sel, setSel, period }: { series: Pt[]; sel: number | null; setSel: (n: number | null) => void; period: Period }) {
  const [w, setW] = useState(0);
  const tip = useRef(new Animated.Value(0)).current;
  const draw = useRef(new Animated.Value(0)).current;

  useEffect(() => { Animated.timing(tip, { toValue: sel !== null ? 1 : 0, duration: 150, useNativeDriver: true }).start(); }, [sel, tip]);
  useEffect(() => { draw.setValue(0); Animated.timing(draw, { toValue: 1, duration: 700, useNativeDriver: false }).start(); }, [period, draw]);

  const n = series.length;
  const left = 6;
  const right = Math.max(left + 1, w - 6);
  const top = 16;
  const bottom = CHART_H - 28;
  const maxVal = Math.max(4, ...series.map((p) => Math.max(p.reviews, p.added, p.learned, p.minutes)));
  const niceMax = Math.ceil(maxVal / 4) * 4;
  const xAt = (i: number) => (n <= 1 ? (left + right) / 2 : left + (i * (right - left)) / (n - 1));
  const yAt = (v: number) => bottom - (v / niceMax) * (bottom - top);
  const rPts = series.map((p, i) => ({ x: xAt(i), y: yAt(p.reviews) }));
  const aPts = series.map((p, i) => ({ x: xAt(i), y: yAt(p.added) }));
  const lPts = series.map((p, i) => ({ x: xAt(i), y: yAt(p.learned) }));
  const mPts = series.map((p, i) => ({ x: xAt(i), y: yAt(p.minutes) }));
  const lineLen = (pts: { x: number; y: number }[]) => { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return Math.max(1, s) * 1.12; };
  const rLen = lineLen(rPts), aLen = lineLen(aPts), lLen = lineLen(lPts), mLen = lineLen(mPts);
  const off = (len: number) => draw.interpolate({ inputRange: [0, 1], outputRange: [len, 0] });

  const onTouch = (e: GestureResponderEvent) => {
    if (n === 0) return;
    const frac = (e.nativeEvent.locationX - left) / (right - left);
    setSel(Math.max(0, Math.min(n - 1, Math.round(frac * (n - 1)))));
  };

  const grids = [0, 0.25, 0.5, 0.75, 1];
  const labelEvery = n > 12 ? Math.ceil(n / 6) : 1;
  const tipW = 150;
  const tipLeft = sel !== null ? Math.max(0, Math.min(w - tipW, xAt(sel) - tipW / 2)) : 0;

  return (
    <View style={styles.chartWrap} onLayout={(e) => setW(e.nativeEvent.layout.width)} onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true} onResponderGrant={onTouch} onResponderMove={onTouch}>
      {w > 0 && (
        <Svg width={w} height={CHART_H}>
          {grids.map((g, i) => { const y = top + g * (bottom - top); return <SvgLine key={`g${i}`} x1={left} y1={y} x2={right} y2={y} stroke={DARK.border} strokeWidth={1} />; })}
          {n >= 2 && <AnimatedPath d={smoothPath(mPts)} stroke={STAT_COLORS.minutes} strokeWidth={2.5} fill="none" strokeDasharray={[mLen, mLen]} strokeDashoffset={off(mLen) as any} />}
          {n >= 2 && <AnimatedPath d={smoothPath(lPts)} stroke={STAT_COLORS.learned} strokeWidth={2.5} fill="none" strokeDasharray={[lLen, lLen]} strokeDashoffset={off(lLen) as any} />}
          {n >= 2 && <AnimatedPath d={smoothPath(aPts)} stroke={STAT_COLORS.added} strokeWidth={2.5} fill="none" strokeDasharray={[aLen, aLen]} strokeDashoffset={off(aLen) as any} />}
          {n >= 2 && <AnimatedPath d={smoothPath(rPts)} stroke={STAT_COLORS.reviews} strokeWidth={2.5} fill="none" strokeDasharray={[rLen, rLen]} strokeDashoffset={off(rLen) as any} />}
          {n <= 8 && mPts.map((p, i) => <Circle key={`md${i}`} cx={p.x} cy={p.y} r={2.5} fill={STAT_COLORS.minutes} />)}
          {n <= 8 && lPts.map((p, i) => <Circle key={`ld${i}`} cx={p.x} cy={p.y} r={2.5} fill={STAT_COLORS.learned} />)}
          {n <= 8 && rPts.map((p, i) => <Circle key={`rd${i}`} cx={p.x} cy={p.y} r={2.5} fill={STAT_COLORS.reviews} />)}
          {n <= 8 && aPts.map((p, i) => <Circle key={`ad${i}`} cx={p.x} cy={p.y} r={2.5} fill={STAT_COLORS.added} />)}
          {sel !== null && (
            <>
              <SvgLine x1={xAt(sel)} y1={top} x2={xAt(sel)} y2={bottom} stroke={DARK.textMute} strokeWidth={1} strokeDasharray="3 3" />
              <Circle cx={xAt(sel)} cy={yAt(series[sel].minutes)} r={5} fill={STAT_COLORS.minutes} stroke={DARK.bg} strokeWidth={2} />
              <Circle cx={xAt(sel)} cy={yAt(series[sel].learned)} r={5} fill={STAT_COLORS.learned} stroke={DARK.bg} strokeWidth={2} />
              <Circle cx={xAt(sel)} cy={yAt(series[sel].reviews)} r={5} fill={STAT_COLORS.reviews} stroke={DARK.bg} strokeWidth={2} />
              <Circle cx={xAt(sel)} cy={yAt(series[sel].added)} r={5} fill={STAT_COLORS.added} stroke={DARK.bg} strokeWidth={2} />
            </>
          )}
          {series.map((p, i) => (i % labelEvery === 0 || i === n - 1 ? <SvgText key={`xl${i}`} x={xAt(i)} y={CHART_H - 8} fontSize="10" fill={DARK.textMute} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>{p.label}</SvgText> : null))}
        </Svg>
      )}
      {sel !== null && (
        <Animated.View style={[styles.tip, { left: tipLeft, width: tipW, opacity: tip, transform: [{ scale: tip.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}>
          <Text style={styles.tipDate}>{series[sel].date}</Text>
          <Text style={[styles.tipRow, { color: STAT_COLORS.reviews }]}>Повторения: {series[sel].reviews}</Text>
          <Text style={[styles.tipRow, { color: STAT_COLORS.added }]}>Добавлено: {series[sel].added}</Text>
          <Text style={[styles.tipRow, { color: STAT_COLORS.learned }]}>Выучено: {series[sel].learned}</Text>
          <Text style={[styles.tipRow, { color: STAT_COLORS.minutes }]}>Время: {series[sel].minutes} мин</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DARK.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: DARK.card, borderWidth: 1, borderColor: DARK.border, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  title: { fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text, fontFamily: FONT.bold },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  content: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: 150 },
  chipsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  chip: { flex: 1, backgroundColor: DARK.card, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: DARK.border, paddingVertical: SPACING.lg, alignItems: 'center' },
  chipIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  chipValue: { fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text, fontFamily: FONT.bold },
  chipLabel: { fontSize: TYPOGRAPHY.size.sm, color: DARK.textDim, marginTop: 2 },
  panel: { backgroundColor: 'rgba(18,20,31,0.55)', borderRadius: RADIUS.xl, borderWidth: 1, borderColor: DARK.border, padding: SPACING.lg, overflow: 'hidden' },
  tabs: { flexDirection: 'row', backgroundColor: DARK.cardAlt, borderRadius: RADIUS.lg, padding: 4, marginBottom: SPACING.lg },
  tabPill: { position: 'absolute', top: 4, bottom: 4, borderRadius: RADIUS.md, overflow: 'hidden' },
  tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.md },
  tabText: { fontSize: TYPOGRAPHY.size.sm, color: DARK.textDim, fontWeight: TYPOGRAPHY.weight.semibold },
  tabActiveText: { color: '#fff', fontWeight: TYPOGRAPHY.weight.bold },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.md, marginBottom: SPACING.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: TYPOGRAPHY.size.sm, color: DARK.textDim },
  chartWrap: { height: CHART_H, marginBottom: SPACING.lg },
  tip: { position: 'absolute', top: 0, backgroundColor: DARK.cardAlt, borderWidth: 1, borderColor: DARK.border, borderRadius: RADIUS.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
  tipDate: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.bold, color: DARK.text, marginBottom: 4 },
  tipRow: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold, marginTop: 1 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  metric: { width: '48%', flexGrow: 1, backgroundColor: DARK.cardAlt, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg, paddingHorizontal: SPACING.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricLabel: { fontSize: TYPOGRAPHY.size.sm, color: DARK.textDim },
  metricValue: { fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.bold, fontFamily: FONT.bold },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl, paddingTop: SPACING.md, backgroundColor: DARK.bg },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: 18, borderRadius: 30 },
  ctaText: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, color: '#fff', fontFamily: FONT.bold },
});
