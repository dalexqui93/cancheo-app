import React, { useState, useEffect, useRef } from 'react';
import type { User, Notification, Invitation } from '../types';
import { View } from '../types';
import { UserIcon } from './icons/UserIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface HeaderProps {
    user: User | null;
    onNavigate: (view: View) => void;
    onLogout: () => void;
    notifications: Notification[];
    invitations: Invitation[];
    onDismiss: (id: number) => void;
    onMarkAllAsRead: () => void;
    onClearAll: () => void;
    onAcceptInvitation: (invitation: Invitation) => void;
    onRejectInvitation: (invitation: Invitation) => void;
    onAcceptMatchInvite: (notification: Notification) => void;
    onRejectMatchInvite: (notification: Notification) => void;
    currentTime: Date;
}

const Header: React.FC<HeaderProps> = ({ user, onNavigate, onLogout }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 px-4 py-4 sm:py-6 bg-bgMain-light/80 dark:bg-bgMain-dark/80 backdrop-blur-md transition-colors">
            <div className="container mx-auto flex justify-between items-center bg-bgSurface-light dark:bg-bgSurface-dark border border-borderDefault-light dark:border-borderDefault-dark rounded-3xl px-5 py-3 shadow-premium-light dark:shadow-premium-dark">
                <div 
                    className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
                    onClick={() => onNavigate(View.HOME)}
                >
                    <img src="https://ideogram.ai/assets/image/lossless/response/zjy_oza2RB2xuDygg3HR-Q" alt="Cancheo" className="h-9 w-9 rounded-xl shadow-sm" />
                    <h1 className="text-xl font-black tracking-tighter text-textMain-light dark:text-textMain-dark">CANCHEO</h1>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div ref={profileRef} className="relative">
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 p-1 rounded-full border border-borderDefault-light dark:border-borderDefault-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center overflow-hidden shadow-inner border border-brand/20">
                                    {user.profilePicture ? (
                                        <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-5 h-5 text-white" />
                                    )}
                                </div>
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-bgSurface-light dark:bg-bgSurface-dark rounded-2xl shadow-2xl border border-borderDefault-light dark:border-borderDefault-dark p-2 animate-ios overflow-hidden">
                                    <button onClick={() => { onNavigate(View.PROFILE); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 text-sm font-semibold text-textMain-light dark:text-textMain-dark hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                        <UserIcon className="w-4 h-4 text-brand"/> Mi Perfil
                                    </button>
                                    <div className="h-px bg-borderDefault-light dark:bg-borderDefault-dark my-1"></div>
                                    <button onClick={() => { onLogout(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                                        <LogoutIcon className="w-4 h-4"/> Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button 
                            onClick={() => onNavigate(View.LOGIN)}
                            className="bg-brand text-white font-bold py-2.5 px-5 rounded-2xl shadow-button active:scale-95 transition-all text-xs uppercase tracking-widest"
                        >
                            ACCEDER
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
