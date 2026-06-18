// Прогресс карточек — единый для всех модулей, ключи по moduleId.
// "Выучено" = repeatCount >= repeatsToLearn. SM-2 (lib/sm2.ts) планирует интервалы.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialSM2, applySM2 } from './sm2';
import { ModuleId, CardStatus, CardProgress, ProgressMap } from './types';

export type { CardStatus, CardProgress, ProgressMap };
export const DEFAULT_REPEATS_TO_LEARN = 5;

const progressKey = (m: ModuleId) => `@progress_${m}`;
const activeKey = (m: ModuleId) => `@active_${m}`;

export async function loadProgress(module: ModuleId): Promise<ProgressMap> {
  try {
    const raw = await AsyncStorage.getItem(progressKey(module));
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

export async function saveProgress(module: ModuleId, p: ProgressMap): Promise<void> {
  try {
    await AsyncStorage.setItem(progressKey(module), JSON.stringify(p));
  } catch (e) {
    console.error('saveProgress failed', e);
  }
}

export async function clearAllProgress(module: ModuleId): Promise<void> {
  try {
    await AsyncStorage.removeItem(progressKey(module));
  } catch (e) {
    console.error('clearAllProgress failed', e);
  }
}

function base(now: number): CardProgress {
  return { status: 'studying', sm2: initialSM2(now), repeatCount: 0, errorCount: 0, lastSeen: now };
}

function gradeStatus(repeatCount: number, repeatsToLearn: number): CardStatus {
  return repeatCount >= repeatsToLearn ? 'learned' : 'studying';
}

export function markLearned(p: ProgressMap, id: string, repeatsToLearn = DEFAULT_REPEATS_TO_LEARN): ProgressMap {
  const now = Date.now();
  return { ...p, [id]: { status: 'learned', sm2: initialSM2(now), repeatCount: repeatsToLearn, errorCount: 0, lastSeen: now } };
}

export function markStudying(p: ProgressMap, id: string): ProgressMap {
  const existing = p[id];
  if (existing && existing.status !== 'new') return p;
  const now = Date.now();
  return { ...p, [id]: base(now) };
}

export function applyReview(p: ProgressMap, id: string, quality: number, repeatsToLearn = DEFAULT_REPEATS_TO_LEARN): ProgressMap {
  const now = Date.now();
  const existing = p[id] ?? base(now);
  const sm2 = applySM2(existing.sm2, quality, now);
  const repeatCount = quality >= 3 ? existing.repeatCount + 1 : 0;
  return { ...p, [id]: { ...existing, sm2, status: gradeStatus(repeatCount, repeatsToLearn), repeatCount, lastSeen: now } };
}

export function recordExerciseResult(p: ProgressMap, id: string, success: boolean, repeatsToLearn = DEFAULT_REPEATS_TO_LEARN): ProgressMap {
  const now = Date.now();
  const existing = p[id] ?? base(now);
  const repeatCount = success ? existing.repeatCount + 1 : existing.repeatCount;
  const sm2 = { ...existing.sm2, dueDate: now };
  return {
    ...p,
    [id]: { ...existing, sm2, status: gradeStatus(repeatCount, repeatsToLearn), repeatCount, errorCount: existing.errorCount + (success ? 0 : 1), lastSeen: now },
  };
}

export function resetCardProgress(p: ProgressMap, id: string): ProgressMap {
  const next = { ...p };
  delete next[id];
  return next;
}

export function effectiveStatus(p: ProgressMap, id: string, seed: CardStatus): CardStatus {
  return p[id]?.status ?? seed;
}

// --- Активные коллекции ---
export async function loadActiveCollections(module: ModuleId, defaultIds: string[]): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(activeKey(module));
    return raw ? (JSON.parse(raw) as string[]) : defaultIds;
  } catch {
    return defaultIds;
  }
}

export async function saveActiveCollections(module: ModuleId, ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(activeKey(module), JSON.stringify(ids));
  } catch (e) {
    console.error('saveActiveCollections failed', e);
  }
}
