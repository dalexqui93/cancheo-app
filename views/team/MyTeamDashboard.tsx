import React, { useState } from 'react';
import type { User, Team, Player, Notification, ChatMessage } from '../../types';
import RosterView from './RosterView';
import TacticsView from './TacticsView';
import ScheduleView from './ScheduleView';
import CreateTeamView from './CreateTeamView';
import PerformanceView from './PerformanceView';
import TeamChatView from './TeamChatView';
import { ShieldIcon } from '../../components/icons/ShieldIcon';
import { TshirtIcon } from '../../components/icons/TshirtIcon';
import { ClipboardListIcon } from '../../components/icons/ClipboardListIcon';
import { CalendarIcon } from '../../components/icons/CalendarIcon';
import { ChartBarIcon } from '../../components/icons/ChartBarIcon';
import { ChatBubbleLeftRightIcon } from '../../components/icons/ChatBubbleLeftRightIcon';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';


type TeamView = 'dashboard' | 'roster' | 'tactics' | 'schedule' | 'performance' | 'chat';

interface MyTeamDashboardProps {
    team: Team | undefined;
    onBack: () => void;
    addNotification: (notif: Omit<Notification, 'id'>) => void;
    onUpdateTeam: (team: Team) => void;
    onCreateTeam: (teamData: { name: string; logo: string | null; level: 'Casual' | 'Intermedio' | 'Competitivo' }) => void;
    allPlayers: Player[];
}

const mockMessages: ChatMessage[] = [
    { id: 'msg1', senderId: 'u2', senderName: 'Ana García', text: 'Hola equipo, ¿listos para el partido del sábado?', timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 3) },
    { id: 'msg2', senderId: 'u1', senderName: 'Carlos Pérez', text: '¡Claro que sí! Con toda.', timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 2.5), replyTo: { senderName: 'Ana García', text: 'Hola equipo, ¿listos pa...' } },
    { id: 'msg3', senderId: 'u3', senderName: 'Luis Fernandez', text: 'Yo llevo los balones. ¿Alguien puede llevar los petos?', timestamp: new Date(new Date().getTime() - 1000 * 60 * 50) },
    { id: 'msg4', senderId: 'u4', senderName: 'Marta Gomez', text: 'Yo los llevo!', timestamp: new Date(new Date().getTime() - 1000 * 60 * 48) },
];


const StatCard: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center">
        <p className={`text-4xl font-black ${color}`}>{value}</p>
        <p className="text-sm text-white/80 font-semibold uppercase tracking-wider">{label}</p>
    </div>
);

const NavCard: React.FC<{ title: string; icon: React.ReactNode; onClick: () => void }> = ({ title, icon, onClick }) => (
    <button onClick={onClick} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border dark:border-gray-700 text-left w-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 bg-slate-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] mb-3">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
    </button>
);

