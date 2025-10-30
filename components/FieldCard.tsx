import React, { useState, useMemo } from 'react';
import type { SoccerField } from '../types';
import StarRating from './StarRating';
import { LocationIcon } from './icons/LocationIcon';
import { HeartIcon } from './icons/HeartIcon';

interface FieldCardProps {
    fields: SoccerField[];
    onSelect: (field: SoccerField) => void;
    isFavorite: boolean;
    onToggleFavorite: (complexId: string) => void;
    className?: string;
    style?: React.CSSProperties;
    onHover?: (complexId: string | null) => void;
    isHighlighted?: boolean;
}

const FieldCard: React.FC<FieldCardProps> = ({ fields, onSelect, isFavorite, onToggleFavorite, className = '', style, onHover, isHighlighted }) => {
    const [isBouncing, setIsBouncing] = useState(false);

    const representativeField = fields[0];
    const isComplex = fields.length > 1;
    const complexId = representativeField.complexId || representativeField.id;

    const displayName = isComplex
        ? representativeField.name.split(' - ')[0]
        : representativeField.name;

    const priceDisplay = isComplex
        ? `Desde $${Math.min(...fields.map(f => f.pricePerHour)).toLocaleString('es-CO')}`
        : `$${representativeField.pricePerHour.toLocaleString('es-CO')} / hora`;

    const availableSizes = useMemo(() => {
        if (!isComplex) return [representativeField.size];
        const sizes = new Set(fields.map(f => f.size));
        return Array.from(sizes);
    }, [fields, isComplex, representativeField.size]);
    
    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click event from firing
        onToggleFavorite(complexId);
        if (!isFavorite) {
            setIsBouncing(true);
            setTimeout(() => setIsBouncing(false), 800);
        }
    };

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-none dark:border overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isHighlighted ? 'border-[var(--color-primary-500)] ring-2 ring-[var(--color-primary-500)]' : 'dark:border-gray-700 dark:hover:border-[var(--color-primary-600)]'} ${className}`}
            style={style}
            onClick={() => onSelect(representativeField)}
            onMouseEnter={() => onHover?.(complexId)}
            onMouseLeave={() => onHover?.(null)}
            aria-label={`Ver detalles de ${displayName}`}
        >
            <div className="relative">
                <div className="aspect-video w-full">
                    <img className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" src={representativeField.images[0]} alt={displayName} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10"></div>
                
                <button 
                    onClick={handleFavoriteClick}
                    className={`absolute top-3 right-3 bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm p-2 rounded-full z-10 transition-transform ${isBouncing ? 'animate-heartbeat' : 'transform hover:scale-110'}`}
                    aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                >
                    <HeartIcon isFilled={isFavorite} className="w-5 h-5" />
                </button>
                
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {availableSizes.map(size => (
                        <span key={size} className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] font-bold py-1 px-3 rounded-full text-sm">
                            {size}
                        </span>
                    ))}
                </div>
                <div className="absolute bottom-3 left-4 text-white">
                    <h2 className="text-xl font-bold leading-tight" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.8)'}}>{displayName}</h2>
                    <div className="flex items-center mt-1">
                        <StarRating rating={representativeField.rating} />
                        <span className="ml-2 text-xs opacity-90">({representativeField.reviews.length} opiniones)</span>
                    </div>
                </div>
            </div>
            <div className="p-4">
                <p className="text-gray-600 dark:text-gray-400 flex items-center text-sm mb-3">
                    <LocationIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{representativeField.city}</span>
                    {representativeField.distance !== undefined && (
                        <span className="ml-2 pl-2 border-l border-gray-300 dark:border-gray-600 font-medium text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]">
                            {representativeField.distance.toFixed(1)} km
                        </span>
                    )}
                </p>
                <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {priceDisplay}
                        {!isComplex && <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> / hora</span>}
                    </p>
                    <div className="bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)]/50 dark:text-[var(--color-primary-400)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-200)] dark:hover:bg-[var(--color-primary-900)]/80 transition-colors text-sm">
                        Ver Detalles
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FieldCard;