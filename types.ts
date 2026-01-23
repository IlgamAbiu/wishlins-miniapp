export type PriorityLevel = 1 | 2 | 3 | 4 | 5;

export interface Wish {
  id: number;
  event_id: number;
  title: string;
  url?: string;
  price?: number;
  currency: string;
  priority: PriorityLevel;
  comment?: string;
  image_url?: string;
  created_at: number;

  // Booking Logic
  is_booked: number; // 0 or 1
  booked_by_user_id?: number;
}

export interface User {
  id: number; // Telegram User ID
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  isOwner?: boolean;
}

export interface Event {
  id: number;
  user_id: number;
  title: string;
  date?: string;
  description?: string;
  created_at: number;
}

export enum ViewMode {
  OWNER = 'OWNER',
  GUEST = 'GUEST'
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        initDataUnsafe?: {
          user?: User;
          start_param?: string;
        };
        openTelegramLink: (url: string) => void;
        close: () => void;
      };
    };
  }
}