import React from 'react';
import type { ConfirmedBooking } from '../types';
import { CalendarIcon } from '../components/icons/CalendarIcon';

interface BookingConfirmationProps {
    details: ConfirmedBooking;
    onDone: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ details, onDone }) => {
    
    const generateCalendarLink = () => {
        const startTime = new Date(details.date);
        const [hours, minutes] = details.time.split(':').map(Number);
        startTime.setHours(hours, minutes);

        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Añade 1 hora

        const toGoogleISO = (date: Date) => date.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';

        const googleLink = new URL('https://calendar.google.com/calendar/render');
        googleLink.searchParams.append('action', 'TEMPLATE');
        googleLink.searchParams.append('text', `Partido en ${details.field.name}`);
        googleLink.searchParams.append('dates', `${toGoogleISO(startTime)}/${toGoogleISO(endTime)}`);
        googleLink.searchParams.append('details', `Reserva de cancha a través de Cancheo. ¡No olvides tu equipo!`);
        googleLink.searchParams.append('location', details.field.address);

        return googleLink.href;
    };


    return (
        <div className="max-w-2xl mx-auto text-center bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl dark:border dark:border-gray-700">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)]/50">
                <svg className="h-16 w-16 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-6">
                {details.isFree ? '¡Disfruta tu Cancha Gratis!' : '¡Reserva Confirmada!'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
                {details.isFree 
                    ? 'Tu cancha ha sido reservada usando un ticket de fidelidad.'
                    : details.paymentMethod === 'cash' 
                    ? 'Tu cancha ha sido reservada. Pagarás en el establecimiento.' 
                    : 'Tu pago fue exitoso y tu cancha ha sido reservada.'}
                <br/>
                Recibirás un correo electrónico con los detalles.
            </p>

            <div className="mt-8 text-left bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Detalles de la reserva</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Cancha:</span>
                        <span className="font-semibold">{details.field.name}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Dirección:</span>
                        <span className="font-semibold">{details.field.address}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
                        <span className="font-semibold">{details.date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Hora:</span>
                        <span className="font-semibold">{details.time}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <a
                    href={generateCalendarLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                    <CalendarIcon className="w-5 h-5"/>
                    Añadir al Calendario
                </a>
                <button
                    onClick={onDone}
                    className="w-full bg-[var(--color-primary-600)] text-white font-bold py-3 px-6 rounded-lg hover:bg-[var(--color-primary-700)] transition-transform transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                    Volver al Inicio
                </button>
            </div>
        </div>
    );
};

export default BookingConfirmation;