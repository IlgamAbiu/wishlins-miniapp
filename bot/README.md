# Wishlist Telegram Bot

Telegram bot service built with aiogram 3.x.

## Architecture

```
src/
├── handlers/               # Command handlers
│   └── start.py            # /start command
│
├── keyboards/              # UI components
│   └── main.py             # Keyboard builders
│
├── api/                    # Backend client
│   └── client.py           # HTTP client
│
├── config.py               # Configuration
└── main.py                 # Entry point
```

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Add your TELEGRAM_BOT_TOKEN

# Start bot
python -m src.main
```

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Start the bot and register user |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather | Yes |
| `MINIAPP_URL` | Mini App URL | Yes |
| `BACKEND_API_URL` | Backend API URL | Yes |
| `BACKEND_API_TIMEOUT` | API timeout (seconds) | No (default: 30) |

## Creating a Bot

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` and follow instructions
3. Copy the bot token to your `.env` file

## Configuring Mini App

1. Message [@BotFather](https://t.me/botfather)
2. Send `/mybots` and select your bot
3. Go to "Bot Settings" → "Menu Button"
4. Configure the Mini App URL
