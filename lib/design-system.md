# DESIGN SYSTEM — Единый паттерн для всех модулей

## 📌 ОБЩАЯ КОНЦЕПЦИЯ
Все модули (words, grammar, listening, pronunciation, reading, speaking, writing) используют **единую структуру экранов и дизайн**.

---

## 🎨 ДИЗАЙН-СИСТЕМА

### Источник всех значений
**ВСЕ цвета, размеры, отступы, радиусы берутся из `lib/theme.ts`** — это единственный источник правды.

### Адаптивность
Приложение ограничено `maxWidth: 480px` (см. `app/_layout.tsx`) — на планшетах и веб-версии контент остаётся мобильным с белыми полями по бокам.

---

## 📱 СТРУКТУРА МОДУЛЯ (7 экранов)

### 1️⃣ **index.tsx** — Главная страница модуля

**Шапка:**
- Кнопка назад: `◀` (fontSize: TYPOGRAPHY.size.xl, color: COLORS.black)
- Название модуля: `<Text style={COMMON_STYLES.title}>Название</Text>`
- Spacer: `<View style={{ flex: 1 }} />`
- Иконка настроек: `<Ionicons name="settings-outline" size={28} color={COLORS.black} />`
  - Переход: `/MODULE_NAME/train-settings`

**Счётчики (3 карточки):**
- 2 карточки в ряд: "Выученные" + "Изучаемые"
- 1 полная карточка: "Коллекции"
- Переходы: `/vocabulary`, `/studying`, `/collections`

Стиль карточки:
```typescript
{
  flex: 1,
  backgroundColor: COLORS.gray[50],
  borderRadius: RADIUS.lg,
  paddingVertical: SPACING.xl,
  paddingHorizontal: SPACING.lg,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 80,
}
```

Контент карточки:
- Цифра: `fontSize: 32, fontWeight: TYPOGRAPHY.weight.bold, color: COLORS.black, marginBottom: SPACING.xs`
- Подпись: `fontSize: TYPOGRAPHY.size.md / 1.4, color: COLORS.gray[500], fontWeight: TYPOGRAPHY.weight.semibold, textAlign: center`

**Статистика с табами:**
- Табы: `['Сегодня', 'Неделя', 'Месяц', 'Всего']`
- Неактивный таб: `fontSize: TYPOGRAPHY.size.md / 1.4, color: COLORS.gray[500], fontWeight: TYPOGRAPHY.weight.bold`
- Активный таб: `color: COLORS.black`
- Выравнивание табов:
  - Первый (index 0): `textAlign: 'left'`
  - Центральные (index 1, 2): `textAlign: 'center'`
  - Последний (index 3): `textAlign: 'right'`

**StatRow (строка статистики):**
```typescript
{
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 14,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: COLORS.gray[100],
}
```
- Label: `fontSize: TYPOGRAPHY.size.base, color: COLORS.black`
- Value: `fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold, color: COLORS.black`

**Кнопка внизу (bottomBar):**
```typescript
{
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  paddingHorizontal: SPACING.lg,
  paddingBottom: SPACING.xxxl,
  paddingTop: SPACING.md,
  backgroundColor: COLORS.white,
}
```
Кнопка: `COMMON_STYLES.button` с текстом "Тренировать [MODULE_NAME]"

---

### 2️⃣ **collections.tsx** — Список коллекций

**Шапка:**
- Кнопка назад: `◀`
- Название: `COMMON_STYLES.title` → "Коллекции"
- Spacer
- Иконка поиска: `🔍` (fontSize: TYPOGRAPHY.size.xl, color: COLORS.gray[700])
  - Активна: `color: COLORS.primary`
- Иконка добавить: `＋` (fontSize: TYPOGRAPHY.size.xl, color: COLORS.gray[700])

**Строка поиска (если открыт):**
```typescript
searchInput: {
  flex: 1,
  height: 40,
  backgroundColor: COLORS.gray[50],
  borderRadius: RADIUS.md,
  paddingHorizontal: SPACING.lg,
  fontSize: TYPOGRAPHY.size.base,
  color: COLORS.black,
  borderWidth: 2,
  borderColor: 'transparent',
}
searchInputFocused: {
  borderColor: COLORS.black,
}
```
- Кнопка очистки: `✕` (position: absolute, right: SPACING.sm)
- Цвет крестика: `fontSize: TYPOGRAPHY.size.lg, color: COLORS.gray[400]`

