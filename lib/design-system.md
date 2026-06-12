# DESIGN SYSTEM — Единый паттерн для всех модулей

## 📌 ОБЩАЯ КОНЦЕПЦИЯ
Все модули (words, grammar, listening, pronunciation, reading, speaking, writing) используют **единую структуру экранов и дизайн**.

---

## 🎨 ЦВЕТОВАЯ СХЕМА (из theme.ts)

### Основные цвета:
- **Белый фон**: `COLORS.white` (#FFFFFF)
- **Черный текст/кнопки**: `COLORS.black` (#000000)
- **Акцент (primary)**: `COLORS.primary` (черный #000000)
- **Серые оттенки**:
  - `COLORS.gray[50]` — фон карточек (#F9FAFB)
  - `COLORS.gray[100]` — borders (#F3F4F6)
  - `COLORS.gray[200]` — светло-серый (#E5E7EB)
  - `COLORS.gray[300]` — placeholder (#D1D5DB)
  - `COLORS.gray[400]` — section labels (#9CA3AF)
  - `COLORS.gray[500]` — вторичный текст (#6B7280)
  - `COLORS.gray[600]` — темно-серый текст (#4B5563)
  - `COLORS.gray[700]` — иконки (#374151)

### Типографика:
- **size.xs**: 10
- **size.sm**: 12
- **size.base**: 14
- **size.md**: 16
- **size.lg**: 18
- **size.xl**: 20
- **size.xxl**: 24
- **size.xxxl**: 32

### Отступы (SPACING):
- **xs**: 4
- **sm**: 8
- **md**: 12
- **lg**: 16
- **xl**: 20
- **xxl**: 24
- **xxxl**: 32

### Радиусы (RADIUS):
- **sm**: 4
- **md**: 8
- **lg**: 12
- **xl**: 16

---

## 📱 СТРУКТУРА МОДУЛЯ (8 экранов)

### 1️⃣ **index.tsx** — Главная страница модуля

**Элементы:**
- **Шапка (header)**:
  - Кнопка назад: `◀` (fontSize: xl, color: black)
  - Название модуля: `<Text style={COMMON_STYLES.title}>Слова</Text>`
  - Spacer (flex: 1)
  - Иконка настроек: `⚙️` (fontSize: xxl) → `/MODULE_NAME/train-settings`

- **Счётчики (2 карточки в ряд + 1 полная)**:
  - Выученные (learned) → `/MODULE_NAME/vocabulary`
  - Изучаемые (studying) → `/MODULE_NAME/studying`
  - Коллекции (collections) → `/MODULE_NAME/collections`
  
  **Стиль карточки счётчика:**
  ```
  backgroundColor: COLORS.gray[50]
  borderRadius: RADIUS.lg
  paddingVertical: SPACING.xl
  paddingHorizontal: SPACING.lg
  alignItems: center
  minHeight: 80
  ```
  
  **Контент:**
  - Цифра: fontSize 32, fontWeight bold, color black
  - Подпись: fontSize md / 1.4, color gray[500], semibold

- **Статистика с табами**:
  - **Табы**: Сегодня | Неделя | Месяц | Всего
    - Неактивный таб: fontSize md / 1.4, color gray[500], fontWeight bold
    - Активный таб: color black
    - Выравнивание: первый — left, центральные — center, последний — right
  
  - **Строки статистики** (StatRow):
    - Повторений
    - Добавлено на изучение
    - Начато изучение
    - Полностью выучено
    - Время обучения (мин)
    
    **Стиль:**
    ```
    flexDirection: row
    justifyContent: space-between
    paddingVertical: 14
    borderBottomWidth: hairline
    borderBottomColor: gray[100]
    ```

- **Кнопка внизу (bottomBar)**:
  - Позиция: absolute, bottom: 0
  - Кнопка: `COMMON_STYLES.button`
  - Текст: "Учить [MODULE_NAME]" → `/MODULE_NAME/train`

---

### 2️⃣ **collections.tsx** — Список коллекций

**Элементы:**
- **Шапка**:
  - Кнопка назад: `◀`
  - Название: "Коллекции"
  - Spacer
  - Иконка поиска: `🔍` (fontSize xl, color gray[700], active → primary)
  - Иконка добавить: `＋` (fontSize xl, color gray[700])

- **Строка поиска** (если открыт поиск):
  ```
  backgroundColor: gray[50]
  borderRadius: RADIUS.md
  height: 40
  borderWidth: 2
  borderColor: transparent (в фокусе → black)
  ```
  - Кнопка очистки: `✕` справа (если есть текст)

- **Section Label**: "ВЫБЕРИТЕ ДЛЯ ТРЕНИРОВКИ"
  ```
  fontSize: xs
  color: gray[400]
  letterSpacing: 1
  fontWeight: semibold
  marginTop: md, marginBottom: sm
  ```

- **Элемент коллекции (tile)**:
  ```
  flexDirection: row
  backgroundColor: gray[50]
  borderRadius: RADIUS.lg
  marginBottom: sm
  ```
  
  - **Чекбокс** (слева):
    - Размер: 22×22, borderRadius sm
    - Неактивный: border gray[200], bg white
    - Активный: border primary, bg primary, галочка `✓` белая
  
  - **Основная область** (tileMain):
    - Название коллекции (bold, md, color black или primary если активна)
    - Метаинфо: "Выучено X (Y%)" или "Не начато" (sm, gray[500])
    - Прогресс-бар: высота 3px, bg gray[100], fill primary
    - Стрелка: `›` (xl, gray[200])

- **Подсказка внизу**:
  ```
  fontSize: sm
  color: gray[300]
  textAlign: center
  marginTop: lg
  ```

---

### 3️⃣ **vocabulary.tsx** — Список выученных карточек

**Элементы:**
- **Шапка**:
  - Кнопка назад: `◀`
  - Название: "Выученные [MODULE_NAME]"
  - Spacer
  - Иконка поиска: `🔍`
  - Иконка добавить: `＋`

- **Строка поиска** (аналогично collections)

- **Section Label**: "ВСЕГО ВЫУЧЕНО: X"

- **Карточка слова (wordCard)**:
  ```
  ...COMMON_STYLES.card
  flexDirection: row
  alignItems: center
  marginBottom: sm
  ```
  
  - **Текст** (wordText):
    - EN: fontSize md, semibold, black, marginBottom 2
    - RU: fontSize sm, gray[600]
  
  - **Стрелка**: `›` (xl, gray[200])

- **Empty state** (если нет карточек):
  ```
  paddingVertical: 64
  alignItems: center
  ```
  - Заголовок: "Пока ничего нет" (lg, bold, black)
  - Текст: описание (base, gray[500], center)

---

### 4️⃣ **studying.tsx** — Карточки на изучении

**Элементы:**
- Аналогично `vocabulary.tsx`
- Section Label: "СЛОВ НА ИЗУЧЕНИИ: X"
- Empty text: "Начните обучение, и здесь появятся слова, которые вы сейчас изучаете"

---

### 5️⃣ **train.tsx** — Тренировка

**Фазы:** review → select → exercises → results

**Элементы:**
- **Шапка**:
  - Кнопка назад: `◀`
  - Название: "Тренировка"

- **Прогресс-бар** (три секции):
  ```
  flexDirection: row
  gap между секциями: 8
  ```
  
  - **Сегмент прогресса**:
    ```
    flex: 1
    height: 4
    borderRadius: 2
    backgroundColor: gray[100] (неактивный) | black (активный)
    ```
  
  - **Подписи** (под прогресс-баром):
    - Повторение | Выбор | Упражнения
    - fontSize: xs, color gray[500], semibold, textAlign center

- **Контент фазы**:
  - **phaseTitle**: fontSize xxl, bold, black, center
  - **phaseText**: fontSize base, gray[500], center, marginBottom xxxl
  
  - **Карточка** (card):
    ```
    ...COMMON_STYLES.card
    alignItems: center
    paddingVertical: 48
    ```
    - Слово: fontSize 32, bold, black
    - Перевод: fontSize lg, gray[600]

- **Кнопки внизу (bottomBar)**:
  - **Одна кнопка**: `COMMON_STYLES.button` (черная, полная ширина)
  
  - **Две кнопки** (select фаза):
    ```
    flexDirection: row
    gap: sm
    ```
    - Левая (Знаю): white bg, border primary, text primary
    - Правая (Учить): bg primary, text white

- **Results фаза**:
  - StatRow: label + value (аналогично index.tsx)

---

### 6️⃣ **train-settings.tsx** — Настройки тренировки

**Элементы:**
- **Шапка**: Кнопка назад + "Настройки"

- **Секция** (section):
  ```
  sectionLabel:
    fontSize: xs
    color: gray[400]
    letterSpacing: 1
    fontWeight: semibold
    marginTop: xxxl
    marginBottom: lg
    borderTopWidth: 2
    borderTopColor: gray[100]
  ```

- **Subsection Label**:
  ```
  fontSize: sm
  color: black
  fontWeight: semibold
  marginTop: lg, marginBottom: sm
  ```

- **Опции (кнопки выбора)**:
  - **optionsGrid** (сетка 7 колонок для чисел):
    ```
    flexDirection: row
    flexWrap: wrap
    gap: sm
    ```
    - Кнопка: width 14.28%, minWidth 45, paddingVertical md
    - Неактивная: bg gray[50], border transparent
    - Активная: bg primary, border primary, text white

  - **optionsRow** (ряд кнопок):
    - Аналогично, но без фиксированной ширины

- **SettingRow** (строка настройки):
  ```
  flexDirection: row
  justifyContent: space-between
  alignItems: center
  paddingVertical: lg
  borderBottomWidth: hairline
  ```
  
  - **Toggle (переключатель)**:
    ```
    width: 51, height: 31, borderRadius: 16
    backgroundColor: gray[200] (off) | black (on)
    thumb: width 27, height 27, borderRadius 14, bg white
    анимация: translateX от 0 до 20
    ```

- **Модальное окно (numpad)**:
  - Затемнение: rgba(0,0,0,0.5)
  - Контент: white bg, borderRadius lg, padding xl, width 300
  - Дисплей: bg gray[50], fontSize 24, bold
  - Кнопки цифр: 3×4 сетка, aspectRatio 1, bg gray[50], borderRadius md

- **Кнопки действий** (экспорт/импорт/сброс):
  ```
  ...COMMON_STYLES.card
  alignItems: center
  marginBottom: sm
  ```

---

### 7️⃣ **settings.tsx** — Меню настроек модуля

**Структура:**
- Список пунктов меню
- Каждый пункт → подраздел настроек
- Аналогичные стили SettingRow из train-settings.tsx

---

### 8️⃣ **card/[id].tsx** — Детальный просмотр карточки

**Элементы:**
- **Шапка**: Кнопка назад + "Карточка"

- **Карточка слова** (wordCard):
  ```
  ...COMMON_STYLES.card
  alignItems: center
  paddingVertical: xxxl
  marginTop: lg
  ```
  - EN: fontSize 32, bold, black
  - RU: fontSize lg, gray[600]

- **Section Label**: "ПРИМЕРЫ"

- **Карточка примера** (exampleCard):
  ```
  ...COMMON_STYLES.card
  marginBottom: sm
  ```
  - EN: fontSize base, black, marginBottom xs
  - RU: fontSize sm, gray[600]

- **Section Label**: "ПРОГРЕСС"

- **Карточка прогресса** (progressCard):
  - progressRow: label + value (аналогично StatRow)
  - Показывает: Статус, Повторений

- **Кнопка действия**:
  ```
  backgroundColor: primary
  borderRadius: 14
  paddingVertical: 18
  alignItems: center
  marginTop: xl
  ```
  - Текст: "Тренировать" (lg, bold, white)

---

## 🧩 ОБЩИЕ КОМПОНЕНТЫ (COMMON_STYLES из theme.ts)

### Header:
```
flexDirection: row
alignItems: center
paddingHorizontal: lg
paddingVertical: md
backgroundColor: white
```

### Title:
```
fontSize: xl
fontWeight: bold
color: black
```

### Card:
```
backgroundColor: gray[50]
borderRadius: lg
paddingVertical: lg
paddingHorizontal: xl
```

### Button:
```
backgroundColor: black
borderRadius: 14
paddingVertical: 18
alignItems: center
```

### ButtonText:
```
fontSize: lg
fontWeight: bold
color: white
```

---

## 📝 ПРАВИЛА АДАПТАЦИИ ДЛЯ ДРУГИХ МОДУЛЕЙ

### Для каждого модуля меняется:
1. **Название** (Слова → Грамматика, Аудирование, и т.д.)
2. **Названия полей карточек**:
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
3. Адаптировать типы данных карточек
4. Изменить типы упражнений в train-settings
5. Обновить контент в train.tsx (фазы)
6. Обновить детали карточки в card/[id].tsx
7. Проверить навигацию (все ссылки `/words/` → `/NEW_MODULE/`)
8. Проверить типизацию (если используется TypeScript)
9. Запустить npx tsc --noEmit
10. Протестировать все 8 экранов вручную

---

## 🎯 БУДУЩИЕ ФИЧИ

- **Multi-Module Train**: выбор нескольких модулей → смешанная тренировка
- **Unified Dashboard**: общий дашборд прогресса по всем модулям
- **Темная тема**: добавить COLORS.dark в theme.ts
- **Анимации**: React Native Reanimated для плавных переходов
