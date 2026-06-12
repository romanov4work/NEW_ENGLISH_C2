// Дизайн-система: черно-белая палитра + акцентный цвет
export const COLORS = {
  // Основные цвета
  black: '#000',
  white: '#fff',

  // Серые оттенки
  gray: {
    50: '#f6f6f6',   // фон карточек
    100: '#e5e5e5',  // borders
    200: '#ccc',     // arrows
    300: '#bbb',     // placeholder
    400: '#999',     // meta text
    500: '#888',     // secondary text
    600: '#666',     // tertiary text
    700: '#555',     // icons
  },

  // Акцентный цвет (розовый для кнопок)
  primary: '#000000', // PINK из старого апп

  // Семантические цвета
  error: '#ff4444',
  success: '#4CAF50',
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
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
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
  },
};
