import React, { useState } from 'react';
import type { SoccerField, ConfirmedBooking, WeatherData } from '../types';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import StarRating from '../components/StarRating';
import { LocationIcon } from '../components/icons/LocationIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import BookingWeatherStatus from '../components/weather/BookingWeatherStatus';

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

    return (
        <div className="bg-bgMain min-h-screen pb-32 animate-reveal">
            {/* Immersive Header Image */}
            <div className="relative h-[35vh] overflow-hidden">
                <img 
                    src={complex.images[0]} 
                    className="w-full h-full object-cover scale-105" 
                    alt={complex.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bgMain via-transparent to-black/20"></div>
                
                <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-10">
                    <button 
                        onClick={onBack}
                        className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-premium border border-white/50 active:scale-90 transition-transform"
                    >
                        <ChevronLeftIcon className="w-5 h-5 text-textMain" />
                    </button>
                    
                    <button 
                        onClick={() => onToggleFavorite(selectedField.complexId || selectedField.id)}
                        className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-premium border border-white/50 active:scale-90 transition-transform"
                    >
                        <HeartIcon isFilled={isFavorite} className={`w-5 h-5 ${isFavorite ? 'text-brand' : 'text-textMuted'}`} />
                    </button>
                </div>
            </div>

            {/* Information Card */}
            <div className="relative -mt-10 px-4 space-y-6">
                <div className="bg-white rounded-4xl p-6 shadow-premium border border-white">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-textMain tracking-tight mb-1">{complex.name}</h1>
                            <div className="flex items-center gap-2 text-textMuted text-sm">
                                <LocationIcon className="w-4 h-4 text-brand" />
                                <span>{complex.address}, {complex.city}</span>
                            </div>
                        </div>
                        <div className="bg-primary-50 px-3 py-2 rounded-2xl flex flex-col items-center">
                            <span className="text-brand font-black text-lg leading-none">{selectedField.rating}</span>
                            <StarRating rating={selectedField.rating} totalStars={1} className="w-3 h-3 text-brand mt-1" />
                        </div>
                    </div>

                    <p className="text-textMuted text-sm leading-relaxed mb-6">
                        {complex.description}
                    </p>

                    {/* Services Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        {complex.services.map(s => (
                            <div key={s.name} className="bg-bgMain/50 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 border border-black/5">
                                <span className="text-2xl filter drop-shadow-sm">{s.icon}</span>
                                <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">{s.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Booking Selection Card */}
                <div className="bg-white rounded-4xl p-6 shadow-premium border border-white space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-textMain flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-brand" />
                            Reserva hoy
                        </h2>
                        <div className="relative">
                            <input 
                                type="date" 
                                className="bg-bgMain text-textMain text-xs font-bold px-4 py-2.5 rounded-full border-none focus:ring-2 focus:ring-brand cursor-pointer"
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                defaultValue={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    <BookingWeatherStatus weatherData={weatherData} selectedDate={selectedDate} selectedTime={selectedTime} />

                    <div className="grid grid-cols-3 gap-3">
                        {availableHours.map(time => (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`py-4 rounded-2xl font-bold text-sm transition-all duration-200 border-2 active:scale-95 ${
                                    selectedTime === time 
                                    ? 'bg-brand text-white border-brand shadow-button' 
                                    : 'bg-white border-bgMain text-textMuted hover:border-brand/30'
                                }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-6 z-40">
                <div className="container mx-auto max-w-md glass-footer p-4 rounded-5xl shadow-2xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">PRECIO ESTIMADO</p>
                        <p className="text-2xl font-black text-textMain tracking-tighter">
                            ${selectedField.pricePerHour.toLocaleString('es-CO')}
                        </p>
                    </div>
                    <button
                        onClick={() => selectedTime && onBookNow(selectedField, selectedTime, selectedDate)}
                        disabled={!selectedTime}
                        className={`px-10 py-4 rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-button active:scale-95 ${
                            selectedTime 
                            ? 'bg-brand text-white' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        RESERVAR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FieldDetail;