// Озвучка слов через системный синтезатор речи (expo-speech). Бесплатно, без API-ключа.
// Настройки (диалект/скорость/голос) хранятся глобально в AsyncStorage и применяются в speak().

import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Dialect = 'us' | 'uk';
export type Voice = Speech.Voice;

export interface SpeechSettings {
  dialect: Dialect;
  rate: number; // 0.75 | 1.0 | 1.25 | 1.5
  voiceId?: string; // identifier из getAvailableVoicesAsync(); undefined = системный по умолчанию
}

export const DEFAULT_SPEECH: SpeechSettings = { dialect: 'us', rate: 1.0 };
export const RATES = [0.75, 1.0, 1.25, 1.5] as const;

const KEY = '@speech_settings';

// Текущие настройки в памяти (speak() синхронный).
let current: SpeechSettings = { ...DEFAULT_SPEECH };

export async function loadSpeechSettings(): Promise<SpeechSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) current = { ...DEFAULT_SPEECH, ...JSON.parse(raw) };
  } catch {
    // дефолт
  }
  return current;
}

export async function setSpeechSettings(patch: Partial<SpeechSettings>): Promise<SpeechSettings> {
  current = { ...current, ...patch };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(current));
  } catch (e) {
    console.log('setSpeechSettings failed', e);
  }
  return current;
}

export function getSpeechSettings(): SpeechSettings {
  return current;
}

// Список доступных английских голосов устройства (Windows/Android/iOS/web — свои).
export async function getEnglishVoices(): Promise<Voice[]> {
  try {
    const all = await Speech.getAvailableVoicesAsync();
    return all.filter((v) => (v.language || '').toLowerCase().startsWith('en'));
  } catch {
    return [];
  }
}

// Подгружаем настройки при старте приложения.
loadSpeechSettings();

export function speak(text: string): void {
  try {
    Speech.stop();
    Speech.speak(text, {
      language: current.dialect === 'us' ? 'en-US' : 'en-GB',
      rate: current.rate,
      voice: current.voiceId,
    });
  } catch (e) {
    console.log('speak failed', e);
  }
}