**Section Label:**
```typescript
{
  fontSize: TYPOGRAPHY.size.xs,
  color: COLORS.gray[400],
  letterSpacing: 1,
  fontWeight: TYPOGRAPHY.weight.semibold,
  marginTop: SPACING.md,
  marginBottom: SPACING.sm,
  paddingHorizontal: SPACING.xs,
}
```

**Элемент коллекции (tile):**
```typescript
{
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: COLORS.gray[50],
  borderRadius: RADIUS.lg,
  marginBottom: SPACING.sm,
}
```

Чекбокс:
```typescript
checkbox: {
  width: 22,
  height: 22,
  borderRadius: RADIUS.sm,
  borderWidth: 2,
  borderColor: COLORS.gray[200],
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: COLORS.white,
}
checkboxChecked: {
  borderColor: COLORS.primary,
  backgroundColor: COLORS.primary,
}
checkmark: {
  color: COLORS.white,
  fontSize: TYPOGRAPHY.size.sm,
  fontWeight: TYPOGRAPHY.weight.bold,
  lineHeight: 16,
}
```

Контент:
- Название: `fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.bold, color: COLORS.black` (активная → `color: COLORS.primary`)
- Метаинфо: `fontSize: TYPOGRAPHY.size.sm, color: COLORS.gray[500], marginTop: 2`
- Прогресс-бар: `height: 3, backgroundColor: COLORS.gray[100], borderRadius: 2, marginTop: 6`
  - Fill: `height: 3, backgroundColor: COLORS.primary, borderRadius: 2`
- Стрелка: `›` (fontSize: TYPOGRAPHY.size.xl, color: COLORS.gray[200])

---

### 3️⃣ **vocabulary.tsx** — Список выученных карточек

**Аналогично collections.tsx**, но:
- Заголовок: "Выученные [MODULE_NAME]"
- Section Label: "ВСЕГО ВЫУЧЕНО: X"
- Карточка слова:
```typescript
wordCard: {
  ...COMMON_STYLES.card,
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: SPACING.sm,
}
wordText: { flex: 1 }
wordEn: {
  fontSize: TYPOGRAPHY.size.md,
  fontWeight: TYPOGRAPHY.weight.semibold,
  color: COLORS.black,
  marginBottom: 2,
}
wordRu: {
  fontSize: TYPOGRAPHY.size.sm,
  color: COLORS.gray[600],
}
arrow: {
  fontSize: TYPOGRAPHY.size.xl,
  color: COLORS.gray[200],
  marginLeft: SPACING.sm,
}
```

**Empty state:**
```typescript
empty: {
  alignItems: 'center',
  paddingVertical: 64,
}
emptyTitle: {
  fontSize: TYPOGRAPHY.size.lg,
  fontWeight: TYPOGRAPHY.weight.bold,
  color: COLORS.black,
  marginBottom: SPACING.sm,
}
emptyText: {
  fontSize: TYPOGRAPHY.size.base,
  color: COLORS.gray[500],
  textAlign: 'center',
  paddingHorizontal: SPACING.xxxl,
}
```

---

### 4️⃣ **studying.tsx** — Карточки на изучении

**Идентично vocabulary.tsx**, но:
- Заголовок: "Изучаемые [MODULE_NAME]"
- Section Label: "СЛОВ НА ИЗУЧЕНИИ: X"
- Empty text: "Начните обучение, и здесь появятся слова, которые вы сейчас изучаете"

---

### 5️⃣ **train.tsx** — Тренировка

**Фазы:** `review` → `select` → `exercises` → `results`

**Прогресс-бар (3 секции):**
```typescript
progressBar: {
  flexDirection: 'row',
  marginBottom: SPACING.xs,
}
progressSection: {
  flex: 1,
  flexDirection: 'row',
  gap: 4,
}
progressSegment: {
  flex: 1,
  height: 4,
  backgroundColor: COLORS.gray[100],
  borderRadius: 2,
}
progressSegmentActive: {
  backgroundColor: COLORS.black,
}
progressDivider: {
  width: 8,
}
```

