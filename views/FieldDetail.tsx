import React, { useState, useMemo } from 'react';
import type { SoccerField, ConfirmedBooking, WeatherData } from '../types';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';
import StarRating from '../components/StarRating';
import { LocationIcon } from '../components/icons/LocationIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import WeatherIcon from '../components/icons/WeatherIcon';
import { mapWmoCodeToIcon } from '../utils/weatherUtils';

interface ComplexDisplayData {
    name: string;
    address: string;
    city: string;
    description: string;
    images: string[];
    services: { name: string; icon: string }[];
    fields: SoccerField[];
}

interface FieldDetailProps {
    complex: ComplexDisplayData;
    initialFieldId: string;
    onBookNow: (field: SoccerField, time: string, date: Date) => void;
    onBack: () => void;
    favoriteFields: string[];
    onToggleFavorite: (complexId: string) => void;
    allBookings: ConfirmedBooking[];
    weatherData: WeatherData | null;
}

const FieldDetail: React.FC<FieldDetailProps> = ({ 
    complex, initialFieldId, onBookNow, onBack, favoriteFields, onToggleFavorite, weatherData 
}) => {
    const [selectedFieldId, setSelectedFieldId] = useState(initialFieldId);
    const selectedField = complex.fields.find(f => f.id === selectedFieldId) || complex.fields[0];
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const isFavorite = favoriteFields.includes(selectedField.complexId || selectedField.id);
    const availableHours = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

    const nextDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            return date;
        });
    }, []);

    const isSameDay = (d1: Date, d2: Date) => 
        d1.getDate() === d2.getDate() && 
        d1.getMonth() === d2.getMonth() && 
        d1.getFullYear() === d2.getFullYear();

    return (
        <div className="bg-bgMain-light dark:bg-bgMain-dark min-h-screen pb-44 animate-ios transition-colors">
            {/* Header Adaptativo */}
            <div className="relative h-[40vh] overflow-hidden">
                <img 
                    src={complex.images[0]} 
                    className="w-full h-full object-cover" 
                    alt={complex.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bgMain-light dark:from-bgMain-dark via-transparent to-black/20"></div>
                
                <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-20">
                    <button 
                        onClick={onBack}
                        className="bg-bgSurface-light/90 dark:bg-bgSurface-dark/90 backdrop-blur-xl p-3 rounded-2xl shadow-premium-light dark:shadow-premium-dark active:scale-90 transition-all border border-borderDefault-light dark:border-borderDefault-dark"
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-textMain-light dark:text-textMain-dark" />
                    </button>
                    
                    <button 
                        onClick={() => onToggleFavorite(selectedField.complexId || selectedField.id)}
                        className="bg-bgSurface-light/90 dark:bg-bgSurface-dark/90 backdrop-blur-xl p-3 rounded-2xl shadow-premium-light dark:shadow-premium-dark active:scale-90 transition-all border border-borderDefault-light dark:border-borderDefault-dark"
                    >
                        <HeartIcon isFilled={isFavorite} className={`w-6 h-6 ${isFavorite ? 'text-brand' : 'text-textMuted-light dark:text-textMuted-dark'}`} />
                    </button>
                </div>

                <div className="absolute bottom-12 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-brand text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Premium</span>
                        <div className="flex items-center gap-1 bg-bgSurface-light/90 dark:bg-bgSurface-dark/90 backdrop-blur-md px-2 py-1 rounded-full border border-borderDefault-light dark:border-borderDefault-dark">
                            <StarRating rating={selectedField.rating} totalStars={1} className="w-3 h-3 text-brand" />
                            <span className="text-xs font-black text-textMain-light dark:text-textMain-dark">{selectedField.rating}</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-textMain-light dark:text-textMain-dark tracking-tighter uppercase italic drop-shadow-sm">{complex.name}</h1>
                </div>
            </div>

            <div className="relative -mt-8 px-6 space-y-8">
                {/* Detalles Rápidos Adaptativos */}
                <div className="flex items-center gap-6 overflow-x-auto ios-scroller py-2">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-10 h-10 bg-bgSurface-light dark:bg-bgSurface-dark rounded-xl flex items-center justify-center shadow-sm border border-borderDefault-light dark:border-borderDefault-dark">
                            <LocationIcon className="w-5 h-5 text-brand" />
                        </div>
                        <div className="leading-none">
                            <p className="text-[10px] font-black text-textMuted-light dark:text-textMuted-dark uppercase tracking-wider">Ubicación</p>
                            <p className="text-sm font-bold text-textMain-light dark:text-textMain-dark">{complex.city}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-10 h-10 bg-bgSurface-light dark:bg-bgSurface-dark rounded-xl flex items-center justify-center shadow-sm border border-borderDefault-light dark:border-borderDefault-dark">
                            <ClockIcon className="w-5 h-5 text-brand" />
                        </div>
                        <div className="leading-none">
                            <p className="text-[10px] font-black text-textMuted-light dark:text-textMuted-dark uppercase tracking-wider">Duración</p>
                            <p className="text-sm font-bold text-textMain-light dark:text-textMain-dark">60 min</p>
                        </div>
                    </div>
                </div>

                {/* Card de Selección de Fecha */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-textMain-light dark:text-textMain-dark uppercase tracking-widest italic">1. Elige la fecha</h2>
                    <div className="flex gap-3 overflow-x-auto ios-scroller -mx-6 px-6 pb-2">
                        {nextDays.map((date, idx) => {
                            const isSelected = isSameDay(date, selectedDate);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDate(date)}
                                    className={`flex-shrink-0 w-16 py-5 rounded-[24px] flex flex-col items-center gap-1 transition-all duration-300 border-2 ${
                                        isSelected 
                                        ? 'bg-brand border-brand shadow-button text-white scale-105' 
                                        : 'bg-bgSurface-light dark:bg-bgSurface-dark border-borderDefault-light dark:border-borderDefault-dark text-textMuted-light dark:text-textMuted-dark shadow-sm'
                                    }`}
                                >
                                    <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-white/80' : 'text-textMuted-light/60 dark:text-textMuted-dark/40'}`}>
                                        {date.toLocaleDateString('es-CO', { weekday: 'short' })}
                                    </span>
                                    <span className="text-xl font-black">{date.getDate()}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Horarios Adaptativos */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-textMain-light dark:text-textMain-dark uppercase tracking-widest italic">2. Horarios disponibles</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {availableHours.map(time => {
                            const isSelected = selectedTime === time;
                            const hourData = weatherData?.hourly.find(h => h.time.getHours() === parseInt(time));
                            const condition = hourData ? mapWmoCodeToIcon(hourData.weatherCode) : null;

                            return (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`py-6 rounded-[24px] font-black text-sm transition-all duration-300 border-2 flex flex-col items-center gap-2 ${
                                        isSelected 
                                        ? 'bg-brand border-brand text-white shadow-button scale-95' 
                                        : 'bg-bgSurface-light dark:bg-bgSurface-dark border-borderDefault-light dark:border-borderDefault-dark text-textMain-light dark:text-textMain-dark shadow-sm'
                                    }`}
                                >
                                    <span>{time}</span>
                                    {condition && (
                                        <WeatherIcon 
                                            condition={condition} 
                                            className={`w-5 h-5 opacity-60 ${isSelected ? 'brightness-200' : ''}`} 
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer Flotante Adaptativo */}
            <div className="fixed bottom-0 left-0 right-0 px-6 pb-10 z-[120] safe-area-bottom pointer-events-none">
                <div className="container mx-auto max-w-md bg-bgSurface-light/95 dark:bg-bgSurface-dark/95 backdrop-blur-2xl p-4 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-premium-dark border border-borderDefault-light dark:border-borderDefault-dark flex items-center justify-between pointer-events-auto animate-slide-in-up transition-colors duration-300">
                    <div className="flex flex-col pl-4">
                        <span className="text-[9px] font-black text-textMuted-light dark:text-textMuted-dark uppercase tracking-[0.25em] mb-0.5">Total a pagar</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-textMain-light dark:text-textMain-dark tracking-tighter">
                                ${selectedField.pricePerHour.toLocaleString('es-CO')}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => selectedTime && onBookNow(selectedField, selectedTime, selectedDate)}
                        disabled={!selectedTime}
                        className={`h-16 px-10 rounded-[30px] font-black text-xs uppercase tracking-[0.18em] transition-all duration-300 flex items-center gap-3 ${
                            selectedTime 
                            ? 'bg-brand text-white shadow-button active:scale-95' 
                            : 'bg-gray-100 dark:bg-gray-800 text-textMuted-light dark:text-textMuted-dark cursor-not-allowed border border-borderDefault-light dark:border-borderDefault-dark shadow-none'
                        }`}
                    >
                        <span>Reservar</span>
                        <ChevronRightIcon className={`w-4 h-4 transition-transform ${selectedTime ? 'translate-x-1' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FieldDetail;
