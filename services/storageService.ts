import { Wish } from "../types";
import { STORAGE_KEYS, DEFAULT_WISHES } from "../constants";

export const getWishes = (): Wish[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WISHES);
    if (!stored) {
      // Seed with default data for the demo
      localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(DEFAULT_WISHES));
      return DEFAULT_WISHES;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load wishes", e);
    return [];
  }
};

export const saveWish = (wish: Wish): Wish[] => {
  const wishes = getWishes();
  const existingIndex = wishes.findIndex(w => w.id === wish.id);
  
  let newWishes;
  if (existingIndex >= 0) {
    newWishes = [...wishes];
    newWishes[existingIndex] = wish;
  } else {
    newWishes = [wish, ...wishes];
  }
  
  localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(newWishes));
  return newWishes;
};

export const deleteWish = (id: string): Wish[] => {
  const wishes = getWishes();
  const newWishes = wishes.filter(w => w.id !== id);
  localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(newWishes));
  return newWishes;
};

export const toggleBooking = (wishId: string, userId: string): Wish[] => {
  const wishes = getWishes();
  const newWishes = wishes.map(w => {
    if (w.id !== wishId) return w;

    // Logic: If booked by ME, unbook. If not booked, book it. 
    // If booked by someone else, do nothing (should be handled in UI).
    if (w.isBooked && w.bookedByUserId === userId) {
      return { ...w, isBooked: false, bookedByUserId: undefined };
    } else if (!w.isBooked) {
      return { ...w, isBooked: true, bookedByUserId: userId };
    }
    return w;
  });
  
  localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(newWishes));
  return newWishes;
};