**Подписи под прогресс-баром:**
```typescript
progressLabel: {
  fontSize: TYPOGRAPHY.size.xs,
  color: COLORS.gray[500],
  fontWeight: TYPOGRAPHY.weight.semibold,
}
```
Тексты: "Повторение" | "Выбор" | "Упражнения"

**Контент фазы:**
```typescript
phaseTitle: {
  fontSize: TYPOGRAPHY.size.xxl,
  fontWeight: TYPOGRAPHY.weight.bold,
  color: COLORS.black,
  textAlign: 'center',
  marginBottom: SPACING.sm,
}
phaseText: {
  fontSize: TYPOGRAPHY.size.base,
  color: COLORS.gray[500],
  textAlign: 'center',
  marginBottom: SPACING.xxxl,
}
```

**Карточка:**
```typescript
card: {
  ...COMMON_STYLES.card,
  alignItems: 'center',
  paddingVertical: 48,
}
cardWord: {
  fontSize: 32,
  fontWeight: TYPOGRAPHY.weight.bold,
  color: COLORS.black,
  marginBottom: SPACING.sm,
}
cardTranslation: {
  fontSize: TYPOGRAPHY.size.lg,
  color: COLORS.gray[600],
}
```

**Кнопки внизу (bottomBar):**
- Одна кнопка: `COMMON_STYLES.button`
- Две кнопки (select фаза):
```typescript
buttonRow: {
  flexDirection: 'row',
  gap: SPACING.sm,
}
buttonHalf: {
  flex: 1,
  backgroundColor: COLORS.white,
  borderWidth: 2,
  borderColor: COLORS.primary,
  borderRadius: 14,
  paddingVertical: 18,
  alignItems: 'center',
}
buttonHalfText: {
  fontSize: TYPOGRAPHY.size.lg,
  fontWeight: TYPOGRAPHY.weight.bold,
  color: COLORS.primary,
}
buttonPrimary: {
  backgroundColor: COLORS.primary,
}
buttonPrimaryText: {
  color: COLORS.white,
}
```

**Results фаза:**
- Использует `statsCard` с `COMMON_STYLES.card`
- StatRow аналогично index.tsx

---

### 6️⃣ **train-settings.tsx** — Настройки тренировки

**Section Label (первая):**
```typescript
sectionLabelFirst: {
  fontSize: TYPOGRAPHY.size.xs,
  color: COLORS.gray[400],
  letterSpacing: 1,
  fontWeight: TYPOGRAPHY.weight.semibold,
  marginBottom: SPACING.lg,
}
```

**Section Label (остальные):**
```typescript
sectionLabel: {
  fontSize: TYPOGRAPHY.size.xs,
  color: COLORS.gray[400],
  letterSpacing: 1,
  fontWeight: TYPOGRAPHY.weight.semibold,
  marginTop: SPACING.xxxl,
  marginBottom: SPACING.lg,
  paddingTop: SPACING.xl,
  borderTopWidth: 2,
  borderTopColor: COLORS.gray[100],
}
```

**Subsection Label:**
```typescript
{
  fontSize: TYPOGRAPHY.size.sm,
  color: COLORS.black,
  fontWeight: TYPOGRAPHY.weight.semibold,
  marginTop: SPACING.lg,
  marginBottom: SPACING.sm,
}
```

**Опции (сетка 7 колонок):**
```typescript
optionsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: SPACING.sm,
  marginBottom: SPACING.sm,
}
optionUniform: {
  width: 'calc(14.28% - 7px)',
  minWidth: 45,
  paddingVertical: SPACING.md,
  backgroundColor: COLORS.gray[50],
  borderRadius: RADIUS.md,
  borderWidth: 2,
  borderColor: 'transparent',
  alignItems: 'center',
  justifyContent: 'center',
}
optionActive: {
  backgroundColor: COLORS.primary,
  borderColor: COLORS.primary,
}
optionText: {
  fontSize: TYPOGRAPHY.size.base,
  fontWeight: TYPOGRAPHY.weight.semibold,
  color: COLORS.black,
}
optionTextActive: {
  color: COLORS.white,
}
```

