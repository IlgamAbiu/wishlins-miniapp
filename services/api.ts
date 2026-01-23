import { Event, Wish, User } from '../types';

const API_Base = '/api';

export const syncUser = async (user: Partial<User>) => {
    const res = await fetch(`${API_Base}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return res.json();
};

// Events
export const getMyEvents = async (userId: number) => {
    const res = await fetch(`${API_Base}/events/my?userId=${userId}`);
    return res.json() as Promise<Event[]>;
};

export const getEvent = async (id: number) => {
    const res = await fetch(`${API_Base}/events/${id}`);
    if (!res.ok) throw new Error('Event not found');
    return res.json() as Promise<Event & { owner: User }>;
};

export const createEvent = async (event: { userId: number, title: string, description: string, date: string }) => {
    const res = await fetch(`${API_Base}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
    });
    return res.json() as Promise<Event>;
};

// Wishes
export const getWishes = async (eventId: number) => {
    const res = await fetch(`${API_Base}/events/${eventId}/wishes`);
    return res.json() as Promise<Wish[]>;
};

export const createWish = async (wish: Partial<Wish> & { eventId: number }) => {
    const res = await fetch(`${API_Base}/wishes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wish)
    });
    return res.json() as Promise<Wish>;
};

export const updateWish = async (id: number | string, updates: Partial<Wish>) => {
    const res = await fetch(`${API_Base}/wishes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    return res.json() as Promise<Wish>;
};

export const deleteWish = async (id: number | string) => {
    await fetch(`${API_Base}/wishes/${id}`, { method: 'DELETE' });
};
