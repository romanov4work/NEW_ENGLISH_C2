import { Collection } from '../types';

export const readingData: Collection[] = [
  {
    id: '1',
    title: 'Тексты A2-B1',
    active: true,
    cards: [
      {
        id: 'r1',
        front: 'A Morning Walk',
        back: 'Утренняя прогулка',
        status: 'new',
        text:
          'Every morning Tom walks in the park near his house. He likes to watch the birds and breathe ' +
          'the fresh air. After the walk he feels energetic and ready for work. It is his favourite habit.',
        exercises: [
          { type: 'multiple_choice', question: 'What is the main idea of the text?', options: ['Tom enjoys his morning walks', 'Tom hates mornings', 'Tom works in a park', 'Tom has no free time'], correctIndex: 0 },
          { type: 'true_false', statement: 'After the walk Tom feels tired.', answer: false },
        ],
      },
      {
        id: 'r2',
        front: 'Healthy Habits',
        back: 'Здоровые привычки',
        status: 'new',
        text:
          'Drinking enough water is important for your health. Doctors say adults should drink about two ' +
          'litres a day. Water helps the body work well and keeps the skin healthy.',
        exercises: [
          { type: 'multiple_choice', question: 'How much water should adults drink per day?', options: ['About two litres', 'One glass', 'Five litres', 'No water'], correctIndex: 0 },
          { type: 'true_false', statement: 'Water keeps the skin healthy.', answer: true },
        ],
      },
    ],
  },
];
