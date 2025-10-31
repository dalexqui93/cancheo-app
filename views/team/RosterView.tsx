import React, { useState } from 'react';
import type { Team, Player } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { XIcon } from '../../components/icons/XIcon';
import StarRating from '../../components/StarRating';

interface RosterViewProps {
    team: Team;
    onBack: () => void;
    onUpdatePlayer: (player: Player) => void;
    onAddPlayer: (player: Player) => void;
    onRemovePlayer: (playerId: string) => void;
    allPlayers: Player[]; // All available players in the system
}

const levelToRating = (level: Player['level']): number => {
    switch (level) {
        case 'Casual': return 2;
        case 'Intermedio': return 3.5;
        case 'Competitivo': return 5;
        default: return 0;
    }
};

const PlayerCard: React.FC<{ player: Player; isCaptain: boolean; onRemove: () => void; }> = ({ player, isCaptain, onRemove }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 flex items-center gap-4 relative">
        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
            {player.profilePicture ? <img src={player.profilePicture} alt={player.name} className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-slate-500 dark:text-gray-400"/>}
        </div>
        <div className="flex-grow">
            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{player.name} {isCaptain && <span className="text-xs font-bold text-yellow-500 ml-1">C</span>}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{player.position}</p>
            <div className="mt-1 flex items-center gap-2">
                <StarRating rating={levelToRating(player.level)} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{player.level}</span>
            </div>
        </div>
        <div className="text-3xl font-black text-gray-200 dark:text-gray-600">{player.number || '-'}</div>
        {!isCaptain && (
            <button onClick={onRemove} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <TrashIcon className="w-4 h-4" />
            </button>
        )}
    </div>
);

const AddPlayerModal: React.FC<{ 
    availablePlayers: Player[];
    onAdd: (player: Player) => void;
    onClose: () => void; 
}> = ({ availablePlayers, onAdd, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-2xl font-bold">Añadir Jugador</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-3">
                    {availablePlayers.map(player => (
                        <div key={player.id} className="p-3 bg-slate-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-semibold">{player.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{player.position} - {player.level}</p>
                            </div>
                            <button onClick={() => { onAdd(player); onClose(); }} className="bg-[var(--color-primary-600)] text-white font-bold py-1.5 px-4 rounded-lg hover:bg-[var(--color-primary-700)] text-sm">
                                Añadir
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const RosterView: React.FC<RosterViewProps> = ({ team, onBack, onUpdatePlayer, onAddPlayer, onRemovePlayer, allPlayers }) => {
    const [isAddingPlayer, setIsAddingPlayer] = useState(false);
    
    const availablePlayers = allPlayers.filter(p => !team.players.some(tp => tp.id === p.id));
    
    return (
        <div className="pb-24 md:pb-4">
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold mb-6 hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver al Panel
            </button>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Plantilla del Equipo</h1>
                <button onClick={() => setIsAddingPlayer(true)} className="flex items-center gap-2 bg-[var(--color-primary-600)] text-white font-bold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-sm text-sm">
                    <PlusIcon className="w-5 h-5" />
                    Añadir Jugador
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.players.map(player => (
                    <PlayerCard 
                        key={player.id} 
                        player={player} 
                        isCaptain={team.captainId === player.id}
                        onRemove={() => onRemovePlayer(player.id)}
                    />
                ))}
            </div>

            {isAddingPlayer && (
                <AddPlayerModal 
                    availablePlayers={availablePlayers}
                    onAdd={onAddPlayer}
                    onClose={() => setIsAddingPlayer(false)}
                />
            )}
        </div>
    );
};

export default RosterView;