const MyTeamDashboard: React.FC<MyTeamDashboardProps> = ({ team, onBack, addNotification, onUpdateTeam, onCreateTeam, allPlayers }) => {
    const [view, setView] = useState<TeamView>('dashboard');
    const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);


    if (!team) {
        return <CreateTeamView onBack={onBack} onCreate={onCreateTeam} />;
    }
    
    const handleSendMessage = (text: string, replyToMessage: ChatMessage | null) => {
        const currentUser = team.players.find(p => p.id === 'u1'); // Hardcoded for demo
        if (!currentUser) return;

        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderProfilePicture: currentUser.profilePicture,
            text: text,
            timestamp: new Date(),
            replyTo: replyToMessage ? {
                senderName: replyToMessage.senderName,
                text: replyToMessage.text
            } : undefined
        };
        setMessages(prev => [...prev, newMessage]);
    };


    const handleUpdatePlayer = (updatedPlayer: Player) => {
        const updatedPlayers = team.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
        onUpdateTeam({ ...team, players: updatedPlayers });
        addNotification({type: 'success', title: 'Jugador Actualizado', message: `${updatedPlayer.name} ha sido actualizado.`})
    };

    const handleAddPlayer = (newPlayer: Player) => {
        const updatedPlayers = [...team.players, newPlayer];
        onUpdateTeam({ ...team, players: updatedPlayers });
        addNotification({type: 'success', title: 'Jugador Añadido', message: `${newPlayer.name} se ha unido al equipo.`})
    };
    
    const handleRemovePlayer = (playerId: string) => {
        const updatedPlayers = team.players.filter(p => p.id !== playerId);
        onUpdateTeam({ ...team, players: updatedPlayers });
        addNotification({type: 'info', title: 'Jugador Eliminado', message: 'El jugador ha sido eliminado de la plantilla.'})
    }

    switch (view) {
        case 'roster':
            return <RosterView team={team} onBack={() => setView('dashboard')} onUpdatePlayer={handleUpdatePlayer} onAddPlayer={handleAddPlayer} onRemovePlayer={handleRemovePlayer} allPlayers={allPlayers} />;
        case 'tactics':
            return <TacticsView team={team} onBack={() => setView('dashboard')} onUpdateTeam={onUpdateTeam} />;
        case 'schedule':
            return <ScheduleView team={team} onBack={() => setView('dashboard')} onUpdateTeam={onUpdateTeam} addNotification={addNotification} />;
        case 'performance':
            return <PerformanceView team={team} onBack={() => setView('dashboard')} onUpdateTeam={onUpdateTeam} />;
        case 'chat':
             const currentUser = team.players.find(p => p.id === 'u1'); // Hardcoding current user for now
             return <TeamChatView
                 team={team}
                 messages={messages}
                 currentUser={currentUser!}
                 onSendMessage={handleSendMessage}
                 onBack={() => setView('dashboard')}
             />;
        case 'dashboard':
        default:
            const upcomingEvents = team.schedule
                .filter(e => e.date >= new Date())
                .sort((a,b) => a.date.getTime() - b.date.getTime())
                .slice(0, 2);

            return (
                <div className="space-y-6 pb-24 md:pb-4">
                    <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold hover:underline">
                        <ChevronLeftIcon className="h-5 w-5" />
                        Volver a DaviPlay
                    </button>
                    {/* Header Section */}
                    <div className="bg-cover bg-center rounded-2xl p-6 text-white shadow-lg -mx-4" style={{backgroundImage: "linear-gradient(to right, rgba(22, 163, 74, 0.9), rgba(30, 58, 138, 0.9)), url('https://picsum.photos/seed/team-bg/1200/400')"}}>
                        <div className="flex items-center gap-4 mb-4">
                            {team.logo ? <img src={team.logo} alt={`${team.name} logo`} className="w-20 h-20 rounded-full object-cover border-4 border-white/50" /> : <ShieldIcon className="w-20 h-20 opacity-80" />}
                            <div>
                                <h1 className="text-4xl font-black tracking-tight">{team.name}</h1>
                                <p className="opacity-80 font-semibold">{team.level}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <StatCard label="Victorias" value={team.stats.wins} color="text-green-300" />
                            <StatCard label="Empates" value={team.stats.draws} color="text-yellow-300" />
                            <StatCard label="Derrotas" value={team.stats.losses} color="text-red-400" />
                        </div>
                    </div>
                    
                    {/* Navigation */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <NavCard title="Plantilla" icon={<TshirtIcon className="w-8 h-8"/>} onClick={() => setView('roster')} />
                            <NavCard title="Tácticas" icon={<ClipboardListIcon className="w-8 h-8"/>} onClick={() => setView('tactics')} />
                            <NavCard title="Calendario" icon={<CalendarIcon className="w-8 h-8"/>} onClick={() => setView('schedule')} />
                            <NavCard title="Rendimiento" icon={<ChartBarIcon className="w-8 h-8"/>} onClick={() => setView('performance')} />
                        </div>
                        <button
                            onClick={() => setView('chat')}
                            className="w-full bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-800)] hover:from-[var(--color-primary-500)] hover:to-[var(--color-primary-700)] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg transform hover:-translate-y-px hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] dark:focus:ring-offset-gray-900"
                        >
                            <ChatBubbleLeftRightIcon className="w-6 h-6"/>
                            <span>Chat del equipo</span>
                        </button>
                    </div>

                    {/* Upcoming & Chat */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border dark:border-gray-700">
                             <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Próximos Eventos</h3>
                            {upcomingEvents.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingEvents.map(event => (
                                         <div key={event.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="text-center w-12 flex-shrink-0">
                                                <p className="font-bold text-xs text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] uppercase">{event.date.toLocaleDateString('es-CO', {month: 'short'})}</p>
                                                <p className="font-black text-2xl text-gray-800 dark:text-gray-200">{event.date.getDate()}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">{event.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{event.type === 'match' ? 'Partido' : 'Entrenamiento'} - {event.date.toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'})}</p>
                                            </div>
                                         </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-4 text-gray-500 dark:text-gray-400">No hay eventos programados.</p>
                            )}
                         </div>
                         <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border dark:border-gray-700">
                             <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Último Mensaje</h3>
                             <div className="space-y-2 text-sm">
                                 <p><strong className="text-blue-600 dark:text-blue-400">{messages.slice(-1)[0]?.senderName}:</strong> {messages.slice(-1)[0]?.text}</p>
                             </div>
                         </div>
                    </div>
                </div>
            );
    }
};

export default MyTeamDashboard;