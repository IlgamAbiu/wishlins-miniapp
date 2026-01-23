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
  const isBooked = !!wish.is_booked; // Convert 0/1 to boolean
  const isBookedByMe = isBooked && wish.booked_by_user_id === currentUserId;
  const isBookedByOther = isBooked && wish.booked_by_user_id !== currentUserId;

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={`${i < count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 relative overflow-hidden">
      {!isOwner && isBooked && (
        <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold ${isBookedByMe ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {isBookedByMe ? 'Вы забронировали' : 'Занято'}
        </div>
      )}

      {isOwner && isBooked && (
        <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold bg-purple-100 text-purple-700">
          Забронировано кем-то
        </div>
      )}

      <div className="flex gap-4">
        {wish.image_url && (
          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
            <img src={wish.image_url} alt={wish.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            {renderStars(wish.priority)}
          </div>

          <h3 className="font-semibold text-lg text-gray-800 leading-tight truncate">
            {wish.title}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            {wish.price ? (
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                {wish.price} {wish.currency}
              </span>
            ) : null}
            {wish.url && (
              <a href={wish.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 flex items-center gap-1 text-xs">
                <ExternalLink size={12} /> Ссылка
              </a>
            )}
          </div>

          {wish.comment && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {wish.comment}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2 justify-end">
        {isOwner ? (
          <>
            <button
              onClick={() => onDelete(wish.id)}
              className="p-2 text-red-500 bg-red-50 rounded-lg active:scale-95 transition-transform"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => onEdit(wish)}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg active:scale-95 transition-transform flex items-center gap-2"
            >
              <Edit2 size={16} /> Изменить
            </button>
          </>
        ) : (
          /* Guest Actions */
          <>
            {isBookedByOther ? (
              <button
                disabled
                className="px-4 py-2 bg-gray-200 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed flex items-center gap-2 w-full justify-center"
              >
                <Ban size={16} /> Занято
              </button>
            ) : isBookedByMe ? (
              <button
                onClick={() => onBook(wish.id)}
                className="px-4 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-lg active:scale-95 transition-transform flex items-center gap-2 w-full justify-center"
              >
                <Ban size={16} /> Отменить бронь
              </button>
            ) : (
              <button
                onClick={() => onBook(wish.id)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg active:scale-95 transition-transform flex items-center gap-2 w-full justify-center shadow-md shadow-blue-200"
              >
                <Gift size={18} /> Я подарю это
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WishCard;