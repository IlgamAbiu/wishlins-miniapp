# Wishlist Mini App Frontend

Vue 3 + TypeScript frontend for the Telegram Mini App.

## Architecture

```
src/
├── api/                    # API Layer
│   └── client.ts           # Backend HTTP client
│
├── composables/            # Vue Composables
│   └── useTelegram.ts      # Telegram WebApp SDK
│
├── components/             # Reusable Components
│   ├── Header.vue          # App header
│   └── EmptyState.vue      # Empty wishlist state
│
├── pages/                  # Page Components
│   └── WishlistPage.vue    # Main wishlist page
│
├── types/                  # TypeScript Types
│   └── index.ts            # Type definitions
│
├── App.vue                 # Root component
└── main.ts                 # Entry point
```

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

## Telegram WebApp SDK

The app integrates with Telegram WebApp SDK via the `useTelegram` composable:

```typescript
import { useTelegram } from '@/composables/useTelegram'

const {
  user,           // Telegram user data
  displayName,    // Formatted display name
  avatarUrl,      // User avatar URL
  isInTelegram,   // Running inside Telegram
  colorScheme,    // 'light' or 'dark'
} = useTelegram()
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

## Development with ngrok

For testing inside Telegram:

```bash
# Start frontend
npm run dev

# In another terminal, expose with ngrok
ngrok http 5173
```

Use the ngrok URL as your Mini App URL in BotFather.

## Theme Integration

The app automatically applies Telegram theme colors. CSS variables:

- `--tg-bg-color`
- `--tg-text-color`
- `--tg-hint-color`
- `--tg-link-color`
- `--tg-button-color`
- `--tg-button-text-color`
- `--tg-secondary-bg-color`
