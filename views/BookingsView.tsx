
import React, { useState } from 'react';
import type { ConfirmedBooking } from '../types';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';
import { BookingPassIcon } from '../components/icons/BookingPassIcon';
import { RepeatIcon } from '../components/icons/RepeatIcon';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import { ClockIcon } from '../components/icons/ClockIcon';

interface BookingsViewProps {
    bookings: ConfirmedBooking[];
    onSelectBooking: (booking: ConfirmedBooking) => void;
    onContractResponse?: (bookingId: string, action: 'confirm' | 'cancel') => void;
}

// Helper function to get the full Date object for the start of a booking
const getBookingStartDateTime = (booking: ConfirmedBooking): Date => {
    const bookingDate = new Date(booking.date);
    const [hours, minutes] = booking.time.split(':').map(Number);
    bookingDate.setHours(hours, minutes, 0, 0);
    return bookingDate;
};


const BookingCard: React.FC<{ 
    booking: ConfirmedBooking; 
    onClick: () => void;
    onContractResponse?: (id: string, action: 'confirm' | 'cancel') => void;
}> = ({ booking, onClick, onContractResponse }) => {
    const isCancelled = booking.status === 'cancelled';
    const isContract = !!booking.contractId;
    
    const bookingDate = new Date(booking.date);
    const today = new Date();
    const isMatchDay = bookingDate.getDate() === today.getDate() &&
                       bookingDate.getMonth() === today.getMonth() &&
                       bookingDate.getFullYear() === today.getFullYear();

    // A match lasts 1 hour. Calculate the end time.
    const bookingEndDateTime = new Date(getBookingStartDateTime(booking).getTime() + 60 * 60 * 1000);
    const now = new Date();
    
    // The match is upcoming if it has not ended yet and is not cancelled.
    const isUpcoming = bookingEndDateTime > now && !isCancelled;
    
    const showContractActions = isContract && booking.confirmationStatus === 'pending' && !isCancelled;

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden transition-all hover:shadow-md">
            <div 
                onClick={onClick}
                className={`flex items-center p-4 cursor-pointer ${isCancelled ? 'opacity-70' : ''}`}
            >
                <img src={booking.field.images[0]} alt={booking.field.name} className={`w-24 h-24 object-cover rounded-lg ${isCancelled ? 'grayscale' : ''}`} />
                <div className="flex-1 ml-4 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        {isCancelled ? (
                            <span className="text-xs font-bold text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">Cancelada</span>
                        ) : (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${isUpcoming ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                {isUpcoming ? 'Próxima' : 'Jugada'}
                            </span>
                        )}
                        
                        {isContract && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                                <RepeatIcon className="w-3 h-3" />
                                Contrato
                            </span>
                        )}
                    </div>
                    
                    <p className={`font-bold text-lg text-gray-800 dark:text-gray-100 truncate ${isCancelled ? 'line-through decoration-red-500' : ''}`}>{booking.field.name}</p>
                    
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            {isMatchDay ? (
                                <span className="font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 rounded uppercase text-xs tracking-wide">
                                    Hoy
                                </span>
                            ) : (
                                <span className="capitalize">
                                    {bookingDate.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </span>
                            )}
                        </div>
                        <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
                        <div className="flex items-center gap-1.5">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span>{booking.time}</span>
                        </div>
                    </div>
                </div>
                {!isCancelled && <ChevronRightIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />}
            </div>

            {/* Contract Confirmation Actions */}
            {showContractActions && (
                <div className="px-4 pb-4 pt-0 flex gap-3">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onContractResponse?.(booking.id, 'confirm'); }}
                        disabled={!isMatchDay}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${
                            isMatchDay 
                                ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm' 
                                : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isMatchDay ? 'Confirmar Asistencia' : 'Confirmar (Solo Hoy)'}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onContractResponse?.(booking.id, 'cancel'); }}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${
                            isMatchDay
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!isMatchDay}
                    >
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    );
};


const BookingsView: React.FC<BookingsViewProps> = ({ bookings, onSelectBooking, onContractResponse }) => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

    const now = new Date();

    const upcomingBookings = bookings
        .filter(b => {
            const bookingEndDateTime = new Date(getBookingStartDateTime(b).getTime() + 60 * 60 * 1000);
            return bookingEndDateTime > now && b.status !== 'cancelled';
        })
        .sort((a, b) => getBookingStartDateTime(a).getTime() - getBookingStartDateTime(b).getTime());

    const historyBookings = bookings
        .filter(b => {
            const bookingEndDateTime = new Date(getBookingStartDateTime(b).getTime() + 60 * 60 * 1000);
            return bookingEndDateTime <= now || b.status === 'cancelled';
        })
        .sort((a, b) => {
            const dateA = getBookingStartDateTime(a);
            const dateB = getBookingStartDateTime(b);
            return dateB.getTime() - dateA.getTime();
        });

    const bookingsToShow = activeTab === 'upcoming' ? upcomingBookings : historyBookings;

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">Mis Reservas</h1>

            <div className="mb-6 flex space-x-2 rounded-xl bg-gray-200 dark:bg-gray-700 p-1">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition ${activeTab === 'upcoming' ? 'bg-white dark:bg-gray-800 shadow text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'}`}
                >
                    Próximas
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition ${activeTab === 'history' ? 'bg-white dark:bg-gray-800 shadow text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'}`}
                >
                    Historial
                </button>
            </div>

            {bookings.length === 0 ? (
                <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:border dark:border-gray-700">
                    <BookingPassIcon className="mx-auto h-16 w-16 text-gray-400" />
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">No tienes reservas</h2>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-400">Cuando reserves una cancha, aparecerá aquí.</p>
                </div>
            ) : (
                <div className="space-y-4 pb-[5.5rem] md:pb-4">
                    {bookingsToShow.length > 0 ? (
                        bookingsToShow.map(booking => (
                            <BookingCard 
                                key={booking.id} 
                                booking={booking} 
                                onClick={() => onSelectBooking(booking)}
                                onContractResponse={onContractResponse}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:border dark:border-gray-700">
                             <BookingPassIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h2 className="mt-4 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                {activeTab === 'upcoming' ? 'No tienes próximas reservas' : 'Tu historial está vacío'}
                            </h2>
                            <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
                                 {activeTab === 'upcoming' ? '¡Anímate a reservar tu próximo partido!' : 'Las canchas jugadas o canceladas aparecerán aquí.'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookingsView;
