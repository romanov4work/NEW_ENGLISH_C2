import { Collection } from '../types';

export const wordsData: Collection[] = [
  {
    id: '1',
    title: 'Базовые слова A1-A2',
    active: true,
    cards: [
      {
        id: 'w1', front: 'hello', back: 'привет', status: 'new', ipa: '/heˈloʊ/', pos: 'межд.',
        examples: [{ en: 'Hello, how are you today?', ru: 'Привет, как ты сегодня?' }],
        exercises: [
          { type: 'choose', question: 'hello', options: ['привет', 'спасибо', 'пока', 'извините'], correctIndex: 0 },
          { type: 'assemble', targetWord: 'hello', translation: 'привет', letters: ['h', 'e', 'l', 'l', 'o', 'a', 'b'] },
          { type: 'type', targetWord: 'hello', translation: 'привет' },
          { type: 'sentence', targetWord: 'hello', translation: 'привет' },
        ],
      },
      {
        id: 'w2', front: 'water', back: 'вода', status: 'new', ipa: '/ˈwɔːtər/', pos: 'сущ.',
        examples: [{ en: 'I drink water every day.', ru: 'Я пью воду каждый день.' }],
        exercises: [
          { type: 'choose', question: 'water', options: ['вода', 'еда', 'огонь', 'воздух'], correctIndex: 0 },
          { type: 'assemble', targetWord: 'water', translation: 'вода', letters: ['w', 'a', 't', 'e', 'r', 'b', 'o'] },
          { type: 'type', targetWord: 'water', translation: 'вода' },
          { type: 'sentence', targetWord: 'water', translation: 'вода' },
        ],
      },
      {
        id: 'w3', front: 'friend', back: 'друг', status: 'new', ipa: '/frend/', pos: 'сущ.',
        examples: [{ en: 'She is my best friend.', ru: 'Она моя лучшая подруга.' }],
        exercises: [
          { type: 'choose', question: 'friend', options: ['друг', 'враг', 'сосед', 'коллега'], correctIndex: 0 },
          { type: 'assemble', targetWord: 'friend', translation: 'друг', letters: ['f', 'r', 'i', 'e', 'n', 'd', 'a', 'o'] },
          { type: 'type', targetWord: 'friend', translation: 'друг' },
          { type: 'sentence', targetWord: 'friend', translation: 'друг' },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Лексика B1-B2',
    active: false,
    cards: [
      {
        id: 'w4', front: 'achieve', back: 'достигать', status: 'new', ipa: '/əˈtʃiːv/', pos: 'глаг.',
        examples: [{ en: 'You can achieve your goals.', ru: 'Ты можешь достичь своих целей.' }],
        exercises: [
          { type: 'choose', question: 'achieve', options: ['достигать', 'терять', 'начинать', 'заканчивать'], correctIndex: 0 },
          { type: 'assemble', targetWord: 'achieve', translation: 'достигать', letters: ['a', 'c', 'h', 'i', 'e', 'v', 'e', 'b', 't'] },
          { type: 'type', targetWord: 'achieve', translation: 'достигать' },
          { type: 'sentence', targetWord: 'achieve', translation: 'достигать' },
        ],
      },
      {
        id: 'w5', front: 'improve', back: 'улучшать', status: 'new', ipa: '/ɪmˈpruːv/', pos: 'глаг.',
        examples: [{ en: 'I want to improve my English.', ru: 'Я хочу улучшить свой английский.' }],
        exercises: [
          { type: 'choose', question: 'improve', options: ['улучшать', 'ухудшать', 'ломать', 'чинить'], correctIndex: 0 },
          { type: 'assemble', targetWord: 'improve', translation: 'улучшать', letters: ['i', 'm', 'p', 'r', 'o', 'v', 'e', 'a', 't'] },
          { type: 'type', targetWord: 'improve', translation: 'улучшать' },
          { type: 'sentence', targetWord: 'improve', translation: 'улучшать' },
        ],
      },
    ],
  },
];
