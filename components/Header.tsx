import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { User, Notification, Invitation } from '../types';
import { View } from '../types';
import { UserIcon } from './icons/UserIcon';
import { XIcon } from './icons/XIcon';
import { BellIcon } from './icons/BellIcon';
import { DashboardIcon } from './icons/DashboardIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import ConfirmationModal from './ConfirmationModal';

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

const Header: React.FC<HeaderProps> = ({ user, onNavigate, onLogout, notifications, invitations, onDismiss, onMarkAllAsRead, onClearAll, onAcceptInvitation, onRejectInvitation, onAcceptMatchInvite, onRejectMatchInvite, currentTime }) => {
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
        <header className="sticky top-0 z-50 px-4 py-4 sm:py-6">
            <div className="container mx-auto flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl px-5 py-3 shadow-glass">
                <div 
                    className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
                    onClick={() => onNavigate(View.HOME)}
                >
                    <img src="https://ideogram.ai/assets/image/lossless/response/zjy_oza2RB2xuDygg3HR-Q" alt="Cancheo" className="h-9 w-9 rounded-xl shadow-lg" />
                    <h1 className="text-xl font-black tracking-tighter text-white">CANCHEO</h1>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div ref={profileRef} className="relative">
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 p-1 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center overflow-hidden shadow-inner">
                                    {user.profilePicture ? (
                                        <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-5 h-5 text-white" />
                                    )}
                                </div>
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 p-2 animate-ios overflow-hidden">
                                    <button onClick={() => { onNavigate(View.PROFILE); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 text-sm font-semibold text-gray-200 hover:bg-white/5 rounded-xl transition-colors">
                                        <UserIcon className="w-4 h-4"/> Mi Perfil
                                    </button>
                                    <div className="h-px bg-white/10 my-1"></div>
                                    <button onClick={() => { onLogout(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 text-sm font-semibold text-red-400 hover:bg-red-400/10 rounded-xl transition-colors">
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