// Настройки тренировки — по moduleId. exercises: какие типы упражнений включены.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ModuleId, ExerciseType } from './types';

export interface TrainSettings {
  newPerSession: number;
  reviewsPerSession: number | '∞';
  repeatsToLearn: number;
  exercises: Record<string, boolean>; // ключи — типы упражнений модуля
}

const key = (m: ModuleId) => `@settings_${m}`;

export function defaultSettings(exerciseTypes: ExerciseType[], newDefault = 5): TrainSettings {
  const exercises: Record<string, boolean> = {};
  exerciseTypes.forEach((t) => (exercises[t] = true));
  return { newPerSession: newDefault, reviewsPerSession: 50, repeatsToLearn: 5, exercises };
}

export async function loadSettings(module: ModuleId, exerciseTypes: ExerciseType[], newDefault = 5): Promise<TrainSettings> {
  const def = defaultSettings(exerciseTypes, newDefault);
  try {
    const raw = await AsyncStorage.getItem(key(module));
    if (!raw) return def;
    const data = JSON.parse(raw);
    return {
      newPerSession: typeof data.newPerSession === 'number' ? data.newPerSession : def.newPerSession,
      reviewsPerSession: data.reviewsPerSession ?? def.reviewsPerSession,
      repeatsToLearn: typeof data.repeatsToLearn === 'number' ? data.repeatsToLearn : def.repeatsToLearn,
      exercises: { ...def.exercises, ...(data.exercises ?? {}) },
    };
  } catch {
    return def;
  }
}

export async function saveSettings(module: ModuleId, data: TrainSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(key(module), JSON.stringify(data));
  } catch (e) {
    console.error('saveSettings failed', e);
  }
}
