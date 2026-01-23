import React, { useEffect, useState } from 'react';
import { Plus, Calendar, ChevronRight, Gift } from 'lucide-react';
import { Event } from '../types';

interface EventsListProps {
    events: Event[];
    onSelectEvent: (event: Event) => void;
    onCreateEvent: () => void;
}

const EventsList: React.FC<EventsListProps> = ({ events, onSelectEvent, onCreateEvent }) => {
    return (
        <div className="p-4 space-y-4">
            {events.length === 0 ? (
                <div className="text-center mt-10">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift className="text-blue-500" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-700">Нет событий</h2>
                    <p className="text-gray-500 mt-2">Создай свое первое событие и добавь подарки!</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            onClick={() => onSelectEvent(event)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{event.title}</h3>
                                    <p className="text-sm text-gray-500">{event.date || 'Без даты'}</p>
                                </div>
                            </div>
                            <ChevronRight className="text-gray-300" size={20} />
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={onCreateEvent}
                className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform"
            >
                <Plus size={28} />
            </button>
        </div>
    );
};

export default EventsList;
