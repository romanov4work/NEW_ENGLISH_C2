// Картинка слова — реальное фото (Unsplash) с кэшем. Если фото нет — ничего не показываем.
import { useEffect, useState } from 'react';
import { Image, View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from './theme';
import { getImageUrl } from './imageLoader';

export function WordImage({ id, word, size = 160 }: { id: string; word: string; size?: number }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setUrl(null);
    getImageUrl(id, word)
      .then((u) => {
        if (active) {
          setUrl(u);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, word]);

  if (!loading && !url) return null;

  return (
    <View style={[styles.box, { width: size, height: size }]}>
      {loading ? (
        <ActivityIndicator color={COLORS.gray[400]} />
      ) : (
        url && <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: RADIUS.lg }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
});
