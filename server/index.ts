import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import bot from './bot.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

const PORT = process.env.PORT || 2800;

// --- API ROUTES ---

// 1. Auth / Sync User
app.post('/api/auth', (req, res) => {
    const { id, first_name, last_name, username, photo_url } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing user ID' });

    try {
        const stmt = db.prepare(`
      INSERT INTO users (id, first_name, last_name, username, photo_url)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        username = excluded.username,
        photo_url = excluded.photo_url
    `);
        stmt.run(id, first_name, last_name || null, username || null, photo_url || null);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// 2. Events
// Get events for a user (My Events)
app.get('/api/events/my', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const events = db.prepare('SELECT * FROM events WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    res.json(events);
});

// Get a specific event (Public/Shared view)
app.get('/api/events/:id', (req, res) => {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id) as any;
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Get owner info
    const owner = db.prepare('SELECT id, first_name, username, photo_url FROM users WHERE id = ?').get(event.user_id);

    res.json({ ...event, owner });
});

// Create Event
app.post('/api/events', (req, res) => {
    const { userId, title, description, date } = req.body;

    try {
        const result = db.prepare('INSERT INTO events (user_id, title, description, date) VALUES (?, ?, ?, ?)').run(userId, title, description, date);
        res.json({ id: result.lastInsertRowid, userId, title, description, date });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// 3. Wishes
// Get wishes for an event
app.get('/api/events/:id/wishes', (req, res) => {
    const wishes = db.prepare('SELECT * FROM wishes WHERE event_id = ? ORDER BY priority DESC').all(req.params.id);
    res.json(wishes);
});

// Add Wish
app.post('/api/wishes', (req, res) => {
    const { eventId, title, url, price, currency, priority, comment, image_url } = req.body;
    try {
        const result = db.prepare(`
       INSERT INTO wishes (event_id, title, url, price, currency, priority, comment, image_url, is_booked)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
     `).run(eventId, title, url, price, currency, priority, comment, image_url);
        res.json({ id: result.lastInsertRowid, ...req.body });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to add wish' });
    }
});

// Update/Book Wish
app.put('/api/wishes/:id', (req, res) => {
    const { isBooked, bookedByUserId, title, price, priority, comment, image_url } = req.body;
    const wishId = req.params.id;

    try {
        let stmt;
        if (isBooked !== undefined) {
            // Toggle booking
            stmt = db.prepare('UPDATE wishes SET is_booked = ?, booked_by_user_id = ? WHERE id = ?');
            stmt.run(isBooked ? 1 : 0, isBooked ? bookedByUserId : null, wishId);
        } else {
            // General update
            stmt = db.prepare('UPDATE wishes SET title = ?, price = ?, priority = ?, comment = ?, image_url = ? WHERE id = ?');
            stmt.run(title, price, priority, comment, image_url, wishId);
        }

        // Return updated wish
        const updated = db.prepare('SELECT * FROM wishes WHERE id = ?').get(wishId);
        res.json(updated);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update wish' });
    }
});

app.delete('/api/wishes/:id', (req, res) => {
    db.prepare('DELETE FROM wishes WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});


// Make sure this is AFTER all api routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Launch
bot.launch(() => {
    console.log('Bot is running...');
}).catch((err) => {
    console.error("Bot launch failed (check BOT_TOKEN):", err.message);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
