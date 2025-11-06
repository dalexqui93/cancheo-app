import React from 'react';
import type { ConfirmedBooking } from '../types';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';

interface ScorekeeperModalProps {
    booking: ConfirmedBooking;
    onClose: () => void;
    onUpdateScore: (bookingId: string, scoreA: number, scoreB: number) => void;
    onFinalizeMatch: (bookingId: string, scoreA: number, scoreB: number) => void;
}

const ScorekeeperModal: React.FC<ScorekeeperModalProps> = ({ booking, onClose, onUpdateScore, onFinalizeMatch }) => {
    const scoreA = booking.scoreA ?? 0;
    const scoreB = booking.scoreB ?? 0;

    const teamNameA = booking.teamName || booking.userName;
    const teamNameB = booking.rivalName || 'Rival';

    const handleScoreChange = (team: 'A' | 'B', delta: 1 | -1) => {
        const newScoreA = team === 'A' ? Math.max(0, scoreA + delta) : scoreA;
        const newScoreB = team === 'B' ? Math.max(0, scoreB + delta) : scoreB;
        onUpdateScore(booking.id, newScoreA, newScoreB);
    };

    const handleFinalize = () => {
        onFinalizeMatch(booking.id, scoreA, scoreB);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Anotador del Partido</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="p-6 grid grid-cols-2 gap-4 items-center">
                    {/* Team A */}
                    <div className="text-center space-y-3">
                        <h4 className="font-bold text-lg truncate h-12">{teamNameA}</h4>
                        <p className="text-7xl font-black">{scoreA}</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => handleScoreChange('A', -1)} className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center"><MinusIcon className="w-8 h-8"/></button>
                            <button onClick={() => handleScoreChange('A', 1)} className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center"><PlusIcon className="w-8 h-8"/></button>
                        </div>
                    </div>
                    {/* Team B */}
                     <div className="text-center space-y-3">
                        <h4 className="font-bold text-lg truncate h-12">{teamNameB}</h4>
                        <p className="text-7xl font-black">{scoreB}</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => handleScoreChange('B', -1)} className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center"><MinusIcon className="w-8 h-8"/></button>
                            <button onClick={() => handleScoreChange('B', 1)} className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center"><PlusIcon className="w-8 h-8"/></button>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-900/50 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-5 rounded-lg font-semibold bg-white/10 hover:bg-white/20">Cerrar</button>
                    <button onClick={handleFinalize} className="py-2 px-5 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 shadow-sm">Finalizar Partido</button>
                </div>
            </div>
        </div>
    );
};

export default ScorekeeperModal;