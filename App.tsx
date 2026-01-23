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
  const [events, setEvents] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      let currentUser = MOCK_USER;

      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
        if (tgUser) {
          currentUser = tgUser as any;
        }

        const startParam = window.Telegram.WebApp.initDataUnsafe?.start_param;
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 gradient-bg rounded-2xl mb-4"></div>
          <div className="text-slate-400 font-medium tracking-wide">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-10">
      {currentPage === 'LIST' && (
        <div className="max-w-md mx-auto">
          <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-[#f8fafc]/80 backdrop-blur-md z-10">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Мои события</h1>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Все твои заветные желания</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-200"
            >
              <span className="text-2xl font-light">+</span>
            </button>
          </header>

          <main className="px-6 pt-2">
            <EventsList
              events={events}
              onSelectEvent={(e) => {
                setSelectedEventId(e.id);
                setCurrentPage('DETAIL');
              }}
              onCreateEvent={() => setIsCreateModalOpen(true)}
            />
          </main>

          <CreateEventModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateEvent}
          />
        </div>
      )}

      {currentPage === 'DETAIL' && selectedEventId && user && (
        <EventDetail
          event={events.find(e => e.id === selectedEventId) || { id: selectedEventId, title: 'Загрузка...', user_id: 0, description: '', date: '' } as any}
          currentUserId={user.id}
          onBack={() => {
            setCurrentPage('LIST');
            setSelectedEventId(null);
            loadEvents(user.id);
          }}
        />
      )}
    </div>
  );
};

export default App;