import React from 'react';
import { Wish, ViewMode } from '../types';
import { Star, ExternalLink, Trash2, Edit2, Gift, Ban } from 'lucide-react';

interface WishCardProps {
  wish: Wish;
  viewMode: ViewMode;
  currentUserId: number;
  onEdit: (wish: Wish) => void;
  onDelete: (id: number) => void;
  onBook: (id: number) => void;
}

const WishCard: React.FC<WishCardProps> = ({
  wish,
  viewMode,
  currentUserId,
  onEdit,
  onDelete,
  onBook
}) => {
  const isOwner = viewMode === ViewMode.OWNER;

  // Status Logic
  const isBooked = !!wish.is_booked;
  const isBookedByMe = isBooked && wish.booked_by_user_id === currentUserId;
  const isBookedByOther = isBooked && wish.booked_by_user_id !== currentUserId;

  return (
    <div className="bg-white rounded-3xl overflow-hidden card-shadow flex flex-col h-full group relative">
      {/* Photo Area */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        {wish.image_url ? (
          <img src={wish.image_url} alt={wish.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Gift size={48} strokeWidth={1} />
          </div>
        )}

        {/* Reserved Badge */}
        {isBooked && (
          <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-sm z-10 ${isBookedByMe ? 'bg-green-500/90 text-white' : 'bg-purple-600/90 text-white'}`}>
            <div className={`w-1.5 h-1.5 rounded-full bg-white animate-pulse`}></div>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isBookedByMe ? 'Забронировано вами' : 'Reserved'}
            </span>
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 leading-tight">
          {wish.title}
        </h3>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-purple-600 font-extrabold text-base">
            {wish.price ? `${wish.price} ${wish.currency === 'RUB' ? '₽' : wish.currency}` : 'Цена не указана'}
          </span>
          {wish.url && (
            <a href={wish.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 p-1">
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* Action Button for Guests */}
        {!isOwner && (
          <div className="mt-4">
            {isBookedByOther ? (
              <div className="text-center py-2 flex flex-col items-center gap-1">
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-tight">Someone is planning to gift this! 🎁</p>
              </div>
            ) : (
              <button
                onClick={() => onBook(wish.id)}
                className={`w-full py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${isBookedByMe ? 'bg-red-50 text-red-500 border border-red-100' : 'btn-primary shadow-lg shadow-pink-100'}`}
              >
                {isBookedByMe ? <Ban size={14} /> : <Gift size={14} />}
                {isBookedByMe ? 'Отменить бронь' : 'Reserve This Gift'}
              </button>
            )}
          </div>
        )}

        {/* Action Buttons for Owner */}
        {isOwner && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onEdit(wish)}
              className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(wish.id)}
              className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishCard;