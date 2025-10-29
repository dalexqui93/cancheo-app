
import React, { useState } from 'react';
import type { UserLoyalty, SoccerField, Loyalty } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface LoyaltyStatusProps {
    loyaltyData: UserLoyalty;
    allFields: SoccerField[];
}

const LoyaltyStatus: React.FC<LoyaltyStatusProps> = ({ loyaltyData, allFields }) => {
    const [isOpen, setIsOpen] = useState(false);

    const loyaltyFieldIds = Object.keys(loyaltyData).filter(
        fieldId => {
            const loyalty = loyaltyData[fieldId];
            const field = allFields.find(f => f.id === fieldId);
            return field && field.loyaltyEnabled && loyalty && (loyalty.progress > 0 || loyalty.freeTickets > 0);
        }
    );

    const totalFreeTickets = (Object.values(loyaltyData) as Loyalty[]).reduce((sum, loyalty) => sum + loyalty.freeTickets, 0);

    if (loyaltyFieldIds.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:border dark:border-gray-700 p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">Juega partidos para ganar recompensas de fidelidad en tus canchas favoritas.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:border dark:border-gray-700">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
                aria-expanded={isOpen}
            >
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Programa de Fidelidad</h3>
                <div className="flex items-center gap-4">
                    {totalFreeTickets > 0 && (
                        <div className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
                            <span className="text-lg">🎟️</span>
                            <span>{totalFreeTickets} Cancha{totalFreeTickets > 1 ? 's' : ''} Gratis</span>
                        </div>
                    )}
                    <ChevronDownIcon className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-4">
                            {loyaltyFieldIds.map(fieldId => {
                                const field = allFields.find(f => f.id === fieldId);
                                const loyalty = loyaltyData[fieldId];
                                if (!field || !loyalty || !field.loyaltyGoal) return null;

                                const progressPercentage = (loyalty.progress / field.loyaltyGoal) * 100;
                                const segments = Array.from({ length: field.loyaltyGoal });

                                return (
                                    <div key={fieldId}>
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{field.name}</p>
                                            <div className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400">
                                                <span
                                                    className="text-xl transition-all duration-300"
                                                    style={{
                                                        filter: loyalty.freeTickets > 0 ? 'grayscale(0)' : 'grayscale(1)',
                                                        opacity: loyalty.freeTickets > 0 ? 1 : 0.6,
                                                    }}
                                                >
                                                    🎟️
                                                </span>
                                                <span>{loyalty.freeTickets} Gratis</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden relative">
                                            <div 
                                                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-700 ease-out" 
                                                style={{ width: `${progressPercentage}%` }}
                                            ></div>
                                            <div className="absolute inset-0 flex justify-between px-1">
                                                {segments.map((_, i) => (
                                                    <div key={i} className={`h-full w-0.5 ${i < (field.loyaltyGoal - 1) ? 'bg-white/50 dark:bg-black/30' : ''}`}></div>
                                                ))}
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>{loyalty.progress} / {field.loyaltyGoal}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyStatus;
