// Fix: Implemented the BookingDetailView component to show booking details.
import React, { useState } from 'react';
import type { ConfirmedBooking, WeatherData } from '../types';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { CreditCardIcon } from '../components/icons/CreditCardIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import { CashIcon } from '../components/icons/CashIcon';
import BookingWeatherStatus from '../components/weather/BookingWeatherStatus';

interface BookingDetailViewProps {
    booking: ConfirmedBooking;
    onBack: () => void;
    onCancelBooking: (bookingId: string) => void;
    weatherData: WeatherData | null;
}

const BookingDetailView: React.FC<BookingDetailViewProps> = ({ booking, onBack, onCancelBooking, weatherData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getBookingDateTime = () => {
        const bookingDate = new Date(booking.date);
        const [hours, minutes] = booking.time.split(':').map(Number);
        bookingDate.setHours(hours, minutes, 0, 0);
        return bookingDate;
    };

    const bookingDateTime = getBookingDateTime();
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    const isUpcoming = bookingDateTime > now;
    const isCancelled = booking.status === 'cancelled';
    const isCancellable = hoursUntilBooking > 6 && !isCancelled;
    
    const paymentType = booking.isFree ? 'ticket' : (booking.paymentMethod === 'cash' ? 'cash' : 'card');
    
    const PAYMENT_ICONS = {
        card: <CreditCardIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 flex-shrink-0" />,
        cash: <CashIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 flex-shrink-0" />,
        ticket: <span className="text-2xl flex-shrink-0">🎟️</span>
    };


    const handleCancelClick = () => {
        if (isCancellable) {
            setIsModalOpen(true);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8 pb-[5.5rem] md:pb-4">
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold mb-6 hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver a Mis Reservas
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border dark:border-gray-700">
                <img src={booking.field.images[0]} alt={booking.field.name} className="w-full h-48 lg:h-64 object-cover" />
                <div className="p-6 md:p-8">
                    {isCancelled && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="font-bold">Esta reserva ha sido cancelada.</p>
                        </div>
                    )}
                    <h1 className={`text-3xl font-bold text-gray-900 dark:text-gray-100 ${isCancelled ? 'line-through' : ''}`}>{booking.field.name}</h1>
                    <p className="text-lg font-semibold text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] mt-1">
                        {booking.isFree ? 'Gratis (Ticket Canjeado)' : `$${booking.totalPrice.toLocaleString('es-CO')}`}
                    </p>

                    <div className="mt-6 border-t dark:border-gray-700 pt-6 space-y-4">
                        <div className="flex items-start">
                            <CalendarIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                            <div className="ml-4">
                                <p className="font-semibold text-gray-800 dark:text-gray-200">Fecha y Hora</p>
                                <p className="text-gray-600 dark:text-gray-400">{booking.date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las {booking.time}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <LocationIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                            <div className="ml-4">
                                <p className="font-semibold text-gray-800 dark:text-gray-200">Ubicación</p>
                                <p className="text-gray-600 dark:text-gray-400">{booking.field.address}, {booking.field.city}</p>
                            </div>
                        </div>
                         <div className="flex items-start">
                            <ClockIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                             <div className="ml-4">
                                <p className="font-semibold text-gray-800 dark:text-gray-200">Duración</p>
                                <p className="text-gray-600 dark:text-gray-400">1 hora</p>
                            </div>
                        </div>
                         <div className="pt-4 border-t border-gray-200 dark:border-gray-700 -mx-6 px-6">
                            <BookingWeatherStatus 
                                weatherData={weatherData}
                                selectedDate={booking.date}
                                selectedTime={booking.time}
                            />
                        </div>
                    </div>
                     <div className="mt-6 border-t dark:border-gray-700 pt-6">
                         <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Detalles de Pago</h2>
                         <div className="flex items-center">
                            {PAYMENT_ICONS[paymentType]}
                            <div className="ml-4 flex-grow flex justify-between items-center">
                                <p className="text-gray-600 dark:text-gray-400">Método de pago:</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                    {paymentType === 'card' ? 'Online / Tarjeta' : paymentType === 'cash' ? 'Pago en el sitio' : 'Ticket de Fidelidad'}
                                </p>
                            </div>
                         </div>
                         <div className="flex justify-between items-center mt-4">
                            <p className="text-gray-600 dark:text-gray-400 ml-10">Total pagado:</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">${booking.totalPrice.toLocaleString('es-CO')}</p>
                         </div>
                    </div>
                </div>
                 {isUpcoming && !isCancelled && (
                    <div className="p-6 md:p-8 border-t dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Administrar Reserva</h2>
                        <button
                            onClick={handleCancelClick}
                            disabled={!isCancellable}
                            className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            Cancelar Reserva
                        </button>
                        {!isCancellable && (
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                                No puedes cancelar una reserva si faltan 6 horas o menos para el inicio del partido.
                            </p>
                        )}
                    </div>
                )}
            </div>
             <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => onCancelBooking(booking.id)}
                title="Confirmar Cancelación"
                message="¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer."
                confirmButtonText="Sí, cancelar"
            />
        </div>
    );
};

export default BookingDetailView;