// Реестр модулей: единый конфиг, по которому общие экраны рисуют любой модуль.
import { Ionicons } from '@expo/vector-icons';
import { ModuleId, Collection, ExerciseType } from './types';
import { wordsData } from './data/words';
import { grammarData } from './data/grammar';
import { listeningData } from './data/listening';
import { readingData } from './data/reading';
import { writingData } from './data/writing';
import { speakingData } from './data/speaking';
import { pronunciationData } from './data/pronunciation';

export type CardKind = 'word' | 'rule' | 'audio' | 'text' | 'prompt' | 'dialog' | 'phrase';

// Единый акцентный градиент (тёмно-синий) для всех модулей
const BLUE: readonly [string, string] = ['#3B82F6', '#1E40AF'];

export interface ModuleConfig {
  id: ModuleId;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
  labels: { learned: string; studying: string; items: string; train: string; trainTitle: string };
  data: Collection[];
  cardKind: CardKind;
  exerciseTypes: ExerciseType[];
  hasImage: boolean;
  hasAudio: boolean;
  defaultNew: number; // разумный дефолт «новых за раз»
}

export const MODULES: Record<ModuleId, ModuleConfig> = {
  words: {
    id: 'words', title: 'Слова', icon: 'library', gradient: BLUE,
    labels: { learned: 'Выучено', studying: 'Изучается', items: 'Всего слов', train: 'Учить слова', trainTitle: 'Тренировка слов' },
    data: wordsData, cardKind: 'word', exerciseTypes: ['choose', 'assemble', 'type', 'sentence'], hasImage: true, hasAudio: true, defaultNew: 5,
  },
  grammar: {
    id: 'grammar', title: 'Грамматика', icon: 'construct', gradient: BLUE,
    labels: { learned: 'Выучено', studying: 'Изучается', items: 'Всего правил', train: 'Учить правила', trainTitle: 'Тренировка правил' },
    data: grammarData, cardKind: 'rule', exerciseTypes: ['fill', 'true_false', 'multiple_choice'], hasImage: false, hasAudio: false, defaultNew: 5,
  },
  listening: {
    id: 'listening', title: 'Аудирование', icon: 'headset', gradient: BLUE,
    labels: { learned: 'Пройдено', studying: 'Изучается', items: 'Всего аудио', train: 'Слушать', trainTitle: 'Тренировка аудирования' },
    data: listeningData, cardKind: 'audio', exerciseTypes: ['multiple_choice', 'true_false'], hasImage: false, hasAudio: true, defaultNew: 3,
  },
  reading: {
    id: 'reading', title: 'Чтение', icon: 'newspaper', gradient: BLUE,
    labels: { learned: 'Прочитано', studying: 'Изучается', items: 'Всего текстов', train: 'Читать', trainTitle: 'Тренировка чтения' },
    data: readingData, cardKind: 'text', exerciseTypes: ['multiple_choice', 'true_false'], hasImage: false, hasAudio: false, defaultNew: 3,
  },
  writing: {
    id: 'writing', title: 'Письмо', icon: 'create', gradient: BLUE,
    labels: { learned: 'Выполнено', studying: 'Изучается', items: 'Всего заданий', train: 'Писать', trainTitle: 'Тренировка письма' },
    data: writingData, cardKind: 'prompt', exerciseTypes: ['write'], hasImage: false, hasAudio: false, defaultNew: 2,
  },
  speaking: {
    id: 'speaking', title: 'Говорение', icon: 'chatbubbles', gradient: BLUE,
    labels: { learned: 'Пройдено', studying: 'Изучается', items: 'Всего тем', train: 'Говорить', trainTitle: 'Тренировка говорения' },
    data: speakingData, cardKind: 'dialog', exerciseTypes: ['respond'], hasImage: false, hasAudio: true, defaultNew: 2,
  },
  pronunciation: {
    id: 'pronunciation', title: 'Фонетика', icon: 'mic', gradient: BLUE,
    labels: { learned: 'Освоено', studying: 'Изучается', items: 'Всего фраз', train: 'Произносить', trainTitle: 'Тренировка произношения' },
    data: pronunciationData, cardKind: 'phrase', exerciseTypes: ['multiple_choice', 'type'], hasImage: false, hasAudio: true, defaultNew: 5,
  },
};

export const MODULE_ORDER: ModuleId[] = ['words', 'pronunciation', 'grammar', 'reading', 'writing', 'listening', 'speaking'];
export const MODULE_LIST = MODULE_ORDER.map((id) => MODULES[id]);
