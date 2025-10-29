import React from 'react';
import type { Review } from '../types';
import { XIcon } from './icons/XIcon';
import { UserIcon } from './icons/UserIcon';
import StarRating from './StarRating';

interface ReviewsModalProps {
    fieldName: string;
    reviews: Review[];
    onClose: () => void;
}

const ReviewItem: React.FC<{ review: Review }> = ({ review }) => (
    <div className="bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg">
        <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center mr-4 flex-shrink-0">
                <UserIcon className="w-6 h-6 text-slate-500 dark:text-gray-400" />
            </div>
            <div className="flex-1">
                <div className="flex items-center mb-1">
                    <p className="font-bold text-gray-800 dark:text-gray-200">{review.author}</p>
                    <div className="ml-auto">
                        <StarRating rating={review.rating} />
                    </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.comment}</p>
            </div>
        </div>
    </div>
);

const ReviewsModal: React.FC<ReviewsModalProps> = ({ fieldName, reviews, onClose }) => {
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg m-4 flex flex-col animate-slide-in-up"
                style={{ maxHeight: '85vh' }}
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Opiniones de {fieldName} ({reviews.length})
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Cerrar"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    <div className="space-y-4">
                        {reviews.map(review => (
                            <ReviewItem key={review.id} review={review} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ReviewsModal;