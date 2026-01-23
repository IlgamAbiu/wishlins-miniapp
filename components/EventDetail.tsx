import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Share2 } from 'lucide-react';
import { Event, Wish, ViewMode } from '../types';
import WishCard from './WishCard';
import AddWishModal from './AddWishModal';
import * as api from '../services/api';

interface EventDetailProps {
    event: Event;
    currentUserId: number;
    onBack: () => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, currentUserId, onBack }) => {
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWish, setEditingWish] = useState<Wish | null>(null);

    const isOwner = event.user_id === currentUserId;
    const viewMode = isOwner ? ViewMode.OWNER : ViewMode.GUEST;

    useEffect(() => {
        loadWishes();
    }, [event.id]);

    const loadWishes = async () => {
        try {
            const data = await api.getWishes(event.id);
            setWishes(data);
        } catch (e) {
            console.error('Failed to load wishes', e);
        }
    };

    const handleSaveWish = async (wishData: any) => {
        try {
            if (editingWish) {
                await api.updateWish(editingWish.id, wishData);
            } else {
                await api.createWish({ ...wishData, eventId: event.id });
            }
            loadWishes();
            setIsModalOpen(false);
        } catch (e) {
            alert('Ошибка при сохранении');
        }
    };

    const handleDeleteWish = async (id: number) => {
        if (!window.confirm('Удалить желание?')) return;
        try {
            await api.deleteWish(id);
            loadWishes();
        } catch (e) {
            alert('Не удалось удалить');
        }
    };

    const handleBookWish = async (id: number) => {
        // Determine current state based on wishes
        const wish = wishes.find(w => w.id === id);
        if (!wish) return;

        if (isOwner) return; // Owners can't book their own gifts usually

        const isCurrentlyBooked = !!wish.is_booked;
        const newBookedState = !isCurrentlyBooked;

        try {
            await api.updateWish(id, {
                isBooked: newBookedState,
                bookedByUserId: newBookedState ? currentUserId : undefined
            } as any);
            loadWishes();
        } catch (e) {
            console.error(e);
            alert('Ошибка бронирования');
        }
    };

    const handleShare = () => {
        // This needs to match the bot's start param logic
        const url = `https://t.me/share/url?url=${encodeURIComponent(`Check out my wishlist: https://t.me/CHANGE_MY_BOT_NAME?startapp=event_${event.id}`)}`;

        if (window.Telegram?.WebApp?.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(url);
        } else {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1 text-center mx-2">
                    <h1 className="font-bold truncate">{event.title}</h1>
                    <p className="text-xs text-gray-500">{wishes.length} желаний</p>
                </div>
                {isOwner && (
                    <button onClick={handleShare} className="p-2 -mr-2 text-blue-600 rounded-full active:bg-blue-50">
                        <Share2 size={24} />
                    </button>
                )}
            </div>

            {/* List */}
            <div className="p-4 space-y-4">
                {wishes.map(wish => (
                    <WishCard
                        key={wish.id}
                        wish={wish}
                        viewMode={viewMode}
                        currentUserId={currentUserId}
                        onEdit={(w) => { setEditingWish(w); setIsModalOpen(true); }}
                        onDelete={() => handleDeleteWish(wish.id)}
                        onBook={() => handleBookWish(wish.id)}
                    />
                ))}

                {wishes.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                        Здесь пока пусто.
                    </div>
                )}
            </div>

            {/* FAB */}
            {isOwner && (
                <button
                    onClick={() => { setEditingWish(null); setIsModalOpen(true); }}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform z-20"
                >
                    <Plus size={28} />
                </button>
            )}

            <AddWishModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={(data) => handleSaveWish(data)}
                initialWish={editingWish}
            />
        </div>
    );
};

export default EventDetail;
