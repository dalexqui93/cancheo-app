import React from 'react';
import type { ConfirmedBooking } from '../types';

interface BookingConfirmationProps {
    details: ConfirmedBooking;
    onDone: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ details, onDone }) => {
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

            <button
                onClick={onDone}
                className="mt-8 w-full bg-[var(--color-primary-600)] text-white font-bold py-3 px-6 rounded-lg hover:bg-[var(--color-primary-700)] transition-transform transform hover:scale-105 shadow-md hover:shadow-lg"
            >
                Volver al Inicio
            </button>
        </div>
    );
};

export default BookingConfirmation;
