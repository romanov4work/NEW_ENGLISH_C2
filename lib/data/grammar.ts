import { Collection } from '../types';

export const grammarData: Collection[] = [
  {
    id: '1',
    title: 'Времена глаголов',
    active: true,
    cards: [
      {
        id: 'g1',
        front: 'Present Simple',
        back: 'Простое настоящее время',
        status: 'new',
        theory:
          'Present Simple используется для регулярных действий, привычек и фактов. ' +
          'В 3-м лице ед. ч. (he/she/it) к глаголу добавляется -s/-es.',
        examples: [
          { en: 'He goes to school every day.', ru: 'Он ходит в школу каждый день.' },
          { en: 'Water boils at 100°C.', ru: 'Вода кипит при 100°C.' },
        ],
        exercises: [
          { type: 'fill', question: 'Вставьте глагол в нужной форме', sentence: 'She ___ (drink) tea every morning.', answer: 'drinks' },
          { type: 'true_false', statement: 'Present Simple используется для привычных, повторяющихся действий.', answer: true },
          { type: 'multiple_choice', question: 'Выберите верную форму: He ___ to school.', options: ['goes', 'go', 'going', 'gone'], correctIndex: 0 },
        ],
      },
      {
        id: 'g2',
        front: 'Past Simple',
        back: 'Простое прошедшее время',
        status: 'new',
        theory:
          'Past Simple описывает завершённые действия в прошлом. Правильные глаголы получают -ed, ' +
          'неправильные имеют особые формы (go → went).',
        examples: [{ en: 'She read a book yesterday.', ru: 'Вчера она прочитала книгу.' }],
        exercises: [
          { type: 'fill', question: 'Вставьте глагол в Past Simple', sentence: 'They ___ (go) to the cinema last night.', answer: 'went' },
          { type: 'true_false', statement: 'Все глаголы в Past Simple получают окончание -ed.', answer: false },
          { type: 'multiple_choice', question: 'Выберите верную форму: I ___ a letter yesterday.', options: ['wrote', 'write', 'written', 'writing'], correctIndex: 0 },
        ],
      },
      {
        id: 'g3',
        front: 'Present Perfect',
        back: 'Настоящее совершенное время',
        status: 'new',
        theory:
          'Present Perfect (have/has + V3) связывает прошлое с настоящим: результат важен сейчас, ' +
          'или действие началось в прошлом и продолжается.',
        examples: [{ en: 'I have seen this movie before.', ru: 'Я уже видел этот фильм.' }],
        exercises: [
          { type: 'fill', question: 'Вставьте глагол в Present Perfect', sentence: 'I ___ (finish) my homework already.', answer: 'have finished' },
          { type: 'true_false', statement: 'Present Perfect образуется с помощью have/has + 3-я форма глагола.', answer: true },
          { type: 'multiple_choice', question: 'Выберите верную форму: She ___ just arrived.', options: ['has', 'have', 'is', 'was'], correctIndex: 0 },
        ],
      },
    ],
  },
];
