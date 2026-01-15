import React from 'react';
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

const FieldCard: React.FC<FieldCardProps> = ({ fields, onSelect, isFavorite, onToggleFavorite, className = '', style, isHighlighted }) => {
    const representativeField = fields[0];
    const isComplex = fields.length > 1;
    const complexId = representativeField.complexId || representativeField.id;

    const displayName = isComplex
        ? representativeField.name.split(' - ')[0]
        : representativeField.name;

    const minPrice = Math.min(...fields.map(f => f.pricePerHour));

    return (
        <div
            className={`bg-bgSurface-light dark:bg-bgSurface-dark rounded-4xl overflow-hidden shadow-premium-light dark:shadow-premium-dark group cursor-pointer transition-all duration-300 border-2 ${
                isHighlighted ? 'border-brand' : 'border-borderDefault-light dark:border-borderDefault-dark'
            } active:scale-[0.98] ${className}`}
            style={style}
            onClick={() => onSelect(representativeField)}
        >
            <div className="relative h-64 overflow-hidden">
                <img 
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    src={representativeField.images[0]} 
                    alt={displayName} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(complexId); }}
                    className="absolute top-4 right-4 bg-white/90 dark:bg-black/40 backdrop-blur-md p-2.5 rounded-full shadow-lg z-10 transition-transform active:scale-75"
                >
                    <HeartIcon isFilled={isFavorite} className={`w-5 h-5 ${isFavorite ? 'text-brand' : 'text-gray-400'}`} />
                </button>

                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-brand text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
                        {representativeField.size}
                    </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-white leading-none tracking-tight drop-shadow-md">{displayName}</h3>
                        <div className="flex items-center gap-1.5 text-gray-100 text-sm font-medium">
                            <LocationIcon className="w-3.5 h-3.5 text-brand" />
                            <span className="drop-shadow-sm">{representativeField.city}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5 flex justify-between items-center bg-bgSurface-light dark:bg-bgSurface-dark">
                <div>
                    <p className="text-[10px] font-black text-textMuted-light dark:text-textMuted-dark uppercase tracking-widest mb-0.5">Precio desde</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-textMain-light dark:text-textMain-dark tracking-tighter">${minPrice.toLocaleString('es-CO')}</span>
                        <span className="text-xs font-bold text-textMuted-light dark:text-textMuted-dark uppercase">/ hr</span>
                    </div>
                </div>
                <button className="bg-brand text-white text-xs font-black px-8 py-3.5 rounded-2xl shadow-button hover:bg-primary-600 active:scale-90 transition-all uppercase tracking-widest">
                    RESERVAR
                </button>
            </div>
        </div>
    );
};

export default FieldCard;
