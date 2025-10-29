import React, { useState } from 'react';
import type { SoccerField } from '../types';
import { XIcon } from './icons/XIcon';
import { StarIcon } from './icons/StarIcon';

interface RatingModalProps {
    field: SoccerField;
    onClose: () => void;
    onSubmit: (fieldId: string, rating: number, comment: string) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ field, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        if (rating > 0) {
            onSubmit(field.id, rating, comment);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md m-4 p-6 text-center animate-slide-in-up"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <XIcon className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">¡Felicidades!</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Disfruta tu cancha gratis. Antes de irte, ¿qué tal te pareció tu última experiencia en <strong className="text-gray-800 dark:text-gray-200">{field.name}</strong>?
                </p>

                <div className="my-6 flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="text-yellow-400 transition-transform transform hover:scale-125"
                        >
                            <StarIcon
                                className="w-10 h-10"
                                isFilled={(hoverRating || rating) >= star}
                            />
                        </button>
                    ))}
                </div>

                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Deja una opinión (opcional)..."
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-gray-700/50 rounded-lg p-3 border-transparent focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent transition"
                />

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        className="w-full py-2 px-5 rounded-lg font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                        Ahora no
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0}
                        className="w-full py-2 px-5 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Enviar Calificación
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;
