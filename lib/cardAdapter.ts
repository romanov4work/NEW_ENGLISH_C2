export type ModuleId = 'words' | 'pronunciation' | 'grammar' | 'reading' | 'writing' | 'listening' | 'speaking';

export interface Exercise {
  type: 'multiple_choice';
  question: string;
  options: string[];
  correctIndex: number;
}

export interface UnifiedCard {
  id: string;
  moduleId: ModuleId;
  front: string;
  back: string;
  status: 'new' | 'studying' | 'learned';
  exercises?: Exercise[];
}

export function normalizeCard(card: any, moduleId: ModuleId): UnifiedCard {
  if (moduleId === 'words') {
    return {
      id: card.id,
      moduleId,
      front: card.en,
      back: Array.isArray(card.ru) ? card.ru.join(', ') : card.ru,
      status: card.status,
      exercises: card.exercises || [],
    };
  }
  // Для остальных модулей (grammar, listening, etc)
  return {
    id: card.id,
    moduleId,
    front: card.title,
    back: card.ru,
    status: card.status,
    exercises: card.exercises || [],
  };
}
