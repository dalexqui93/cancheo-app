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

const RosterView: React.FC<RosterViewProps> = ({ team, isCaptain, onBack, onRemovePlayer, allUsers }) => {
    const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);

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
                    <button disabled className="flex items-center gap-2 bg-white/10 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/20 transition-colors shadow-sm text-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed">
                        <PlusIcon className="w-5 h-5" />
                        Añadir desde Fichajes
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

            <ConfirmationModal
                isOpen={!!playerToRemove}
                onClose={() => setPlayerToRemove(null)}
                onConfirm={handleConfirmRemove}
                title={`¿Expulsar a ${playerToRemove?.name}?`}
                message="Esta acción es permanente y el jugador será notificado. El cambio se registrará en el chat del equipo."
                confirmButtonText="Sí, expulsar"
            />
        </div>
    );
};

export default RosterView;