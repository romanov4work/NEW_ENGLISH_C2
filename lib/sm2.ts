// Канонический SM-2 (SuperMemo 2) — ТОЛЬКО планирование интервалов повторений.
// Когда карточка считается "выученной" — решает НЕ этот модуль, а счётчик повторений
// (repeatCount >= repeatsToLearn) в lib/progress.ts.
//
// Расписание: интервал в днях, но дата следующего повтора выравнивается на границу
// "учебного дня" — 5:00 утра локального времени (как в Anki). То есть слово появляется
// НА СЛЕДУЮЩИЙ ДЕНЬ (после 5:00), а не ровно через 24 часа от ответа.
//
// quality 0..5:
//   < 3  — забыл  → сброс (interval=1)
//   >= 3 — вспомнил → интервал растёт по схеме 1 → 6 → round(interval*EF)
// EF корректируется по формуле SM-2 и не опускается ниже 1.3.

export const DAY_MS = 86_400_000;
export const CUTOFF_HOUR = 5; // граница учебного дня (5:00 утра)

export interface SM2State {
  repetitions: number; // успешных ответов подряд (для расчёта интервала)
  interval: number;    // текущий интервал в днях
  easeFactor: number;  // коэффициент лёгкости (старт 2.5, мин 1.3)
  dueDate: number;     // когда карточку нужно повторить (timestamp, ms)
}

// Начальное состояние: доступно к повторению сразу (dueDate = now).
export function initialSM2(now: number = Date.now()): SM2State {
  return { repetitions: 0, interval: 0, easeFactor: 2.5, dueDate: now };
}

// Дата следующего повтора: ближайшая граница 5:00 + (interval - 1) дней.
// interval=1 → следующее 5:00 (т.е. завтра утром, если сейчас уже после 5:00 сегодня).
export function nextDueDate(intervalDays: number, now: number = Date.now()): number {
  const cutoff = new Date(now);
  cutoff.setHours(CUTOFF_HOUR, 0, 0, 0);
  if (cutoff.getTime() <= now) {
    cutoff.setDate(cutoff.getDate() + 1); // 5:00 уже прошли — берём завтрашние 5:00
  }
  cutoff.setDate(cutoff.getDate() + (intervalDays - 1));
  return cutoff.getTime();
}

// Применить ответ качества quality (0..5) — пересчитать интервал и дату следующего показа.
export function applySM2(state: SM2State, quality: number, now: number = Date.now()): SM2State {
  let { repetitions, interval, easeFactor } = state;

  if (quality <= 2) {
    // "Не помню" — сброс.
    repetitions = 0;
    interval = 1;
  } else if (quality === 3) {
    // "Плохо помню" (hard) — короткий интервал, чтобы слово вернулось скоро.
    repetitions += 1;
    interval = Math.max(1, Math.round((interval || 1) * 1.2));
  } else {
    // "Помню" (good) — обычный рост интервала 1 → 6 → interval*EF.
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const dueDate = nextDueDate(interval, now);
  return { repetitions, interval, easeFactor, dueDate };
}
