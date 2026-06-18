import { Collection } from '../types';

export const speakingData: Collection[] = [
  {
    id: '1',
    title: 'Говорение A2-B1',
    active: true,
    cards: [
      {
        id: 's1',
        front: 'Introduce Yourself',
        back: 'Представьтесь',
        status: 'new',
        prompt: 'Расскажите о себе: имя, чем занимаетесь, ваши хобби.',
        dialog: [
          { speaker: 'Q', line: 'Tell me about yourself.' },
          { speaker: 'A', line: 'My name is Anna. I am a student and I love reading.' },
        ],
        exercises: [{ type: 'respond', prompt: 'Respond in English: "Tell me about yourself."', sample: 'My name is Anna. I am a student and I enjoy reading and travelling.' }],
      },
      {
        id: 's2',
        front: 'Order Food',
        back: 'Заказать еду',
        status: 'new',
        prompt: 'Закажите еду в кафе вежливо.',
        dialog: [
          { speaker: 'Q', line: 'What would you like to order?' },
          { speaker: 'A', line: 'I would like a pizza and a glass of water, please.' },
        ],
        exercises: [{ type: 'respond', prompt: 'Respond in English: "What would you like to order?"', sample: 'I would like a pizza and orange juice, please.' }],
      },
    ],
  },
];
