import React, { useEffect, useState } from 'react';
import { Plus, Calendar, ChevronRight, Gift } from 'lucide-react';
import { Event } from '../types';

interface EventsListProps {
    events: Event[];
    onSelectEvent: (event: Event) => void;
    onCreateEvent: () => void;
}

const EventsList: React.FC<EventsListProps> = ({ events, onSelectEvent, onCreateEvent }) => {
    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center">
                {/* Hero section matching screenshot 1 */}
                <div className="flex flex-col items-center text-center mt-6 mb-12 px-2">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center p-4 mb-8">
                        <div className="w-full h-full gradient-bg rounded-2xl flex items-center justify-center">
                            <Gift className="text-white" size={32} />
                        </div>
                    </div>

                    <h2 className="text-4xl font-extrabold tracking-tight mb-4">
                        <span className="gradient-text">Wishful Thinking</span>
                    </h2>

                    <p className="text-slate-600 font-medium text-lg leading-snug mb-2">
                        Create wishlists. Share joy. <br /> Get gifts you'll love.
                    </p>

                    <p className="text-slate-400 text-sm max-w-[280px] leading-relaxed mb-10">
                        No more awkward guessing games. Share your wishes with friends and family.
                    </p>

                    <div className="flex flex-col w-full gap-3 px-4">
                        <button
                            onClick={onCreateEvent}
                            className="btn-primary py-4 rounded-full font-bold shadow-xl shadow-pink-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                        >
                            <span>✨</span> Create Your Wishlist <span>→</span>
                        </button>
                        <button className="bg-white border border-slate-100 py-4 rounded-full font-bold text-slate-600 shadow-sm active:bg-slate-50">
                            View Demo
                        </button>
                    </div>
                </div>

                {/* Features section */}
                <div className="grid grid-cols-1 gap-4 w-full">
                    <div className="bg-white p-6 rounded-[2rem] card-shadow border border-slate-50 flex flex-col items-start gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                            <span className="text-2xl">🎁</span>
                        </div>
                        <h4 className="font-bold text-slate-800">Easy to Create</h4>
                        <p className="text-slate-500 text-sm">Add items in seconds with photos, links, and prices</p>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] card-shadow border border-slate-50 flex flex-col items-start gap-3">
                        <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center">
                            <span className="text-2xl">❤️</span>
                        </div>
                        <h4 className="font-bold text-slate-800">Simple Sharing</h4>
                        <p className="text-slate-500 text-sm">One link, endless possibilities. Share anywhere</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {events.map((event) => (
                <div
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className="group bg-white p-5 rounded-3xl card-shadow border border-slate-50 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
                >
                    <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-pink-50">
                        <Calendar size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-slate-800 text-lg leading-tight mb-1 truncate">{event.title}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{event.date || 'Soon'}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                            <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors">
                        <ChevronRight size={20} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EventsList;
