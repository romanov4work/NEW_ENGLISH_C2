import { Collection } from '../types';

export const listeningData: Collection[] = [
  {
    id: '1',
    title: 'Диалоги A1-A2',
    active: true,
    cards: [
      {
        id: 'l1',
        front: 'At the Cafe',
        back: 'В кафе',
        status: 'new',
        transcript: 'A: Hi, can I have a coffee, please? B: Sure, small or large? A: Large, please. B: That will be three dollars.',
        audioText: 'Hi, can I have a coffee, please? Sure, small or large? Large, please. That will be three dollars.',
        exercises: [
          { type: 'multiple_choice', question: 'What did the customer order?', options: ['Coffee', 'Tea', 'Juice', 'Water'], correctIndex: 0 },
          { type: 'multiple_choice', question: 'How much was it?', options: ['Three dollars', 'Two dollars', 'Five dollars', 'Ten dollars'], correctIndex: 0 },
        ],
      },
      {
        id: 'l2',
        front: 'Asking Directions',
        back: 'Спросить дорогу',
        status: 'new',
        transcript: 'A: Excuse me, where is the station? B: Go straight and turn left. It is next to the bank.',
        audioText: 'Excuse me, where is the station? Go straight and turn left. It is next to the bank.',
        exercises: [
          { type: 'multiple_choice', question: 'What place are they looking for?', options: ['The station', 'The bank', 'The cafe', 'The school'], correctIndex: 0 },
          { type: 'true_false', statement: 'The station is next to the bank.', answer: true },
        ],
      },
    ],
  },
];
