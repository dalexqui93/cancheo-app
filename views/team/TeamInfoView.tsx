import React, { useState } from 'react';
import type { Team, Player } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { ShieldIcon } from '../../components/icons/ShieldIcon';
import { UserPlusIcon } from '../../components/icons/UserPlusIcon';
import { SearchIcon } from '../../components/icons/SearchIcon';
import { PhotoIcon } from '../../components/icons/PhotoIcon';
import { BellSlashIcon } from '../../components/icons/BellSlashIcon';
import { LogoutIcon } from '../../components/icons/LogoutIcon';
import { ExclamationTriangleIcon } from '../../components/icons/ExclamationTriangleIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { DotsVerticalIcon } from '../../components/icons/DotsVerticalIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';
// FIX: Import TrashIcon to fix 'Cannot find name' error.
import { TrashIcon } from '../../components/icons/TrashIcon';

interface TeamInfoViewProps {
    team: Team;
    currentUser: Player;
    onBack: () => void;
    onUpdateTeam: (updates: Partial<Team>) => void;
    onClearChat: () => void;
}

const TeamInfoView: React.FC<TeamInfoViewProps> = ({ team, currentUser, onBack, onUpdateTeam, onClearChat }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isClearChatModalOpen, setIsClearChatModalOpen] = useState(false);
    const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);

    const isCaptain = currentUser.id === team.captainId;

    const handleMessagingPermissionChange = (isAllMembers: boolean) => {
        if (!isCaptain) return;
        onUpdateTeam({ messagingPermissions: isAllMembers ? 'all' : 'captain' });
    };

    const handleLeaveTeam = () => {
        const updatedPlayers = team.players.filter(p => p.id !== currentUser.id);
        onUpdateTeam({ players: updatedPlayers });
        // NOTE: In a real app, we'd also need to update the user's teamId and navigate away.
        // This is simplified for now.
        setIsLeaveModalOpen(false);
        onBack(); // Go back to chat which will then redirect
    };

    const handleRemovePlayer = () => {
        if (playerToRemove && isCaptain) {
            const updatedPlayers = team.players.filter(p => p.id !== playerToRemove.id);
            onUpdateTeam({ players: updatedPlayers });
        }
        setPlayerToRemove(null);
    };

    const handleClearChatConfirm = () => {
        onClearChat();
        setIsClearChatModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white animate-fade-in">
            <header className="flex-shrink-0 flex items-center p-4 border-b border-white/10 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
                <button onClick={onBack} className="p-2 rounded-full text-gray-300 hover:text-white mr-4">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="font-bold text-lg">Info. del equipo</h2>
            </header>

            <main className="overflow-y-auto pb-8">
                <div className="flex flex-col items-center p-6 bg-gray-800/30">
                    <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-600 overflow-hidden mb-4">
                        {team.logo ? <img src={team.logo} alt="logo" className="w-full h-full object-cover rounded-full" /> : <ShieldIcon className="w-16 h-16 text-gray-500" />}
                    </div>
                    <h1 className="text-3xl font-bold">{team.name}</h1>
                    <p className="text-gray-400">Equipo · {team.players.length} miembros</p>
                </div>

                <div className="px-4 space-y-4 mt-4">
                    {isCaptain && (
                        <div className="bg-gray-800/60 rounded-xl divide-y divide-white/10">
                             <div className="p-4">
                                <h3 className="text-sm font-semibold text-gray-400 mb-2">Ajustes del Equipo (Capitán)</h3>
                                <div className="p-2 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">Enviar mensajes</span>
                                    </div>
                                    <select 
                                        value={team.messagingPermissions || 'all'}
                                        onChange={(e) => handleMessagingPermissionChange(e.target.value === 'all')}
                                        className="bg-gray-700 text-white rounded-md p-1 text-sm border-gray-600"
                                    >
                                        <option value="all">Todos los miembros</option>
                                        <option value="captain">Solo capitanes</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-800/60 rounded-xl divide-y divide-white/10">
                        <div className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <BellSlashIcon className="w-5 h-5 text-gray-400"/>
                                <span className="font-semibold">Silenciar notificaciones</span>
                            </div>
                            <button
                                type="button"
                                className={`${ isMuted ? 'bg-green-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
                                role="switch" aria-checked={isMuted} onClick={() => setIsMuted(!isMuted)}>
                                <span className={`${isMuted ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-800/60 rounded-xl">
                        <div className="p-4">
                            <h3 className="text-sm font-semibold text-gray-400">{team.players.length} Miembros</h3>
                        </div>
                        <div className="divide-y divide-white/10">
                            {team.players.map(player => (
                                <div key={player.id} className="p-3 flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                                         {player.profilePicture ? <img src={player.profilePicture} alt={player.name} className="w-full h-full object-cover"/> : <UserIcon className="w-6 h-6 text-gray-500 m-2"/>}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{player.name}</p>
                                        <p className="text-xs text-gray-400">{player.position}</p>
                                    </div>
                                    {player.id === team.captainId && (
                                        <span className="text-xs font-bold text-yellow-400 border border-yellow-400/50 bg-yellow-400/10 px-2 py-0.5 rounded-full">Capitán</span>
                                    )}
                                    {isCaptain && player.id !== currentUser.id && (
                                        <div className="relative">
                                            <button className="p-2 text-gray-400 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 focus-within:opacity-100"><DotsVerticalIcon className="w-5 h-5"/></button>
                                            <div className="absolute right-0 mt-1 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10 hidden group-focus-within:block border border-gray-600">
                                                <button onClick={() => setPlayerToRemove(player)} className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-gray-600">Eliminar del equipo</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-800/60 rounded-xl divide-y divide-white/10">
                         {isCaptain && (
                            <button onClick={() => setIsClearChatModalOpen(true)} className="w-full p-4 flex items-center gap-3 text-red-500 font-semibold hover:bg-red-500/10 transition-colors">
                                <TrashIcon className="w-5 h-5"/>
                                <span>Vaciar Historial del Chat</span>
                            </button>
                         )}
                         <button onClick={() => setIsLeaveModalOpen(true)} className="w-full p-4 flex items-center gap-3 text-red-500 font-semibold hover:bg-red-500/10 transition-colors">
                             <LogoutIcon className="w-5 h-5"/>
                             <span>Salir del equipo</span>
                         </button>
                         <button className="w-full p-4 flex items-center gap-3 text-red-500 font-semibold hover:bg-red-500/10 transition-colors">
                             <ExclamationTriangleIcon className="w-5 h-5"/>
                             <span>Reportar equipo</span>
                         </button>
                    </div>
                </div>
            </main>

            <ConfirmationModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onConfirm={handleLeaveTeam}
                title="¿Salir del equipo?"
                message={`¿Estás seguro de que quieres abandonar a ${team.name}?`}
                confirmButtonText="Sí, salir"
            />
             <ConfirmationModal
                isOpen={!!playerToRemove}
                onClose={() => setPlayerToRemove(null)}
                onConfirm={handleRemovePlayer}
                title="¿Eliminar jugador?"
                message={`¿Estás seguro de que quieres eliminar a ${playerToRemove?.name} de ${team.name}?`}
                confirmButtonText="Sí, eliminar"
            />
            <ConfirmationModal
                isOpen={isClearChatModalOpen}
                onClose={() => setIsClearChatModalOpen(false)}
                onConfirm={handleClearChatConfirm}
                title="¿Vaciar Historial del Chat?"
                message="Esta acción eliminará permanentemente TODOS los mensajes, imágenes y audios para TODOS los miembros del equipo. Esta acción no se puede deshacer."
                confirmButtonText="Sí, eliminar todo"
            />
        </div>
    );
};

export default TeamInfoView;