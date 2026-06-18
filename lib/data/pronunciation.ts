import { Collection } from '../types';

export const pronunciationData: Collection[] = [
  {
    id: '1',
    title: 'Звуки и слова',
    active: true,
    cards: [
      {
        id: 'p1',
        front: 'think',
        back: 'думать',
        status: 'new',
        ipa: '/θɪŋk/',
        audioText: 'think',
        examples: [{ en: 'I think you are right.', ru: 'Думаю, ты прав.' }],
        exercises: [
          { type: 'multiple_choice', question: 'Как правильно произносится "think"?', options: ['/θɪŋk/', '/sɪŋk/', '/fɪŋk/', '/tɪŋk/'], correctIndex: 0 },
          { type: 'type', targetWord: 'think', translation: 'думать' },
        ],
      },
      {
        id: 'p2',
        front: 'world',
        back: 'мир',
        status: 'new',
        ipa: '/wɜːrld/',
        audioText: 'world',
        examples: [{ en: 'The world is big.', ru: 'Мир большой.' }],
        exercises: [
          { type: 'multiple_choice', question: 'Какая транскрипция у "world"?', options: ['/wɜːrld/', '/vɔːld/', '/wɔrd/', '/wʌld/'], correctIndex: 0 },
          { type: 'type', targetWord: 'world', translation: 'мир' },
        ],
      },
    ],
  },
];
