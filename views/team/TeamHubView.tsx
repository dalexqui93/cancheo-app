import React, { useState } from 'react';
import type { User, Team, Player, Notification, ChatMessage, SocialSection } from '../../types';
import RosterView from './RosterView';
import TacticsView from './TacticsView';
import ScheduleView from './ScheduleView';
import PerformanceView from './PerformanceView';
import { ShieldIcon } from '../../components/icons/ShieldIcon';
import { TshirtIcon } from '../../components/icons/TshirtIcon';
import { ClipboardListIcon } from '../../components/icons/ClipboardListIcon';
import { CalendarIcon } from '../../components/icons/CalendarIcon';
import { ChartBarIcon } from '../../components/icons/ChartBarIcon';
import { ChatBubbleLeftRightIcon } from '../../components/icons/ChatBubbleLeftRightIcon';
import { DashboardIcon } from '../../components/icons/DashboardIcon';
import { CalendarDaysIcon } from '../../components/icons/CalendarDaysIcon';
import { TeamFormIcon } from '../../components/icons/TeamFormIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { SoccerBallIcon } from '../../components/icons/SoccerBallIcon';
import { ShoeIcon } from '../../components/icons/ShoeIcon';

type TeamView = 'dashboard' | 'roster' | 'tactics' | 'schedule' | 'performance';

interface TeamHubViewProps {
    team: Team;
    user: User;
    allUsers: User[];
    onBack: () => void;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
    onUpdateTeam: (team: Partial<Team>) => void;
    setIsPremiumModalOpen: (isOpen: boolean) => void;
    setSection: (section: SocialSection) => void;
    onUpdateUserTeam: (teamId: string) => Promise<void>;
}

const mockMessages: ChatMessage[] = [
    { id: 'msg1', senderId: 'u2', senderName: 'Ana García', text: 'Hola equipo, ¿listos para el partido del sábado?', timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 3) },
    { id: 'msg2', senderId: 'u1', senderName: 'Carlos Pérez', text: '¡Claro que sí! Con toda.', timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 2.5), replyTo: { senderName: 'Ana García', text: 'Hola equipo, ¿listos pa...' } },
    { id: 'msg3', senderId: 'u3', senderName: 'Luis Fernandez', text: 'Yo llevo los balones. ¿Alguien puede llevar los petos?', timestamp: new Date(new Date().getTime() - 1000 * 60 * 50) },
    { id: 'msg4', senderId: 'u4', senderName: 'Marta Gomez', text: 'Yo los llevo!', timestamp: new Date(new Date().getTime() - 1000 * 60 * 48) },
];


const NavTab: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 sm:px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
            isActive
                ? 'border-[var(--color-primary-400)] text-white'
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
        }`}
    >
        {icon}
        <span className="hidden sm:inline text-sm">{label}</span>
    </button>
);

const HeaderStatCard: React.FC<{ label: string; value: string | number; colorClass: string }> = ({ label, value, colorClass }) => (
    <div className="text-center">
        <p className={`text-4xl font-black ${colorClass}`}>{value}</p>
        <p className="text-sm text-white/70 font-semibold uppercase tracking-wider">{label}</p>
    </div>
);

const Widget: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string, onClick?: () => void }> = ({ title, icon, children, className = '', onClick }) => (
    <div 
        onClick={onClick} 
        className={`bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4 transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-white/30 hover:-translate-y-1' : ''} ${className}`}
    >
        <div className="flex items-center gap-3 mb-3">
            <div className="text-[var(--color-primary-400)]">{icon}</div>
            <h3 className="font-bold text-white/90">{title}</h3>
        </div>
        <div>{children}</div>
    </div>
);

