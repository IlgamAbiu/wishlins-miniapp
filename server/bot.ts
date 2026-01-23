import { Telegraf } from 'telegraf';
import db from './db.js';

const bot = new Telegraf(process.env.BOT_TOKEN || '');

const WEB_APP_URL = process.env.WEB_APP_URL || 'http://localhost:5173';

bot.start((ctx) => {
    const userId = ctx.from.id;
    const startPayload = ctx.payload; // e.g., "event_123"

    // If launched with a payload (e.g. sharing link), we can direct them (frontend handles routing)
    // But for the bot chat UI strings:

    ctx.reply('Привет! Это твой Вишлист-бот. 🎁\n\nСоздавай списки желаний и делись ими с друзьями!', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Открыть Вишлист', web_app: { url: WEB_APP_URL } }
                ]
            ]
        }
    });

    // Ensure user exists in DB on first interaction (optional, but good for sync)
    try {
        const stmt = db.prepare(`
       INSERT INTO users (id, first_name, last_name, username)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         first_name = excluded.first_name,
         last_name = excluded.last_name,
         username = excluded.username
     `);
        stmt.run(userId, ctx.from.first_name, ctx.from.last_name, ctx.from.username);
    } catch (e) {
        console.error('Error saving user from bot start:', e);
    }
});

export default bot;
