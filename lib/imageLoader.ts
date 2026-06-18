// Загрузка РЕАЛЬНЫХ фото для слов через Pixabay API + кэш URL в AsyncStorage.
// Бесплатно. Регистрация ключа: https://pixabay.com/api/docs/
// Лимиты: ~100 запросов/мин на ключ; Pixabay просит кэшировать результат на 24ч —
// мы кэшируем URL по id карточки (повторные показы мгновенные, работают офлайн).
//
// ВНИМАНИЕ: ключ зашит в клиент — на масштабе его извлекут из APK. Для тысяч юзеров
// запросы нужно проксировать через свой бэкенд + кэш/CDN (см. Этап 4 плана).

import AsyncStorage from '@react-native-async-storage/async-storage';

const PIXABAY_KEY = process.env.EXPO_PUBLIC_PIXABAY_KEY ?? '';
const CACHE_KEY = '@words_image_cache';

type ImageCache = Record<string, string>;

async function loadCache(): Promise<ImageCache> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as ImageCache) : {};
  } catch {
    return {};
  }
}

async function saveCache(cache: ImageCache): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.log('image cache save failed', e);
  }
}

// Возвращает URL фото для слова (из кэша или с Pixabay). null — если не нашлось.
export async function getImageUrl(cardId: string, word: string): Promise<string | null> {
  const cache = await loadCache();
  if (cache[cardId]) return cache[cardId];

  try {
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(
      word,
    )}&image_type=photo&safesearch=true&lang=en&per_page=3&orientation=horizontal`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const hit = data.hits?.[0];
    const photo: string | null = hit?.webformatURL ?? null;
    if (photo) {
      cache[cardId] = photo;
      saveCache(cache);
    }
    return photo;
  } catch (e) {
    console.log('getImageUrl failed', e);
    return null;
  }
}
