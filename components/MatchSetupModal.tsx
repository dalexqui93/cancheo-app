
import React, { useState } from 'react';
import type { User, Team, ConfirmedBooking } from '../types';
import { XIcon } from './icons/XIcon';
import { UserIcon } from './icons/UserIcon';
import { ShieldIcon } from './icons/ShieldIcon';

interface MatchSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (identityId: string, rivalName: string) => void;
    booking: ConfirmedBooking;
    user: User;
    userTeams: Team[];
}

const MatchSetupModal: React.FC<MatchSetupModalProps> = ({ isOpen, onClose, onConfirm, booking, user, userTeams }) => {
    const [selectedId, setSelectedId] = useState<string>(user.id);
    const [rivalName, setRivalName] = useState<string>('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(selectedId, rivalName);
    };

    const formattedDate = new Date(booking.date).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div 
                className="w-full sm:w-[480px] bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-in-up overflow-hidden transition-all" 
                onClick={e => e.stopPropagation()}
            >
                {/* Mobile Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Configurar Partido</h3>
                        <p className="text-sm font-medium text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] flex items-center gap-1">
                            {booking.field.name}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <XIcon className="w-5 h-5"/>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8">
                    {/* Context Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-center gap-3">
                        <div className="bg-white dark:bg-blue-900/50 p-2 rounded-xl shadow-sm text-center min-w-[60px]">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{formattedDate.split(' ')[0]}</p>
                            <p className="text-lg font-black text-gray-800 dark:text-gray-200">{formattedDate.split(' ')[1]}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-tight">
                                Estás confirmando asistencia para las <span className="font-bold text-gray-900 dark:text-white">{booking.time}</span>.
                            </p>
                        </div>
                    </div>

                    {/* Identity Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 ml-1">
                            ¿Cómo vas a jugar?
                        </label>
                        <div className="space-y-3">
                            {/* User Option */}
                            <div 
                                onClick={() => setSelectedId(user.id)}
                                className={`group relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                                    selectedId === user.id 
                                    ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 shadow-sm' 
                                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 ${selectedId === user.id ? 'border-[var(--color-primary-500)]' : 'border-transparent bg-gray-100 dark:bg-gray-700'}`}>
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover"/>
                                        ) : (
                                            <UserIcon className="w-6 h-6 text-gray-400"/>
                                        )}
                                    </div>
                                    <div>
                                        <p className={`font-bold text-base ${selectedId === user.id ? 'text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)]' : 'text-gray-700 dark:text-gray-200'}`}>{user.name}</p>
                                        <p className="text-xs text-gray-500">Jugador Individual</p>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedId === user.id ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]' : 'border-gray-300 dark:border-gray-600'}`}>
                                    {selectedId === user.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                </div>
                            </div>

                            {/* Team Options */}
                            {userTeams.map(team => (
                                <div 
                                    key={team.id}
                                    onClick={() => setSelectedId(team.id)}
                                    className={`group relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                                        selectedId === team.id 
                                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 shadow-sm' 
                                        : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 ${selectedId === team.id ? 'border-[var(--color-primary-500)]' : 'border-transparent bg-gray-100 dark:bg-gray-700'}`}>
                                            {team.logo ? (
                                                <img src={team.logo} alt={team.name} className="w-full h-full object-cover"/>
                                            ) : (
                                                <ShieldIcon className="w-6 h-6 text-gray-400"/>
                                            )}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-base ${selectedId === team.id ? 'text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)]' : 'text-gray-700 dark:text-gray-200'}`}>{team.name}</p>
                                            <p className="text-xs text-gray-500">Equipo {team.level}</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedId === team.id ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {selectedId === team.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rival Input */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 ml-1">Nombre del Rival</label>
                        <div className="relative">
                            <input 
                                type="text"
                                value={rivalName}
                                onChange={(e) => setRivalName(e.target.value)}
                                placeholder="Ej: Los Amigos FC"
                                className="w-full p-4 pl-4 border-none rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-primary-500)] focus:bg-white dark:focus:bg-gray-800 transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                Opcional
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1">
                            Si lo dejas vacío, asignaremos un nombre al azar.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-4">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="flex-[2] py-3.5 px-6 rounded-2xl font-bold text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] shadow-lg shadow-[var(--color-primary-500)]/30 transition-transform transform active:scale-95"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchSetupModal;
