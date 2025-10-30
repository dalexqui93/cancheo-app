import React, { useState, useEffect, useRef } from 'react';
import type { User, Notification } from '../types';
import { View } from '../types';
import { UserIcon } from './icons/UserIcon';
import { XIcon } from './icons/XIcon';
import { BellIcon } from './icons/BellIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { timeSince } from '../utils/timeSince';


interface HeaderProps {
    user: User | null;
    onNavigate: (view: View) => void;
    onLogout: () => void;
    notifications: Notification[];
    onDismiss: (id: number) => void;
    onMarkAllAsRead: () => void;
    onClearAll: () => void;
}

const NotificationIcon: React.FC<{ notification: Notification }> = ({ notification }) => {
    const { type, title } = notification;

    if (title.toLowerCase().includes('oferta')) return <SparklesIcon className="h-6 w-6 text-yellow-500" />;
    if (title.toLowerCase().includes('anuncio')) return <MegaphoneIcon className="h-6 w-6 text-blue-500" />;
    if (type === 'success') return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    if (type === 'error') return <InformationCircleIcon className="h-6 w-6 text-red-500" />;

    return <InformationCircleIcon className="h-6 w-6 text-gray-500" />;
};


const Header: React.FC<HeaderProps> = ({ user, onNavigate, onLogout, notifications, onDismiss, onMarkAllAsRead, onClearAll }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    // Mark as read when opening the dropdown after a delay
    useEffect(() => {
        if (isNotificationsOpen) {
            const timeoutId = setTimeout(() => {
                onMarkAllAsRead();
            }, 2000); 
            return () => clearTimeout(timeoutId);
        }
    }, [isNotificationsOpen, onMarkAllAsRead]);
    
     // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => onNavigate(View.HOME)}
                    aria-label="Ir al inicio"
                >
                    <img src="https://ideogram.ai/assets/image/lossless/response/zjy_oza2RB2xuDygg3HR-Q" alt="Cancheo logo" className="h-8 w-8 rounded-full" />
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">Canche<span className="text-[var(--color-primary-600)]">o</span></h1>
                </div>
                <nav className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {/* Notifications Bell */}
                            <div ref={notificationsRef} className="relative">
                                <button
                                    onClick={() => setIsNotificationsOpen(prev => !prev)}
                                    className="relative text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary-600)] dark:hover:text-[var(--color-primary-500)] transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                    aria-label={`Notificaciones (${unreadCount} sin leer)`}
                                >
                                    <BellIcon className="h-6 w-6" />
                                     {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
                                    )}
                                </button>
                                 {isNotificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-20 border dark:border-gray-700 animate-fade-in flex flex-col" style={{maxHeight: '80vh'}}>
                                        <div className="relative p-4 border-b border-gray-200 dark:border-gray-700 flex justify-center items-center flex-shrink-0">
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Notificaciones</h3>
                                            {unreadCount > 0 && (
                                                <button onClick={onMarkAllAsRead} className="absolute right-4 text-sm font-semibold text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] hover:underline whitespace-nowrap">
                                                    Marcar leídas
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex-grow overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map(notif => (
                                                    <div key={notif.id} className="group p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 relative">
                                                        {!notif.read && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 bg-blue-500 rounded-full"></div>}
                                                        <div className="flex-shrink-0 mt-1 pl-2">
                                                            <NotificationIcon notification={notif} />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{notif.title}</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeSince(new Date(notif.timestamp))}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => onDismiss(notif.id)}
                                                            className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            aria-label="Descartar notificación"
                                                        >
                                                            <XIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-16 px-4 flex flex-col items-center">
                                                    <BellIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4"/>
                                                    <h4 className="font-bold text-gray-800 dark:text-gray-200">Todo está al día</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No tienes notificaciones nuevas.</p>
                                                </div>
                                            )}
                                        </div>
                                        {notifications.length > 0 && (
                                            <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                                                <button onClick={onClearAll} className="w-full text-center text-sm font-semibold text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 py-2 rounded-md transition-colors">
                                                    Limpiar todo
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>


                            {/* Profile Dropdown */}
                            <div ref={profileRef} className="relative">
                                <button onClick={() => setIsProfileOpen(prev => !prev)} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary-600)] dark:hover:text-[var(--color-primary-500)] transition-colors">
                                    <UserIcon className="h-6 w-6" />
                                    <span className="font-medium hidden sm:block">{user.name}</span>
                                </button>
                                {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border dark:border-gray-700 animate-fade-in">
                                    {!user.isAdmin && <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(View.PROFILE); setIsProfileOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Mi Perfil</a>}
                                    {user.isOwner && <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(View.OWNER_DASHBOARD); setIsProfileOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Panel Propietario</a>}
                                    {user.isAdmin && <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(View.SUPER_ADMIN_DASHBOARD); setIsProfileOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Panel Admin</a>}
                                    <a href="#" onClick={(e) => {e.preventDefault(); onLogout(); setIsProfileOpen(false);}} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cerrar Sesión</a>
                                </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => onNavigate(View.LOGIN)}
                            className="bg-[var(--color-primary-600)] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-700)] transition-transform transform hover:scale-105 shadow-sm hover:shadow-md"
                        >
                            Iniciar Sesión
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;