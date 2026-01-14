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
            className={`bg-white rounded-4xl overflow-hidden shadow-premium group cursor-pointer transition-all duration-300 border-2 ${
                isHighlighted ? 'border-brand' : 'border-transparent'
            } ${className}`}
            style={style}
            onClick={() => onSelect(representativeField)}
        >
            <div className="relative aspect-[16/10] overflow-hidden">
                <img 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src={representativeField.images[0]} 
                    alt={displayName} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(complexId); }}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-lg z-10 transition-colors"
                >
                    <HeartIcon isFilled={isFavorite} className={`w-5 h-5 ${isFavorite ? 'text-brand' : 'text-gray-400'}`} />
                </button>

                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-brand/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                        {representativeField.size}
                    </span>
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-textMain leading-tight">{displayName}</h3>
                    <div className="flex items-center gap-1 bg-primary-50 px-2 py-1 rounded-lg">
                        <StarRating rating={representativeField.rating} totalStars={1} className="w-3 h-3" />
                        <span className="text-xs font-bold text-brand">{representativeField.rating}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-textMuted text-sm mb-4">
                    <LocationIcon className="w-4 h-4 opacity-50" />
                    <span className="truncate">{representativeField.city}</span>
                </div>
                
                <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Por hora</p>
                        <p className="text-xl font-black text-textMain">
                            ${minPrice.toLocaleString('es-CO')}
                        </p>
                    </div>
                    <button className="bg-brand text-white text-xs font-bold px-6 py-2.5 rounded-2xl shadow-button hover:bg-primary-600 transition-colors">
                        RESERVAR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FieldCard;