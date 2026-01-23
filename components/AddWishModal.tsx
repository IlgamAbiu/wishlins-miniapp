import React, { useState, useEffect } from 'react';
import { Wish, PriorityLevel } from '../types';
import { X, Star, Link as LinkIcon, DollarSign, Type } from 'lucide-react';

interface AddWishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wish: Partial<Wish>) => void;
  initialWish?: Wish | null;
}

const AddWishModal: React.FC<AddWishModalProps> = ({ isOpen, onClose, onSave, initialWish }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [comment, setComment] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>(3);

  useEffect(() => {
    if (initialWish) {
      setTitle(initialWish.title);
      setPrice(initialWish.price?.toString() || '');
      setUrl(initialWish.url || '');
      setComment(initialWish.comment || '');
      setPriority(initialWish.priority);
    } else {
      resetForm();
    }
  }, [initialWish, isOpen]);

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setUrl('');
    setComment('');
    setPriority(3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalUrl = url;
    if (url && !url.startsWith('http')) {
      finalUrl = `https://${url}`;
    }

    // We pass a partial wish object. ID and EventID are handled by parent/backend
    const newWish: any = {
      title,
      price: price ? parseFloat(price) : undefined,
      currency: '₽',
      url: finalUrl,
      priority,
      comment,
      image_url: initialWish?.image_url,
    };

    onSave(newWish);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-slide-up sm:animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {initialWish ? 'Редактировать' : 'Новое желание'}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">Название</label>
            <div className="relative">
              <Type className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                required
                type="text"
                placeholder="например, Яндекс Станция"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">Ссылка (необязательно)</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">Цена (₽)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="number"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Как сильно хочется?</label>
            <div className="flex justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPriority(star as PriorityLevel)}
                  className="focus:outline-none transform transition-transform active:scale-110"
                >
                  <Star
                    size={28}
                    className={`${star <= priority ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">Комментарий / Описание</label>
            <textarea
              rows={3}
              placeholder="Цвет, размер, или почему это так важно..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all mt-4"
          >
            {initialWish ? 'Сохранить' : 'Добавить'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddWishModal;