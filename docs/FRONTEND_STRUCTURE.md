# Frontend Structure - Simplified Version

Упрощенная версия frontend приложения с минимальным UI - только TabBar с тремя вкладками-заглушками.

## Текущая структура

```
frontend/src/
├── components/
│   └── navigation/
│       ├── TabBar.vue          # Нижняя навигационная панель
│       ├── TabBarItem.vue      # Элемент таба (кнопка)
│       └── index.ts            # Barrel export
├── composables/
│   └── useNavigation.ts        # Composable для навигации
├── stores/
│   ├── navigation.store.ts     # Store управления табами
│   └── index.ts                # Barrel export
├── types/
│   └── index.ts                # TypeScript типы (только навигация)
├── views/
│   ├── FeedView.vue            # Заглушка для Feed таба
│   ├── ProfileView.vue         # Заглушка для Profile таба
│   ├── FriendsView.vue         # Заглушка для Friends таба
│   └── index.ts                # Barrel export
├── App.vue                     # Корневой компонент
└── main.ts                     # Entry point
```

## Что было удалено

### Компоненты
- ❌ `components/feed/` - все компоненты ленты (NewsCard, IdeaCard, PromoBanner, FeedItem)
- ❌ `components/friends/` - компоненты друзей (FriendItem)
- ❌ `components/profile/` - компоненты профиля (ProfileHeader, WishlistItem)
- ❌ `components/common/` - общие компоненты (EmptyState, LoadingSpinner)
- ❌ `components/EmptyState.vue` - дубликат
- ❌ `components/Header.vue` - неиспользуемый

### Сервисы (полностью удалена директория)
- ❌ `services/feed.service.ts`
- ❌ `services/friends.service.ts`
- ❌ `services/user.service.ts`
- ❌ `services/telegram.service.ts`
- ❌ `api/client.ts`
- ❌ вся директория `api/`

### Stores
- ❌ `stores/user.store.ts`

### Composables
- ❌ `composables/useTelegram.ts`

### Pages
- ❌ `pages/WishlistPage.vue`

### Типы
Упрощен `types/index.ts` - оставлены только типы для навигации:
- `TabId`
- `TabConfig`
- `NavigationState`

## Что осталось

### App.vue
Минимальная версия без Telegram инициализации:
- Lazy loading views через `defineAsyncComponent`
- Custom tab router (без Vue Router)
- KeepAlive для сохранения состояния табов
- Базовые CSS переменные

### Navigation (TabBar)
- **TabBar.vue** - фиксированная нижняя панель с тремя кнопками
- **TabBarItem.vue** - кнопка таба с иконкой и лейблом
- Без haptic feedback
- Без safe area insets

### Views (заглушки)
Каждая view - простой placeholder с:
- Иконкой (emoji)
- Заголовком
- Описанием "Placeholder for X content"
- Центрированным layout

### Navigation Store
Управление состоянием навигации:
- `activeTab` - текущий активный таб
- `switchTab()` - переключение таба
- `goBack()` - возврат к предыдущему табу
- `TAB_CONFIGS` - конфигурация 3 табов (Feed, Profile, Friends)

### useNavigation Composable
Простой wrapper над navigation store:
- `activeTab` - computed active tab
- `navigateToTab()` - функция навигации
- `isActive()` - проверка активного таба
- `tabs` - список всех табов

## Что показывает приложение

При открытии через кнопку бота "Open Wishlist" пользователь видит:

1. **TabBar** внизу экрана с тремя кнопками:
   - 📰 Feed
   - 👤 Profile
   - 👥 Friends

2. **По умолчанию открыт Feed таб** с placeholder:
   ```
   📰
   Feed
   Placeholder for Feed content
   ```

3. При клике на другие табы - переключение на соответствующие placeholders

## Сборка

```bash
# TypeScript проверка
npm run type-check
✓ Проходит без ошибок

# Production build
npm run build
✓ Собирается успешно
✓ Размер бандла: ~69 KB (27 KB gzipped)

# Dev server
npm run dev
```

## Следующие шаги

Теперь можно постепенно добавлять функционал:
1. Контент для Feed таба
2. Контент для Profile таба
3. Контент для Friends таба
4. Сервисы по мере необходимости
5. Telegram WebApp интеграцию (если нужно)

## Build информация

- **Без ошибок TypeScript**
- **Без ошибок компиляции**
- **Минимальный размер бандла**
- **Lazy loading для всех views**
