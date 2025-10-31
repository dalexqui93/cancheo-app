// Fix: Implemented the BookingsView component to display user bookings.
import React, { useState } from 'react';
import type { ConfirmedBooking } from '../types';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';
import { BookingPassIcon } from '../components/icons/BookingPassIcon';

interface BookingsViewProps {
    bookings: ConfirmedBooking[];
    onSelectBooking: (booking: ConfirmedBooking) => void;
}

const BookingCard: React.FC<{ booking: ConfirmedBooking; onClick: () => void }> = ({ booking, onClick }) => {
    const isCancelled = booking.status === 'cancelled';
    const isUpcoming = new Date(booking.date) >= new Date(new Date().toDateString()) && !isCancelled;
    
    return (
        <button 
            onClick={onClick}
            disabled={isCancelled}
            className="w-full flex items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <img src={booking.field.images[0]} alt={booking.field.name} className="w-24 h-24 object-cover rounded-lg" />
            <div className="flex-1 ml-4">
                 {isCancelled ? (
                    <p className="text-sm font-bold text-red-600 dark:text-red-500">Cancelada</p>
                ) : (
                    <p className={`text-sm font-bold ${isUpcoming ? 'text-green-600 dark:text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>{isUpcoming ? 'Próxima' : 'Jugada'}</p>
                )}
                <p className={`font-bold text-lg text-gray-800 dark:text-gray-100 ${isCancelled ? 'line-through' : ''}`}>{booking.field.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{booking.date.toLocaleDateString('es-CO', { weekday: 'short', month: 'long', day: 'numeric' })} - {booking.time}</p>
            </div>
            {!isCancelled && <ChevronRightIcon className="h-6 w-6 text-gray-400" />}
        </button>
    );
};


const BookingsView: React.FC<BookingsViewProps> = ({ bookings, onSelectBooking }) => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

    const upcomingBookings = bookings
        .filter(b => new Date(b.date) >= new Date(new Date().toDateString()) && b.status !== 'cancelled')
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    const historyBookings = bookings
        .filter(b => new Date(b.date) < new Date(new Date().toDateString()) || b.status === 'cancelled')
        .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
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
                            <BookingCard key={booking.id} booking={booking} onClick={() => onSelectBooking(booking)} />
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