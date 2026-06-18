// Единые типы данных для всех модулей.
// BaseCard — общий минимум (front/back/status/exercises) + опциональные поля под тип модуля.
// Прогресс и SM-2 работают по BaseCard одинаково у всех модулей.

import { SM2State } from './sm2';
export type { SM2State };

export type ModuleId = 'words' | 'grammar' | 'listening' | 'reading' | 'writing' | 'speaking' | 'pronunciation';
export type CardStatus = 'new' | 'studying' | 'learned';

export interface Example {
  en: string;
  ru: string;
}

// Упражнения (общий union). Каждое отдаёт движку correct: boolean.
export type Exercise =
  | { type: 'choose'; question: string; options: string[]; correctIndex: number }
  | { type: 'multiple_choice'; question: string; options: string[]; correctIndex: number }
  | { type: 'assemble'; targetWord: string; translation: string; letters: string[] }
  | { type: 'type'; targetWord: string; translation: string }
  | { type: 'sentence'; targetWord: string; translation: string }
  | { type: 'fill'; question: string; sentence: string; answer: string }
  | { type: 'true_false'; statement: string; answer: boolean }
  | { type: 'write'; prompt: string }
  | { type: 'respond'; prompt: string; sample?: string };

export type ExerciseType = Exercise['type'];

export interface BaseCard {
  id: string;
  front: string; // слово / название правила / заголовок аудио|текста / фраза / тема диалога / заголовок задания
  back: string;  // перевод / краткая теория / краткое описание
  status?: CardStatus | string; // стартовое значение из JSON
  // опциональные поля под тип модуля
  ipa?: string;
  pos?: string;
  examples?: Example[];
  theory?: string;       // grammar
  transcript?: string;   // listening
  audioText?: string;    // listening/pronunciation — что озвучивать через TTS
  text?: string;         // reading — полный текст
  prompt?: string;       // writing/speaking
  dialog?: { speaker: string; line: string }[]; // speaking
  exercises?: Exercise[];
}

export interface Collection {
  id: string;
  title: string;
  active: boolean;
  cards: BaseCard[];
  learned?: number;
  total?: number;
}

export interface CardProgress {
  status: CardStatus;
  sm2: SM2State;
  repeatCount: number;
  errorCount: number;
  lastSeen: number;
}

export type ProgressMap = Record<string, CardProgress>;
