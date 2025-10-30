import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/XIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface ImageLightboxProps {
    images: string[];
    startIndex: number;
    onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    const goToPrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isFirst = currentIndex === 0;
        const newIndex = isFirst ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isLast = currentIndex === images.length - 1;
        const newIndex = isLast ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goToPrevious(e as any);
            if (e.key === 'ArrowRight') goToNext(e as any);
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);


    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <button
                className="absolute top-4 right-4 text-white/70 hover:text-white z-20 p-2 bg-black/30 rounded-full"
                onClick={onClose}
                aria-label="Cerrar galería"
            >
                <XIcon className="w-8 h-8" />
            </button>

            {images.length > 1 && (
                 <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-20 p-3 bg-black/30 rounded-full"
                    onClick={goToPrevious}
                    aria-label="Imagen anterior"
                >
                    <ChevronLeftIcon className="w-8 h-8" />
                </button>
            )}

            <div className="relative max-w-screen-lg max-h-[90vh] w-full p-4" onClick={e => e.stopPropagation()}>
                <img
                    key={currentIndex}
                    src={images[currentIndex]}
                    alt={`Imagen ${currentIndex + 1}`}
                    className="w-full h-full object-contain animate-fade-in"
                />
            </div>
            
            {images.length > 1 && (
                 <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-20 p-3 bg-black/30 rounded-full"
                    onClick={goToNext}
                    aria-label="Siguiente imagen"
                >
                    <ChevronRightIcon className="w-8 h-8" />
                </button>
            )}

            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
};

export default ImageLightbox;