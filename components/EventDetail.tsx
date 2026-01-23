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
        const wish = wishes.find(w => w.id === id);
        if (!wish || isOwner) return;

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
        const url = `https://t.me/share/url?url=${encodeURIComponent(`Посмотри мой вишлист: https://t.me/wishlins_bot?startapp=event_${event.id}`)}`;
        if (window.Telegram?.WebApp?.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(url);
        } else {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen">
            {/* Header / Hero Section */}
            <div className="gradient-bg pt-10 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <button
                        onClick={onBack}
                        className="bg-white/20 backdrop-blur-md p-2 rounded-xl text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    {!isOwner && (
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold">
                            Viewing as Guest
                        </div>
                    )}
                    {isOwner && (
                        <button
                            onClick={handleShare}
                            className="bg-white/20 backdrop-blur-md p-2 rounded-xl text-white hover:bg-white/30 transition-colors"
                        >
                            <Share2 size={20} />
                        </button>
                    )}
                </div>

                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-24 h-24 bg-white rounded-full p-1 shadow-2xl mb-4">
                        <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                            {/* Avatar placeholder or Emoji */}
                            <span className="text-5xl">👤</span>
                        </div>
                    </div>
                    <h1 className="text-white text-3xl font-bold tracking-tight mb-2">
                        {isOwner ? 'Мой Вишлист' : (event as any).owner?.first_name ? `${(event as any).owner.first_name}'s Wishlist` : event.title}
                    </h1>
                    <p className="text-white/80 text-sm max-w-xs leading-relaxed">
                        {event.description || 'Помоги сделать этот день особенным! ✨'}
                    </p>

                    {!isOwner && (
                        <button className="mt-6 bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2">
                            <span>❤️</span> Help make it special
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area (Overlapping the hero) */}
            <div className="max-w-md mx-auto px-6 -mt-10 relative z-20">
                {/* How it works card for guests */}
                {!isOwner && (
                    <div className="bg-[#fff9f0] border border-orange-100 rounded-2xl p-4 mb-6 flex gap-4 card-shadow">
                        <div className="w-10 h-10 secondary-gradient-bg rounded-xl flex items-center justify-center shrink-0">
                            <span className="text-white text-xl">✨</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm mb-1">Как это работает</h3>
                            <p className="text-slate-600 text-xs leading-relaxed">
                                Увидел то, что хочешь подарить? Забронируй! Именинник увидит, что подарок занят, но не узнает кем — так сюрприз сохранится. 🥳
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats board */}
                <div className="bg-white rounded-2xl p-5 mb-8 flex items-center divide-x divide-slate-100 card-shadow">
                    <div className="flex-1 flex flex-col items-center">
                        <span className="text-2xl font-bold text-blue-500">{wishes.filter(w => !w.is_booked).length}</span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1">Доступно</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                        <span className="text-2xl font-bold text-slate-800">{wishes.length}</span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1">Всего</span>
                    </div>
                </div>

                {/* Wishes Grid */}
                <div className="grid grid-cols-2 gap-4">
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

                    {isOwner && (
                        <button
                            onClick={() => { setEditingWish(null); setIsModalOpen(true); }}
                            className="bg-white rounded-2xl border-2 border-dashed border-slate-200 aspect-square flex flex-col items-center justify-center p-4 active:bg-slate-50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                <Plus className="text-slate-400" size={24} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Добавить</span>
                        </button>
                    )}
                </div>

                {wishes.length === 0 && !isOwner && (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-4 text-slate-300">🎁</div>
                        <h3 className="text-lg font-bold text-slate-400">Список пока пуст</h3>
                    </div>
                )}
            </div>

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
