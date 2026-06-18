// Статистика тренировок — по дням, ключи по moduleId.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ModuleId } from './types';

const statsKey = (m: ModuleId) => `@stats_${m}`;

export interface DayStat {
  reviews: number;
  added: number;
  learned: number;
  minutes: number;
}

export type StatsLog = Record<string, DayStat>;
export type Period = 'today' | 'week' | 'month' | 'all';

function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const EMPTY: DayStat = { reviews: 0, added: 0, learned: 0, minutes: 0 };

export async function loadStats(module: ModuleId): Promise<StatsLog> {
  try {
    const raw = await AsyncStorage.getItem(statsKey(module));
    return raw ? (JSON.parse(raw) as StatsLog) : {};
  } catch {
    return {};
  }
}

export async function clearStats(module: ModuleId): Promise<void> {
  try {
    await AsyncStorage.removeItem(statsKey(module));
  } catch (e) {
    console.error('clearStats failed', e);
  }
}

export async function addSession(module: ModuleId, s: Partial<DayStat>): Promise<void> {
  try {
    const log = await loadStats(module);
    const key = dayKey();
    const cur = log[key] ?? { ...EMPTY };
    log[key] = {
      reviews: cur.reviews + (s.reviews ?? 0),
      added: cur.added + (s.added ?? 0),
      learned: cur.learned + (s.learned ?? 0),
      minutes: cur.minutes + (s.minutes ?? 0),
    };
    await AsyncStorage.setItem(statsKey(module), JSON.stringify(log));
  } catch (e) {
    console.error('addSession failed', e);
  }
}

function periodDays(period: Period): number {
  switch (period) {
    case 'today': return 1;
    case 'week': return 7;
    case 'month': return 30;
    case 'all': return Infinity;
  }
}

export function aggregate(log: StatsLog, period: Period): DayStat {
  const days = periodDays(period);
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));

  const result: DayStat = { ...EMPTY };
  for (const [key, stat] of Object.entries(log)) {
    if (days !== Infinity) {
      const d = new Date(key + 'T00:00:00');
      if (d < cutoff) continue;
    }
    result.reviews += stat.reviews;
    result.added += stat.added;
    result.learned += stat.learned;
    result.minutes += stat.minutes;
  }
  return result;
}
