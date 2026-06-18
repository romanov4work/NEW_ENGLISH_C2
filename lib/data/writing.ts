import { Collection } from '../types';

export const writingData: Collection[] = [
  {
    id: '1',
    title: 'Письмо A2-B1',
    active: true,
    cards: [
      {
        id: 'wr1',
        front: 'Invitation Email',
        back: 'Письмо-приглашение',
        status: 'new',
        prompt: 'Напишите короткое письмо другу: пригласите его на свой день рождения (2–3 предложения на английском).',
        exercises: [{ type: 'write', prompt: 'Write a short email inviting a friend to your birthday party.' }],
      },
      {
        id: 'wr2',
        front: 'My Day',
        back: 'Мой день',
        status: 'new',
        prompt: 'Опишите свой обычный день: что вы делаете утром, днём и вечером (3–4 предложения).',
        exercises: [{ type: 'write', prompt: 'Describe your typical day in 3-4 sentences in English.' }],
      },
    ],
  },
];
