import React, { useState } from 'react';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { MailIcon } from '../components/icons/MailIcon';
import { View } from '../types';
import type { Notification } from '../types';

interface ForgotPasswordProps {
    onNavigate: (view: View, options?: { isBack?: boolean }) => void;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
}

const ForgotPasswordView: React.FC<ForgotPasswordProps> = ({ onNavigate, addNotification }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Por favor, introduce un correo electrónico válido.');
            return;
        }

        // In a real app, this would trigger an API call.
        addNotification({
            type: 'info',
            title: 'Correo de Recuperación Enviado',
            message: 'Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.',
        });
        onNavigate(View.LOGIN, { isBack: true });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Recuperar Contraseña
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Ingresa tu correo para recibir un enlace de recuperación.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border dark:border-gray-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Correo Electrónico
                            </label>
                            <div className="mt-1 relative">
                                <MailIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 pl-10 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-[var(--color-primary-500)] sm:text-sm bg-white dark:bg-gray-800"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md border border-transparent bg-[var(--color-primary-600)] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                            >
                                Enviar Enlace de Recuperación
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => onNavigate(View.LOGIN, { isBack: true })}
                            className="flex items-center justify-center gap-1 w-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                            Volver a Iniciar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordView;
