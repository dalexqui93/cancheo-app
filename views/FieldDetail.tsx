import React, { useState, useEffect } from 'react';
import type { SoccerField, ConfirmedBooking } from '../types';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import { UserIcon } from '../components/icons/UserIcon';
import StarRating from '../components/StarRating';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import ReviewsModal from '../components/ReviewsModal';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';

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
}

const BookingWidget: React.FC<{
    field: SoccerField;
    uniqueId: string;
    selectedDate: Date;
    selectedTime: string | null;
    onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTimeSelect: (time: string | null) => void;
    minDate: string;
    formatDateForInput: (date: Date) => string;
    unavailableTimes: string[];
    isLoadingAvailability: boolean;
}> = ({ field, uniqueId, selectedDate, selectedTime, onDateChange, onTimeSelect, minDate, formatDateForInput, unavailableTimes, isLoadingAvailability }) => {
    const [activeTimeTab, setActiveTimeTab] = useState<'mañana' | 'tarde' | 'noche'>('noche');
    
    const defaultTimes = {
        mañana: ['08:00', '09:00', '10:00', '11:00'],
        tarde: ['12:00', '13:00', '14:00', '15:00', '16:00'],
        noche: ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
    };
    
    const availableTimes = field.availableSlots || defaultTimes;


    const handleTimeTabChange = (tab: 'mañana' | 'tarde' | 'noche') => {
        setActiveTimeTab(tab);
        onTimeSelect(null); // Reset time in parent
    };
    
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    const currentHour = now.getHours();

    return (
        <div className="mt-6 space-y-4">
            {/* Date Picker */}
            <div>
                <label htmlFor={`booking-date-${uniqueId}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400"/> Fecha
                </label>
                <input
                    id={`booking-date-${uniqueId}`}
                    type="date"
                    value={formatDateForInput(selectedDate)}
                    min={minDate}
                    onChange={onDateChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700 dark:text-gray-200"
                />
            </div>

            {/* Time Picker */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-gray-500 dark:text-gray-400"/> Hora
                </label>
                <div className="flex space-x-1 rounded-lg bg-gray-200 dark:bg-gray-900/50 p-1 mb-3">
                    {(['Mañana', 'Tarde', 'Noche'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTimeTabChange(tab.toLowerCase() as any)}
                            className={`w-full rounded-md py-1.5 text-sm font-semibold leading-5 transition ${activeTimeTab === tab.toLowerCase() ? 'bg-white dark:bg-gray-700 shadow text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                 <div className="min-h-[88px]"> {/* Prevents layout shift during loading */}
                    {isLoadingAvailability ? (
                        <div className="grid grid-cols-3 gap-2 animate-pulse">
                            {[...Array(availableTimes[activeTimeTab].length)].map((_, i) => (
                                <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {availableTimes[activeTimeTab].map(time => {
                                const [timeHour] = time.split(':').map(Number);
                                const isPastTime = isToday && timeHour <= currentHour;
                                const isUnavailable = unavailableTimes.includes(time) || isPastTime;
                                return (
                                    <button
                                        key={time}
                                        onClick={() => onTimeSelect(time)}
                                        disabled={isUnavailable}
                                        className={`py-2 px-3 rounded-md text-sm font-semibold transition text-center ${
                                            isUnavailable
                                                ? 'bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-500 line-through cursor-not-allowed'
                                                : selectedTime === time
                                                ? 'bg-[var(--color-primary-600)] text-white shadow-md'
                                                : 'bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:ring-1 focus:ring-[var(--color-primary-500)]'
                                        }`}
                                    >
                                        {time}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const FieldDetail: React.FC<FieldDetailProps> = ({ complex, initialFieldId, onBookNow, onBack, favoriteFields, onToggleFavorite, allBookings }) => {
    const [selectedFieldId, setSelectedFieldId] = useState(initialFieldId);
    const selectedField = complex.fields.find(f => f.id === selectedFieldId) || complex.fields[0];
    const complexId = selectedField.complexId || selectedField.id;
    
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isBouncing, setIsBouncing] = useState(false);
    const [unavailableTimes, setUnavailableTimes] = useState<string[]>([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

    useEffect(() => {
        if (!selectedDate || !selectedField.id) return;

        setIsLoadingAvailability(true);
        
        // Use allBookings prop to determine unavailable times for the selected field and date
        const timer = setTimeout(() => {
            const bookedTimes = allBookings
                .filter(booking => {
                    const bookingDate = new Date(booking.date);
                    return booking.field.id === selectedField.id &&
                           bookingDate.getFullYear() === selectedDate.getFullYear() &&
                           bookingDate.getMonth() === selectedDate.getMonth() &&
                           bookingDate.getDate() === selectedDate.getDate() &&
                           booking.status === 'confirmed';
                })
                .map(booking => booking.time);
            
            setUnavailableTimes(bookedTimes);
            setIsLoadingAvailability(false);
        }, 200);

        return () => clearTimeout(timer);
    }, [selectedDate, selectedField.id, allBookings]);

    const handleBookNowClick = () => {
        if (selectedTime) {
            onBookNow(selectedField, selectedTime, selectedDate);
        }
    };
    
    const handleToggleFavoriteClick = () => {
        onToggleFavorite(complexId);
        setIsBouncing(true);
        const timer = setTimeout(() => setIsBouncing(false), 400);
        return () => clearTimeout(timer);
    };
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(new Date(`${e.target.value}T00:00:00`));
        setSelectedTime(null);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFieldId(e.target.value);
        setSelectedTime(null);
    };

    const formatDateForInput = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    const handlePrevImage = () => setActiveImageIndex(prev => (prev - 1 + complex.images.length) % complex.images.length);
    const handleNextImage = () => setActiveImageIndex(prev => (prev + 1) % complex.images.length);

    const minDate = formatDateForInput(new Date());
    const isFavorite = favoriteFields.includes(complexId);

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold mb-2 hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver
            </button>

            <div className="w-full aspect-video lg:aspect-[2.4/1] -mx-4 md:mx-0 md:mt-2">
                <div className="relative group h-full w-full md:rounded-2xl md:overflow-hidden shadow-lg">
                    {complex.images.length > 0 && <img key={complex.images[activeImageIndex]} src={complex.images[activeImageIndex]} alt={`${complex.name} - Imagen ${activeImageIndex + 1}`} className="w-full h-full object-cover transition-opacity duration-300" />}
                    {complex.images.length > 1 && (
                        <>
                            <button onClick={handlePrevImage} aria-label="Imagen anterior" className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-2 rounded-full shadow-md transition opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-gray-800"><ChevronLeftIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" /></button>
                             <button onClick={handleNextImage} aria-label="Siguiente imagen" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-2 rounded-full shadow-md transition opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-gray-800"><ChevronRightIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" /></button>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2 space-y-10">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mt-1">{complex.name}</h1>
                                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center"><LocationIcon className="h-5 w-5 mr-2" /><span>{complex.address}, {complex.city}</span></div>
                                    <div className="flex items-center"><StarRating rating={selectedField.rating} /><span className="text-gray-600 dark:text-gray-300 ml-2 text-sm">({selectedField.reviews.length} opiniones)</span></div>
                                </div>
                            </div>
                            <button onClick={handleToggleFavoriteClick} className={`p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-full shadow-sm transition-transform ${isBouncing ? 'animate-bounce' : 'transform hover:scale-110'} flex-shrink-0 mt-2`} aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}>
                                <HeartIcon isFilled={isFavorite} className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Descripción</h2>
                            <p>{complex.description}</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Servicios</h2>
                            <div className="flex flex-wrap gap-4">
                                {complex.services.map(service => (
                                    <div key={service.name} className="flex items-center gap-3 bg-white dark:bg-gray-800 py-2 px-4 rounded-lg border dark:border-gray-700">
                                        <span className="text-xl">{service.icon}</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{service.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Opiniones ({selectedField.reviews.length})</h2>
                            <div className="space-y-6">{selectedField.reviews.slice(0, 2).map(review => (<div key={review.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700"><div className="flex items-start"><div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center mr-4 flex-shrink-0"><UserIcon className="w-6 h-6 text-slate-500 dark:text-gray-400"/></div><div className="flex-1"><div className="flex items-center mb-1"><p className="font-bold text-gray-800 dark:text-gray-200">{review.author}</p><div className="ml-auto"><StarRating rating={review.rating} /></div></div><p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.comment}</p></div></div></div>))}</div>
                            {selectedField.reviews.length > 2 && (<div className="mt-6 text-center"><button onClick={() => setIsReviewsModalOpen(true)} className="font-semibold text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] hover:underline py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Mostrar las {selectedField.reviews.length} opiniones</button></div>)}
                        </div>

                        <div className="lg:hidden bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border dark:border-gray-700">
                            <div className="mb-4">
                                <label htmlFor="field-select-mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Elige un campo</label>
                                <div className="relative"><select id="field-select-mobile" value={selectedFieldId} onChange={handleFieldChange} className="w-full appearance-none p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700 dark:text-gray-200 font-semibold">{complex.fields.map(f => (<option key={f.id} value={f.id}>{f.name.split(' - ').pop() || f.name} ({f.size})</option>))}</select><ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/></div>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">${selectedField.pricePerHour.toLocaleString('es-CO')}<span className="text-base font-normal text-gray-500 dark:text-gray-400"> / hora</span></p>
                            </div>
                            {selectedField.loyaltyEnabled && (<div className="flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400 mt-2"><span className="text-lg">🎟️</span><span>Juega {selectedField.loyaltyGoal} y obtén 1 gratis</span></div>)}
                            <BookingWidget field={selectedField} uniqueId="mobile" selectedDate={selectedDate} selectedTime={selectedTime} onDateChange={handleDateChange} onTimeSelect={setSelectedTime} minDate={minDate} formatDateForInput={formatDateForInput} unavailableTimes={unavailableTimes} isLoadingAvailability={isLoadingAvailability} />
                        </div>
                    </div>

                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="lg:sticky lg:top-24 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border dark:border-gray-700">
                            <div className="mb-4">
                                <label htmlFor="field-select-desktop" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Elige un campo</label>
                                <div className="relative"><select id="field-select-desktop" value={selectedFieldId} onChange={handleFieldChange} className="w-full appearance-none p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700 dark:text-gray-200 font-semibold">{complex.fields.map(f => (<option key={f.id} value={f.id}>{f.name.split(' - ').pop() || f.name} ({f.size})</option>))}</select><ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/></div>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">${selectedField.pricePerHour.toLocaleString('es-CO')}<span className="text-base font-normal text-gray-500 dark:text-gray-400"> / hora</span></p>
                            </div>
                            {selectedField.loyaltyEnabled && (<div className="flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400 mt-2"><span className="text-lg">🎟️</span><span>Juega {selectedField.loyaltyGoal} y obtén 1 gratis</span></div>)}
                            <BookingWidget field={selectedField} uniqueId="desktop" selectedDate={selectedDate} selectedTime={selectedTime} onDateChange={handleDateChange} onTimeSelect={setSelectedTime} minDate={minDate} formatDateForInput={formatDateForInput} unavailableTimes={unavailableTimes} isLoadingAvailability={isLoadingAvailability} />
                            <button onClick={handleBookNowClick} disabled={!selectedTime} className="w-full mt-6 bg-[var(--color-primary-600)] text-white font-bold py-3 rounded-lg hover:bg-[var(--color-primary-700)] transition-transform transform hover:scale-105 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none">Reservar ahora</button>
                        </div>
                    </aside>
                </div>
            </div>

            {isReviewsModalOpen && <ReviewsModal fieldName={selectedField.name} reviews={selectedField.reviews} onClose={() => setIsReviewsModalOpen(false)} />}

             <div className="lg:hidden fixed bottom-20 left-0 right-0 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 shadow-t-2xl z-40 -mx-4">
                <div className="flex items-center justify-between gap-4 container mx-auto px-4">
                     <div className="text-left">
                         <p className="font-bold text-gray-900 dark:text-gray-100">{selectedTime ? `$${selectedField.pricePerHour.toLocaleString('es-CO')}` : 'Selecciona una hora'}</p>
                        <p className="text-xs font-normal text-gray-500 dark:text-gray-400"> {selectedTime ? 'Total por 1 hora' : 'Disponibilidad para el día seleccionado'}</p>
                    </div>
                    <button onClick={handleBookNowClick} disabled={!selectedTime} className="bg-[var(--color-primary-600)] text-white font-bold py-3 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex-grow-[2] max-w-[60%]">Reservar ahora</button>
                </div>
            </div>
        </div>
    );
};

export default FieldDetail;