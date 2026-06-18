// Проверка текста пользователя. Groq (если есть ключ) — умная проверка, иначе локальная.
// Бесплатный ключ Groq БЕЗ карты: https://console.groq.com/keys → .env (EXPO_PUBLIC_GROQ_KEY)

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_KEY ?? '';
const GROQ_MODEL = 'llama-3.1-8b-instant';

async function askGroqYesNo(userPrompt: string): Promise<boolean | null> {
  if (!GROQ_API_KEY) return null;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0,
        max_tokens: 5,
        messages: [
          { role: 'system', content: 'You verify a language learner. Reply with only "YES" or "NO".' },
          { role: 'user', content: userPrompt },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const answer: string = data?.choices?.[0]?.message?.content ?? '';
    return /yes/i.test(answer);
  } catch {
    return null;
  }
}

// Упражнение "Составьте предложение со словом"
export async function checkSentence(text: string, word: string): Promise<boolean> {
  const t = text.trim().toLowerCase();
  if (t.length === 0) return false;
  const tokens = t.split(/\s+/);
  if (tokens.length < 3) return false;
  if (new Set(tokens).size < 3) return false;
  const w = word.toLowerCase();
  if (!(t.includes(w) || tokens.includes(w.split(' ')[0]))) return false;
  const ai = await askGroqYesNo(
    `Is the following a grammatically correct English sentence that uses the word "${word}" correctly? Reply YES or NO only.\nSentence: ${text}`,
  );
  return ai === null ? true : ai;
}

// Свободный ответ (письмо / говорение)
export async function checkResponse(text: string, taskPrompt: string): Promise<boolean> {
  const t = text.trim();
  const tokens = t.split(/\s+/).filter(Boolean);
  if (tokens.length < 3) return false;
  const ai = await askGroqYesNo(
    `A learner was asked: "${taskPrompt}". Their answer: "${text}". Is the answer in reasonably correct English and relevant to the task? Reply YES or NO only.`,
  );
  return ai === null ? true : ai;
}