**Опции (ряд):**
```typescript
optionsRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: SPACING.sm,
}
option: {
  paddingVertical: SPACING.md,
  paddingHorizontal: SPACING.xl,
  backgroundColor: COLORS.gray[50],
  borderRadius: RADIUS.md,
  borderWidth: 2,
  borderColor: 'transparent',
}
```

**SettingRow:**
```typescript
settingRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: SPACING.lg,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: COLORS.gray[100],
}
settingRowLast: {
  borderBottomWidth: 0,
}
settingLabel: {
  fontSize: TYPOGRAPHY.size.base,
  color: COLORS.black,
}
```

**Toggle (переключатель):**
```typescript
toggle: {
  width: 51,
  height: 31,
  borderRadius: 16,
  backgroundColor: COLORS.gray[200],
  justifyContent: 'center',
  padding: 2,
}
toggleActive: {
  backgroundColor: COLORS.black,
}
toggleThumb: {
  width: 27,
  height: 27,
  borderRadius: 14,
  backgroundColor: COLORS.white,
}
// Анимация: translateX от 0 до 20
```

**Модальное окно (numpad):**
```typescript
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
}
modalContent: {
  backgroundColor: COLORS.white,
  borderRadius: RADIUS.lg,
  padding: SPACING.xl,
  width: 300,
}
modalTitle: {
  fontSize: TYPOGRAPHY.size.base,
  fontWeight: TYPOGRAPHY.weight.bold,
  color: COLORS.black,
  textAlign: 'center',
  marginBottom: SPACING.lg,
  lineHeight: 22,
}
modalDisplay: {
  backgroundColor: COLORS.gray[50],
  borderRadius: RADIUS.md,
  paddingVertical: SPACING.lg,
  paddingHorizontal: SPACING.xl,
  marginBottom: SPACING.lg,
  alignItems: 'center',
}
modalDisplayText: {
  fontSize: 24,
  fontWeight: TYPOGRAPHY.weight.bold,
  color: COLORS.black,
}
numpadContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: SPACING.sm,
}
numpadKey: {
  width: 'calc(33.33% - 6px)',
  aspectRatio: 1,
  backgroundColor: COLORS.gray[50],
  borderRadius: RADIUS.md,
  justifyContent: 'center',
  alignItems: 'center',
}
numpadKeyText: {
  fontSize: TYPOGRAPHY.size.xl,
  fontWeight: TYPOGRAPHY.weight.semibold,
  color: COLORS.black,
}
```

**Кнопки действий:**
```typescript
actionBtn: {
  ...COMMON_STYLES.card,
  alignItems: 'center',
  marginBottom: SPACING.sm,
}
actionBtnText: {
  fontSize: TYPOGRAPHY.size.base,
  fontWeight: TYPOGRAPHY.weight.semibold,
  color: COLORS.black,
}
```

---

### 7️⃣ **card/[id].tsx** — Детальный просмотр карточки

**Карточка слова:**
```typescript
wordCard: {
  ...COMMON_STYLES.card,
  alignItems: 'center',
  paddingVertical: SPACING.xxxl,
  marginTop: SPACING.lg,
}
wordEn: {
  fontSize: 32,
  fontWeight: TYPOGRAPHY.weight.bold,
  color: COLORS.black,
  marginBottom: SPACING.sm,
}
wordRu: {
  fontSize: TYPOGRAPHY.size.lg,
  color: COLORS.gray[600],
}
```

**Карточка примера:**
```typescript
exampleCard: {
  ...COMMON_STYLES.card,
  marginBottom: SPACING.sm,
}
exampleEn: {
  fontSize: TYPOGRAPHY.size.base,
  color: COLORS.black,
  marginBottom: SPACING.xs,
}
exampleRu: {
  fontSize: TYPOGRAPHY.size.sm,
  color: COLORS.gray[600],
}
```

