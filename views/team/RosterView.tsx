import React, { useState } from 'react';
import type { Team, Player, User } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { XIcon } from '../../components/icons/XIcon';
import StarRating from '../../components/StarRating';
import ConfirmationModal from '../../components/ConfirmationModal';

interface RosterViewProps {
    team: Team;
    isCaptain: boolean;
    onBack: () => void;
    onUpdatePlayer: (player: Player) => void;
    onAddPlayer: (player: Player) => void;
    onRemovePlayer: (playerId: string) => void;
    allUsers: User[]; // All available users in the system
}

const levelToRating = (level: Player['level']): number => {
    switch (level) {
        case 'Casual': return 2;
        case 'Intermedio': return 3.5;
        case 'Competitivo': return 5;
        default: return typeof level === 'number' ? level : 0;
    }
};

const PlayerCard: React.FC<{ player: Player; isCaptainOfTeam: boolean; canRemove: boolean; onRemove: () => void; }> = ({ player, isCaptainOfTeam, canRemove, onRemove }) => (
    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4 relative">
        <div className="w-16 h-16 rounded-full bg-black/30 flex items-center justify-center shadow-md border-2 border-white/20 overflow-hidden flex-shrink-0">
            {player.profilePicture ? <img src={player.profilePicture} alt={player.name} className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-gray-400"/>}
        </div>
        <div className="flex-grow">
            <p className="font-bold text-lg text-white">
                {player.name} 
                {isCaptainOfTeam && <span className="text-xs font-bold text-yellow-400 ml-2">(C)</span>}
            </p>
            <p className="text-sm text-gray-400">{player.position}</p>
            <div className="mt-1 flex items-center gap-2">
                <StarRating rating={levelToRating(player.level)} />
                <span className="text-xs text-gray-400">{typeof player.level === 'number' ? `Nvl ${player.level}`: player.level}</span>
            </div>
        </div>
        <div className="text-4xl font-black text-white/20">{player.number || '-'}</div>
        {canRemove && (
            <button onClick={onRemove} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-400 rounded-full hover:bg-white/10">
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
        <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-2xl font-bold">Añadir Jugador</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-6 h-6"/></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-3">
                    {availablePlayers.length > 0 ? (
                        availablePlayers.map(player => (
                            <div key={player.id} className="p-3 bg-black/20 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{player.name}</p>
                                    <p className="text-xs text-gray-400">{player.position} - {typeof player.level === 'number' ? `Nvl ${player.level}`: player.level}</p>
                                </div>
                                <button onClick={() => { onAdd(player); onClose(); }} className="bg-[var(--color-primary-600)] text-white font-bold py-1.5 px-4 rounded-lg hover:bg-[var(--color-primary-700)] text-sm">
                                    Añadir
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400">No hay más jugadores disponibles para añadir.</p>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const RosterView: React.FC<RosterViewProps> = ({ team, isCaptain, onBack, onUpdatePlayer, onAddPlayer, onRemovePlayer, allUsers }) => {
    const [isAddingPlayer, setIsAddingPlayer] = useState(false);
    const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);
    
    const availablePlayers = allUsers
        .filter(u => u.playerProfile && !team.players.some(tp => tp.id === u.id))
        .map(u => u.playerProfile!);
    
    const handleConfirmRemove = () => {
        if (playerToRemove) {
            onRemovePlayer(playerToRemove.id);
        }
        setPlayerToRemove(null);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Plantilla del Equipo</h1>
                {isCaptain && (
                    <button onClick={() => setIsAddingPlayer(true)} className="flex items-center gap-2 bg-white/10 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/20 transition-colors shadow-sm text-sm border border-white/20">
                        <PlusIcon className="w-5 h-5" />
                        Añadir Jugador
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.players.map(player => (
                    <PlayerCard 
                        key={player.id} 
                        player={player} 
                        isCaptainOfTeam={team.captainId === player.id}
                        canRemove={isCaptain && team.captainId !== player.id}
                        onRemove={() => setPlayerToRemove(player)}
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

            <ConfirmationModal
                isOpen={!!playerToRemove}
                onClose={() => setPlayerToRemove(null)}
                onConfirm={handleConfirmRemove}
                title={`¿Expulsar a ${playerToRemove?.name}?`}
                message="Esta acción eliminará al jugador del equipo. El jugador será notificado de su expulsión."
                confirmButtonText="Sí, expulsar"
            />
        </div>
    );
};

export default RosterView;