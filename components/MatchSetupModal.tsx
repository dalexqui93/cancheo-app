
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md m-4 flex flex-col animate-slide-in-up overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Configurar Partido</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formattedDate} - {booking.time}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500">
                        <XIcon className="w-6 h-6"/>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Estás confirmando tu asistencia en <strong className="text-gray-900 dark:text-white">{booking.field.name}</strong>. ¿Cómo quieres registrar este partido?
                    </p>

                    {/* Identity Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Jugar como</label>
                        <div className="space-y-3">
                            {/* User Option */}
                            <div 
                                onClick={() => setSelectedId(user.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                    selectedId === user.id 
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover"/>
                                        ) : (
                                            <UserIcon className="w-5 h-5 text-gray-500"/>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{user.name}</p>
                                        <p className="text-xs text-gray-500">Individual</p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedId === user.id ? 'border-green-500' : 'border-gray-400'}`}>
                                    {selectedId === user.id && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                                </div>
                            </div>

                            {/* Team Options */}
                            {userTeams.map(team => (
                                <div 
                                    key={team.id}
                                    onClick={() => setSelectedId(team.id)}
                                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                        selectedId === team.id 
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                            {team.logo ? (
                                                <img src={team.logo} alt={team.name} className="w-full h-full object-cover"/>
                                            ) : (
                                                <ShieldIcon className="w-5 h-5 text-gray-500"/>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{team.name}</p>
                                            <p className="text-xs text-gray-500">{team.level}</p>
                                        </div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedId === team.id ? 'border-green-500' : 'border-gray-400'}`}>
                                        {selectedId === team.id && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rival Input */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Nombre del Rival</label>
                        <input 
                            type="text"
                            value={rivalName}
                            onChange={(e) => setRivalName(e.target.value)}
                            placeholder="Ej: Los Amigos FC (Opcional)"
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Si lo dejas vacío, se asignará un nombre al azar.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 bg-gray-50 dark:bg-gray-700/30 border-t dark:border-gray-700 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-md transition-transform transform active:scale-95"
                    >
                        Confirmar Partido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchSetupModal;