**Карточка прогресса:**
```typescript
progressCard: {
  ...COMMON_STYLES.card,
}
progressRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 14,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: COLORS.gray[100],
}
progressLabel: {
  fontSize: TYPOGRAPHY.size.base,
  color: COLORS.black,
}
progressValue: {
  fontSize: TYPOGRAPHY.size.base,
  fontWeight: TYPOGRAPHY.weight.bold,
  color: COLORS.black,
}
```

**Кнопка действия:**
```typescript
actionBtn: {
  flex: 1,
  backgroundColor: COLORS.primary,
  borderRadius: 14,
  paddingVertical: 18,
  alignItems: 'center',
}
actionBtnText: {
  fontSize: TYPOGRAPHY.size.lg,
  fontWeight: TYPOGRAPHY.weight.bold,
  color: COLORS.white,
}
```

---

## 🧩 ОБЩИЕ КОМПОНЕНТЫ (COMMON_STYLES из theme.ts)

### header:
```typescript
{
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: SPACING.xl,
  paddingTop: SPACING.lg,
  paddingBottom: SPACING.sm,
}
```

### title:
```typescript
{
  fontSize: TYPOGRAPHY.size.xxxl,
  fontWeight: TYPOGRAPHY.weight.bold,
  color: COLORS.black,
}
```

### card:
```typescript
{
  backgroundColor: COLORS.gray[50],
  borderRadius: RADIUS.lg,
  paddingVertical: SPACING.lg,
  paddingHorizontal: SPACING.xl,
}
```

### button:
```typescript
{
  backgroundColor: COLORS.primary,
  borderRadius: 14,
  paddingVertical: 18,
  alignItems: 'center',
}
```

### buttonText:
```typescript
{
  color: COLORS.white,
  fontSize: TYPOGRAPHY.size.lg,
  fontWeight: TYPOGRAPHY.weight.bold,
}
```

---

## 📝 ПРАВИЛА АДАПТАЦИИ ДЛЯ ДРУГИХ МОДУЛЕЙ

### Для каждого модуля меняется:
1. **Название** (Слова → Грамматика, Аудирование, Фонетика, и т.д.)
2. **Названия полей карточек:**
   - words: en, ru, examples
   - grammar: rule, theory, examples
   - listening: audio, transcript
   - pronunciation: phrase, reference
   - reading: text, questions
   - speaking: dialog, scenario
   - writing: prompt, requirements

3. **Типы упражнений** (в train-settings.tsx)
4. **Контент карточек** (в train.tsx, card/[id].tsx)

### ВСЁ ОСТАЛЬНОЕ — ИДЕНТИЧНО:
- Цвета
- Отступы
- Размеры шрифтов
- Структура экранов
- Логика навигации
- Анимации

---

## ✅ ЧЕКЛИСТ ДЛЯ СОЗДАНИЯ НОВОГО МОДУЛЯ

1. Копировать папку `app/words/` → `app/NEW_MODULE/`
2. Заменить все "Слова" → "[NEW_MODULE_NAME]"
3. Заменить все `/words/` → `/NEW_MODULE/` в навигации
4. Адаптировать типы данных карточек
5. Изменить типы упражнений в train-settings
6. Обновить контент в train.tsx (фазы)
7. Обновить детали карточки в card/[id].tsx
8. Проверить типизацию (если используется TypeScript)
9. Запустить `npx tsc --noEmit`
10. Протестировать все 8 экранов вручную

---

## 🎯 АРХИТЕКТУРНЫЕ ДЕТАЛИ

### ResponsiveContainer (_layout.tsx)
```typescript
{
  flex: 1,
  maxWidth: 480,
  width: '100%',
  alignSelf: 'center',
}
```
Все экраны автоматически центрируются на широких экранах.

### SafeAreaView
Используется на всех экранах для корректного отображения на устройствах с вырезами.

### Навигация
- Используется `expo-router` с файловой маршрутизацией
- `router.back()` для возврата
- `router.push()` для навигации вперёд
- `router.replace()` для замены текущего экрана

---

## 📚 БУДУЩИЕ ФИЧИ

- **Multi-Module Train**: выбор нескольких модулей → смешанная тренировка
- **Unified Dashboard**: общий дашборд прогресса по всем модулям
- **Тёмная тема**: добавить COLORS.dark в theme.ts
- **Анимации**: React Native Reanimated для плавных переходов
