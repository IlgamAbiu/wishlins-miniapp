import React, { useState, useEffect } from 'react';
import { User } from './types';
import * as api from './services/api';
import EventsList from './components/EventsList';
import EventDetail from './components/EventDetail';
import CreateEventModal from './components/CreateEventModal';

// Mock User for Dev
const MOCK_USER = {
  id: 123456789,
  first_name: 'Dev',
  last_name: 'User',
  username: 'dev_user',
  photo_url: '',
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [events, setEvents] = useState<any[]>([]); // Using any for simplicity in mapping
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Auth & Init
  useEffect(() => {
    const initApp = async () => {
      let currentUser = MOCK_USER;

      // Check Telegram WebApp
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
        if (tgUser) {
          currentUser = tgUser as any;
        }

        // Handle Start Parameters (Deep Linking)
        // e.g., t.me/bot?startapp=event_123
        const startParam = window.Telegram.WebApp.initDataUnsafe?.start_param; // "event_123"
        if (startParam && startParam.startsWith('event_')) {
          const eventId = parseInt(startParam.split('_')[1]);
          if (!isNaN(eventId)) {
            setSelectedEventId(eventId);
            setCurrentPage('DETAIL');
          }
        }
      }

      setUser(currentUser);
      await api.syncUser(currentUser);

      // Load my events
      await loadEvents(currentUser.id);

      setLoading(false);
    };

    initApp();
  }, []);

  const loadEvents = async (userId: number) => {
    try {
      const myEvents = await api.getMyEvents(userId);
      setEvents(myEvents);
    } catch (e) {
      console.error('Failed to load events', e);
    }
  };

  const handleCreateEvent = async (title: string, date: string, description: string) => {
    if (!user) return;
    try {
      await api.createEvent({ userId: user.id, title, date, description });
      await loadEvents(user.id);
      setIsCreateModalOpen(false);
    } catch (e) {
      alert('Error creating event');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {currentPage === 'LIST' && (
        <React.Fragment>
          <header className="px-5 py-4 bg-white shadow-sm flex items-center justify-between">
            <h1 className="text-xl font-bold">Мои события</h1>
            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
              {user?.photo_url && <img src={user.photo_url} alt="Profile" />}
            </div>
          </header>

          <EventsList
            events={events}
            onSelectEvent={(e) => {
              setSelectedEventId(e.id);
              setCurrentPage('DETAIL');
            }}
            onCreateEvent={() => setIsCreateModalOpen(true)}
          />

          <CreateEventModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateEvent}
          />
        </React.Fragment>
      )}

      {currentPage === 'DETAIL' && selectedEventId && user && (
        <EventDetail
          event={events.find(e => e.id === selectedEventId) || { id: selectedEventId, title: 'Загрузка...', user_id: 0 } as any}
          currentUserId={user.id}
          onBack={() => {
            setCurrentPage('LIST');
            setSelectedEventId(null);
            loadEvents(user.id); // Refresh on back
          }}
        />
      )}
    </div>
  );
};

export default App;