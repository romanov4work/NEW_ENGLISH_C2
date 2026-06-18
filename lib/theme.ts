// Дизайн-система: черно-белая палитра + акцентный цвет
export const COLORS = {
  // В тёмной теме семантика инвертирована:
  // black = основной текст (светлый), white = фон экранов (тёмный).
  black: '#F2F3F7',  // основной текст
  white: '#0D0E14',  // фон экранов

  // Серые оттенки (тёмная тема: 50 — самые тёмные поверхности → 700 светлее)
  gray: {
    50: '#171821',   // карточки/поверхности
    100: '#23252F',  // границы
    200: '#3A3D4D',  // тонкие элементы / стрелки
    300: '#5A5E73',  // placeholder
    400: '#8A8FA6',  // meta text
    500: '#9AA0B4',  // secondary text
    600: '#B4B9CC',  // tertiary text
    700: '#D2D6E2',  // icons
  },

  // Акцентный цвет (фиолетовый)
  primary: '#1E40AF',

  // Семантические цвета
  error: '#FF5C7A',
  success: '#34D399',
};

// Типография
export const TYPOGRAPHY = {
  // Размеры шрифтов
  size: {
    xs: 11,
    sm: 12,
    base: 15,
    md: 17,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },

  // Веса
  weight: {
    regular: '400' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Шрифт (премиум) — Inter
export const FONT = {
  regular: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

// Отступы
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Радиусы скругления
export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 14,
};

// Высоты элементов
export const HEIGHTS = {
  input: 40,
  button: 56,
  buttonLarge: 60,
};

// Удобные алиасы для частых стилей
export const COMMON_STYLES = {
  card: {
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },

  cardHalf: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center' as const,
    minHeight: HEIGHTS.button,
  },

  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    paddingVertical: 18,
    alignItems: 'center' as const,
  },

  buttonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    fontFamily: FONT.bold,
  },

  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },

  title: {
    fontSize: TYPOGRAPHY.size.xxxl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.black,
    fontFamily: FONT.bold,
  },
};


// === Тёмная премиум-тема (редизайн) ===
export const DARK = {
  bg: '#08090E',
  card: '#10111A',
  cardAlt: '#171925',
  border: '#222536',
  text: '#F4F5FA',
  textDim: '#9AA0B4',
  textMute: '#6B7090',
};

export const GRADIENTS = {
  purple: ['#3B82F6', '#1E40AF'] as const,
  pink: ['#3B82F6', '#1E40AF'] as const,
  blue: ['#3B82F6', '#1E40AF'] as const,
  cta: ['#2563EB', '#1E3A8A'] as const,
  tab: ['#2563EB', '#1E3A8A'] as const,
};

export const STAT_COLORS = {
  reviews: '#1E3A8A',
  added: '#2563EB',
  started: '#60A5FA',
  learned: '#60A5FA',
  minutes: '#93C5FD',
};