const DashboardGrid: React.FC<{ team: Team; setView: (view: TeamView) => void, setSection: (section: SocialSection) => void }> = ({ team, setView, setSection }) => {
    const nextMatch = team.schedule?.filter(e => e.type === 'match' && e.date >= new Date()).sort((a,b) => a.date.getTime() - b.date.getTime())[0];
    const topScorer = [...team.players].sort((a, b) => b.stats.goals - a.stats.goals)[0];
    const topAssister = [...team.players].sort((a, b) => b.stats.assists - a.stats.assists)[0];
    
    const teamForm = (team.matchHistory || [])
        .slice(0, 5)
        .map(match => {
            if (!match.scoreA || !match.scoreB) return { result: 'D', key: match.id};
            const isTeamA = 'id' in match.teamA && match.teamA.id === team.id;
            const scoreUs = isTeamA ? match.scoreA : match.scoreB;
            const scoreThem = isTeamA ? match.scoreB : match.scoreA;
            if (scoreUs > scoreThem) return { result: 'W', key: match.id};
            if (scoreUs < scoreThem) return { result: 'L', key: match.id};
            return { result: 'D', key: match.id};
        });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            <Widget title="Próximo Partido" icon={<CalendarDaysIcon className="w-5 h-5"/>} className="lg:col-span-2">
                {nextMatch ? (
                    <div>
                        <p className="font-bold text-lg">{nextMatch.title}</p>
                        <p className="text-sm text-white/70">{nextMatch.date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                        <p className="text-xs text-white/50">@{nextMatch.location}</p>
                    </div>
                ) : <p className="text-sm text-white/60">No hay partidos programados.</p>}
            </Widget>
            <Widget title="Forma Reciente" icon={<TeamFormIcon className="w-5 h-5"/>}>
                <div className="flex items-center gap-2">
                    {teamForm.map(item => {
                        const colors = {
                            W: 'bg-green-500',
                            D: 'bg-yellow-500',
                            L: 'bg-red-500',
                        };
                        return <div key={item.key} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${colors[item.result]}`}>{item.result}</div>
                    })}
                    {teamForm.length === 0 && <p className="text-sm text-white/60">Sin partidos recientes.</p>}
                </div>
            </Widget>
            <Widget title="Chat Rápido" icon={<ChatBubbleLeftRightIcon className="w-5 h-5"/>} onClick={() => setSection('chat')}>
                 <div className="space-y-1 text-sm">
                    <p className="truncate"><strong className="text-white/80">{mockMessages.slice(-1)[0]?.senderName}:</strong> <span className="text-white/60">{mockMessages.slice(-1)[0]?.text}</span></p>
                 </div>
            </Widget>
            <Widget title="Máximo Goleador" icon={<SoccerBallIcon className="w-5 h-5"/>} className="lg:col-span-2">
                {topScorer && topScorer.stats.goals > 0 ? (
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-black/30 flex items-center justify-center shadow-md border-2 border-white/20 overflow-hidden flex-shrink-0">
                            {topScorer.profilePicture ? <img src={topScorer.profilePicture} alt={topScorer.name} className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-white/70" />}
                        </div>
                        <div>
                            <p className="font-bold text-lg">{topScorer.name}</p>
                            <p className="text-3xl font-black text-[var(--color-primary-400)]">{topScorer.stats.goals} <span className="text-xl">Goles</span></p>
                        </div>
                    </div>
                ): <p className="text-sm text-white/60">Aún no hay un goleador destacado.</p>}
            </Widget>
            <Widget title="Máximo Asistente" icon={<ShoeIcon className="w-5 h-5"/>} className="lg:col-span-2">
                 {topAssister && topAssister.stats.assists > 0 ? (
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-black/30 flex items-center justify-center shadow-md border-2 border-white/20 overflow-hidden flex-shrink-0">
                            {topAssister.profilePicture ? <img src={topAssister.profilePicture} alt={topAssister.name} className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-white/70" />}
                        </div>
                        <div>
                            <p className="font-bold text-lg">{topAssister.name}</p>
                            <p className="text-3xl font-black text-blue-400">{topAssister.stats.assists} <span className="text-xl">Asist.</span></p>
                        </div>
                    </div>
                ): <p className="text-sm text-white/60">Aún no hay un asistente destacado.</p>}
            </Widget>
        </div>
    );
};


const TeamHubView: React.FC<TeamHubViewProps> = ({ team, user, allUsers, onBack, addNotification, onUpdateTeam, setIsPremiumModalOpen, setSection }) => {
    const [view, setView] = useState<TeamView>('dashboard');

    const isCaptain = user.id === team.captainId;

    const handleUpdatePlayer = (updatedPlayer: Player) => {
        if (!isCaptain) return;
        const updatedPlayers = team.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
        onUpdateTeam({ ...team, players: updatedPlayers });
        addNotification({type: 'success', title: 'Jugador Actualizado', message: `${updatedPlayer.name} ha sido actualizado.`})
    };

    const handleAddPlayer = (newPlayer: Player) => {
        if (!isCaptain) return;
        const updatedPlayers = [...team.players, newPlayer];
        onUpdateTeam({ ...team, players: updatedPlayers });
        addNotification({type: 'success', title: 'Jugador Añadido', message: `${newPlayer.name} se ha unido al equipo.`})
    };
    
    const handleRemovePlayer = (playerId: string) => {
        if (!isCaptain) return;
        const updatedPlayers = team.players.filter(p => p.id !== playerId);
        onUpdateTeam({ ...team, players: updatedPlayers });
        addNotification({type: 'info', title: 'Jugador Eliminado', message: 'El jugador ha sido eliminado de la plantilla.'})
    }
    
    const TABS: { id: TeamView | 'chat'; label: string; icon: React.ReactNode }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5"/> },
        { id: 'roster', label: 'Plantilla', icon: <TshirtIcon className="w-5 h-5"/> },
        { id: 'tactics', label: 'Tácticas', icon: <ClipboardListIcon className="w-5 h-5"/> },
        { id: 'schedule', label: 'Calendario', icon: <CalendarIcon className="w-5 h-5"/> },
        { id: 'performance', label: 'Rendimiento', icon: <ChartBarIcon className="w-5 h-5"/> },
        { id: 'chat', label: 'Chat', icon: <ChatBubbleLeftRightIcon className="w-5 h-5"/> },
    ];

    const renderContent = () => {
        switch (view) {
            case 'roster':
                return <RosterView team={team} isCaptain={isCaptain} onBack={() => setView('dashboard')} onUpdatePlayer={handleUpdatePlayer} onAddPlayer={handleAddPlayer} onRemovePlayer={handleRemovePlayer} allUsers={allUsers} />;
            case 'tactics':
                return <TacticsView team={team} isCaptain={isCaptain} onBack={() => setView('dashboard')} onUpdateTeam={onUpdateTeam} user={user} setIsPremiumModalOpen={setIsPremiumModalOpen} />;
            case 'schedule':
                return <ScheduleView team={team} isCaptain={isCaptain} onBack={() => setView('dashboard')} onUpdateTeam={onUpdateTeam} addNotification={addNotification} />;
            case 'performance':
                return <PerformanceView team={team} isCaptain={isCaptain} onBack={() => setView('dashboard')} onUpdateTeam={onUpdateTeam} />;
            case 'dashboard':
            default:
                return <DashboardGrid team={team} setView={setView} setSection={setSection} />;
        }
    };

    return (
         <div className="min-h-screen p-4 sm:p-6 pb-[5.5rem] md:pb-4">
            
            {/* Team Header */}
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative holographic-shine">
                <div className="flex items-center gap-4 mb-6">
                    {team.logo ? <img src={team.logo} alt={`${team.name} logo`} className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-lg" /> : <div className="w-24 h-24 rounded-full bg-black/30 flex items-center justify-center border-4 border-white/20 shadow-lg"><ShieldIcon className="w-12 h-12 text-gray-400" /></div>}
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">{team.name}</h1>
                        <p className="opacity-80 font-semibold">{team.level}</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <HeaderStatCard label="Victorias" value={team.stats.wins} colorClass="text-green-400" />
                    <HeaderStatCard label="Empates" value={team.stats.draws} colorClass="text-yellow-400" />
                    <HeaderStatCard label="Derrotas" value={team.stats.losses} colorClass="text-red-400" />
                </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex space-x-1 sm:space-x-2 border-b border-white/10 mt-6 overflow-x-auto scrollbar-hide">
                {TABS.map(tab => (
                    <NavTab 
                        key={tab.id}
                        label={tab.label}
                        icon={tab.icon}
                        isActive={view === tab.id}
                        onClick={() => {
                            if (tab.id === 'chat') {
                                setSection('chat');
                            } else {
                                setView(tab.id as TeamView);
                            }
                        }}
                    />
                ))}
            </nav>
            
            {/* Content Area */}
            <main className="mt-6">
                {renderContent()}
            </main>
        </div>
    );
};

export default TeamHubView;