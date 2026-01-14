import React, { useState, useMemo } from 'react';
import type { SoccerField, ConfirmedBooking, WeatherData } from '../types';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import StarRating from '../components/StarRating';
import { LocationIcon } from '../components/icons/LocationIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import BookingWeatherStatus from '../components/weather/BookingWeatherStatus';
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

    // Generar próximos 7 días para el selector horizontal
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
        <div className="bg-[#F8F9FD] dark:bg-bgMain min-h-screen pb-40 animate-ios">
            {/* Header Imagen Inmersiva */}
            <div className="relative h-[38vh] overflow-hidden">
                <img 
                    src={complex.images[0]} 
                    className="w-full h-full object-cover" 
                    alt={complex.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FD] dark:from-bgMain via-transparent to-black/30"></div>
                
                <div className="absolute top-12 left-4 right-4 flex justify-between items-center z-20">
                    <button 
                        onClick={onBack}
                        className="bg-white/90 dark:bg-black/20 backdrop-blur-xl p-3 rounded-2xl shadow-premium active:scale-90 transition-transform border border-white/20"
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-textMain dark:text-white" />
                    </button>
                    
                    <button 
                        onClick={() => onToggleFavorite(selectedField.complexId || selectedField.id)}
                        className="bg-white/90 dark:bg-black/20 backdrop-blur-xl p-3 rounded-2xl shadow-premium active:scale-90 transition-transform border border-white/20"
                    >
                        <HeartIcon isFilled={isFavorite} className={`w-6 h-6 ${isFavorite ? 'text-brand' : 'text-gray-400'}`} />
                    </button>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="relative -mt-16 px-4 space-y-6">
                
                {/* Card de Información General */}
                <div className="bg-white dark:bg-navBg rounded-[32px] p-6 shadow-premium border border-white dark:border-white/5 animate-slide-in-up">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black text-textMain dark:text-white tracking-tight uppercase italic">{complex.name}</h1>
                            <div className="flex items-center gap-2 text-textMuted text-sm font-medium">
                                <LocationIcon className="w-4 h-4 text-brand" />
                                <span>{complex.address}</span>
                            </div>
                        </div>
                        <div className="bg-primary-50 dark:bg-brand/10 px-3 py-2 rounded-2xl flex flex-col items-center border border-brand/10">
                            <span className="text-brand font-black text-lg leading-none">{selectedField.rating}</span>
                            <StarRating rating={selectedField.rating} totalStars={1} className="w-3 h-3 text-brand mt-1" />
                        </div>
                    </div>

                    {/* Servicios Estilo App Moderna */}
                    <div className="grid grid-cols-4 gap-3 mt-6">
                        {complex.services.map(s => (
                            <div key={s.name} className="flex flex-col items-center gap-2 group">
                                <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 dark:border-white/5 group-active:scale-90 transition-transform">
                                    {s.icon}
                                </div>
                                <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider text-center">{s.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Card de Reserva */}
                <div className="bg-white dark:bg-navBg rounded-[32px] p-6 shadow-premium border border-white dark:border-white/5 space-y-6 animate-slide-in-up [animation-delay:100ms]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-textMain dark:text-white uppercase italic tracking-tight">Selecciona Fecha</h2>
                    </div>

                    {/* Selector de Fecha Horizontal */}
                    <div className="flex gap-3 overflow-x-auto ios-scroller -mx-2 px-2 pb-2">
                        {nextDays.map((date, idx) => {
                            const isSelected = isSameDay(date, selectedDate);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDate(date)}
                                    className={`flex-shrink-0 w-16 py-4 rounded-2xl flex flex-col items-center gap-1 transition-all border ${
                                        isSelected 
                                        ? 'bg-brand border-brand shadow-button text-white' 
                                        : 'bg-gray-50 dark:bg-white/5 border-transparent text-textMuted'
                                    }`}
                                >
                                    <span className="text-[10px] font-black uppercase opacity-70">
                                        {date.toLocaleDateString('es-CO', { weekday: 'short' })}
                                    </span>
                                    <span className="text-lg font-black">{date.getDate()}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-textMain dark:text-white uppercase italic tracking-tight">Horarios Disponibles</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {availableHours.map(time => {
                                const isSelected = selectedTime === time;
                                // Simular icono de clima para cada hora basado en weatherData
                                const hourData = weatherData?.hourly.find(h => h.time.getHours() === parseInt(time));
                                const condition = hourData ? mapWmoCodeToIcon(hourData.weatherCode) : null;

                                return (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`relative py-5 rounded-2xl font-bold text-sm transition-all duration-300 border-2 overflow-hidden ${
                                            isSelected 
                                            ? 'bg-brand border-brand text-white shadow-button scale-[1.02] z-10' 
                                            : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 text-textMain dark:text-gray-300'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <span>{time}</span>
                                            {condition && (
                                                <WeatherIcon 
                                                    condition={condition} 
                                                    className={`w-4 h-4 opacity-60 ${isSelected ? 'brightness-200' : ''}`} 
                                                />
                                            )}
                                        </div>
                                        {/* Overlay de diseño para el seleccionado */}
                                        {isSelected && (
                                            <div className="absolute top-0 left-0 w-full h-1 bg-white/30 animate-pulse"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sección de Reseñas sutil */}
                <div className="px-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-textMain dark:text-white">Opiniones de jugadores</h3>
                        <button className="text-xs font-black text-brand uppercase tracking-widest">Ver todas</button>
                    </div>
                    <div className="space-y-3">
                        {selectedField.reviews.slice(0, 1).map(review => (
                            <div key={review.id} className="bg-white/50 dark:bg-white/5 p-4 rounded-2xl border border-white dark:border-white/5">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-sm dark:text-gray-200">{review.author}</span>
                                    <StarRating rating={review.rating} className="scale-75 origin-right" />
                                </div>
                                <p className="text-xs text-textMuted italic">"{review.comment}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Action Footer - Rediseñado */}
            <div className="fixed bottom-0 left-0 right-0 p-6 z-[60]">
                <div className="container mx-auto max-w-md bg-white/90 dark:bg-[#0E1320]/95 backdrop-blur-2xl p-5 rounded-[40px] shadow-2xl border border-white/20 dark:border-white/5 flex items-center justify-between animate-slide-in-up">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em] ml-1">Total x hora</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-textMain dark:text-white tracking-tighter">
                                ${selectedField.pricePerHour.toLocaleString('es-CO')}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => selectedTime && onBookNow(selectedField, selectedTime, selectedDate)}
                        disabled={!selectedTime}
                        className={`group h-16 px-10 rounded-[28px] font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 ${
                            selectedTime 
                            ? 'bg-brand text-white shadow-button' 
                            : 'bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        <span>Reservar</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${selectedTime ? 'bg-white/20 group-hover:bg-white/30' : 'bg-transparent'}`}>
                            <ClockIcon className="w-4 h-4" />
                        </div>
                    </button>
                </div>
                {/* Espacio para el indicador de iOS */}
                <div className="h-4"></div>
            </div>
        </div>
    );
};

export default FieldDetail;