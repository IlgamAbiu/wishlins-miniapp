import { Wish } from "./types";

export const STORAGE_KEYS = {
  WISHES: 'wishlist_app_wishes',
  USER_MODE: 'wishlist_app_mode', // To persist the demo toggle state
};

export const MOCK_USER_ID = 'user_123_owner';
export const MOCK_GUEST_ID = 'user_456_guest';

export const DEFAULT_WISHES: Wish[] = [
  {
    id: '1',
    title: 'Наушники с шумоподавлением',
    price: 29990,
    currency: '₽',
    priority: 5,
    comment: 'Очень нужны для работы, чтобы не отвлекаться!',
    url: 'https://market.yandex.ru/headphones',
    imageUrl: 'https://picsum.photos/200/200?random=1',
    createdAt: Date.now(),
    isBooked: false,
  },
  {
    id: '2',
    title: 'Керамический набор для кофе',
    price: 4500,
    currency: '₽',
    priority: 3,
    comment: 'Пожалуйста, именно синего цвета.',
    imageUrl: 'https://picsum.photos/200/200?random=2',
    createdAt: Date.now() - 10000,
    isBooked: true,
    bookedByUserId: 'some_other_friend', // Booked by someone else
  },
  {
    id: '3',
    title: 'Механическая клавиатура',
    price: 12000,
    currency: '₽',
    priority: 4,
    url: 'https://market.yandex.ru/keyboard',
    createdAt: Date.now() - 20000,
    isBooked: false,
  }
];