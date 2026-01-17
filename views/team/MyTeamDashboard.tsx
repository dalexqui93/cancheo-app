import React, { useState, useEffect } from 'react';
import type { User, Team, Player, Notification, ChatMessage, SocialSection, UserMessage, ConfirmedBooking, SystemMessage } from '../../types';
import RosterView from './RosterView';
import TacticsView from './TacticsView';
import ScheduleView from './ScheduleView';
import CreateTeamView from './CreateTeamView';
import PerformanceView from './PerformanceView';
import { ShieldIcon } from '../../components/icons/ShieldIcon';
import { TshirtIcon } from '../../components/icons/TshirtIcon';
import { ClipboardListIcon } from '../../components/icons/ClipboardListIcon';
import { CalendarIcon } from '../../components/icons/CalendarIcon';
import { ChartBarIcon } from '../../components/icons/ChartBarIcon';
import { ChatBubbleLeftRightIcon } from '../../components/icons/ChatBubbleLeftRightIcon';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { DashboardIcon } from '../../components/icons/DashboardIcon';
import { CalendarDaysIcon } from '../../components/icons/CalendarDaysIcon';
import { TeamFormIcon } from '../../components/icons/TeamFormIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { SoccerBallIcon } from '../../components/icons/SoccerBallIcon';
import { ShoeIcon } from '../../components/icons/ShoeIcon';
import * as db from '../../database';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import { LogoutIcon } from '../../components/icons/LogoutIcon';

type TeamView = 'dashboard' | 'roster' | 'tactics' | 'schedule' | 'performance' | 'chat';

interface MyTeamDashboardProps {
    userTeams: Team[];
    user: User;
    allUsers: User[];
    allBookings: ConfirmedBooking[];
    allTeams: Team[];
    onBack: () => void;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
    onUpdateTeam: (teamId: string, updates: Partial<Team>) => void;
    setIsPremiumModalOpen: (isOpen: boolean) => void;
    onUpdateUserTeams: (teamIds: string[]) => Promise<void>;
    setSection: (section: SocialSection) => void;
    onRemovePlayerFromTeam: (teamId: string, playerId: string) => void;
    onLeaveTeam: (teamId: string) => void;
    setActiveChatTeam: (team: Team) => void;
}

const NavTab: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1.5 px-4 py-3 transition-all relative ${
            isActive
                ? 'text-brand'
                : 'text-textMuted-light dark:text-textMuted-dark hover:text-textMain-light dark:hover:text-textMain-dark'
        }`}
    >
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        {isActive && (
            <div className="absolute bottom-0 left-4 right-4 h-1 bg-brand rounded-t-full shadow-[0_-4px_10px_rgba(29,185,84,0.4)]"></div>
        )}
    </button>
);

const HeaderStatCard: React.FC<{ label: string; value: string | number; colorClass: string }> = ({ label, value, colorClass }) => (
    <div className="flex flex-col items-center justify-center py-2 px-4 border-r border-borderDefault-light dark:border-borderDefault-dark last:border-none">
        <p className={`text-2xl font-black italic tracking-tighter ${colorClass}`}>{value}</p>
        <p className="text-[9px] font-bold text-textMuted-light dark:text-textMuted-dark uppercase tracking-widest">{label}</p>
    </div>
);

const Widget: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string, onClick?: () => void }> = ({ title, icon, children, className = '', onClick }) => (
    <div 
        onClick={onClick} 
        className={`bg-bgSurface-light dark:bg-bgSurface-dark border border-borderDefault-light dark:border-borderDefault-dark rounded-[32px] p-6 shadow-premium-light dark:shadow-premium-dark transition-all duration-300 active:scale-[0.98] ${onClick ? 'cursor-pointer hover:shadow-lg' : ''} ${className}`}
    >
        <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-brand">
                {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
            </div>
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-textMuted-light dark:text-textMuted-dark">{title}</h3>
        </div>
        <div>{children}</div>
    </div>
);

const PlayerStatWidget: React.FC<{ player: Player | undefined; stat: number; label: string; icon: React.ReactNode; color: string; className?: string }> = ({ player, stat, label, icon, color, className = '' }) => (
    <div className={`bg-bgSurface-light dark:bg-bgSurface-dark border border-borderDefault-light dark:border-borderDefault-dark rounded-[32px] p-6 shadow-premium-light dark:shadow-premium-dark overflow-hidden relative group ${className}`}>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-8 h-8 rounded-xl ${color} text-white flex items-center justify-center shadow-lg`}>
                    {icon}
                </div>
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-textMuted-light dark:text-textMuted-dark">{label}</h3>
            </div>

            {player ? (
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-borderDefault-light dark:border-borderDefault-dark overflow-hidden flex-shrink-0 shadow-sm">
                        {player.profilePicture ? (
                            <img src={player.profilePicture} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-textDisabled-light dark:text-textDisabled-dark">
                                <UserIcon className="w-6 h-6" />
                            </div>
                        )}
                    </div>
                    <div className="flex-grow min-w-0">
                        <p className="text-xl font-black text-textMain-light dark:text-textMain-dark truncate uppercase italic tracking-tighter leading-none">{player.name.split(' ')[0]} {player.name.split(' ')[1]?.charAt(0)}.</p>
                        <p className="text-3xl font-black text-brand mt-1">{stat}</p>
                    </div>
                </div>
            ) : (
                <p className="text-xs font-bold text-textDisabled-light dark:text-textDisabled-dark uppercase">Sin datos registrados</p>
            )}
        </div>
        {/* Marca de agua decorativa */}
        <div className="absolute -right-4 -bottom-4 text-7xl font-black text-gray-50 dark:text-gray-900/50 pointer-events-none italic select-none">
            {stat}
        </div>
    </div>
);

const DashboardGrid: React.FC<{ team: Team; setView: (view: TeamView) => void, setSection: (section: SocialSection) => void, setActiveChatTeam: (team: Team) => void }> = ({ team, setView, setSection, setActiveChatTeam }) => {
    const nextMatch = team.schedule?.filter(e => e.type === 'match' && e.date >= new Date()).sort((a,b) => a.date.getTime() - b.date.getTime())[0];
    const topScorer = [...team.players].sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0))[0];
    const topAssister = [...team.players].sort((a, b) => (b.stats?.assists || 0) - (a.stats?.assists || 0))[0];
    
    const teamForm = (team.matchHistory || [])
        .slice(0, 5)
        .map(match => {
            if (typeof match.scoreA !== 'number' || typeof match.scoreB !== 'number') return { result: 'E', key: match.id};
            const isTeamA = 'id' in match.teamA && match.teamA.id === team.id;
            const scoreUs = isTeamA ? match.scoreA : match.scoreB;
            const scoreThem = isTeamA ? match.scoreB : match.scoreA;
            if (scoreUs > scoreThem) return { result: 'V', key: match.id};
            if (scoreUs < scoreThem) return { result: 'D', key: match.id};
            return { result: 'E', key: match.id};
        });

    return (
        <div className="space-y-6 animate-ios">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Widget Próximo Partido */}
                <Widget title="Calendario" icon={<CalendarDaysIcon />} className="md:col-span-1">
                    {nextMatch ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-black text-xl text-textMain-light dark:text-textMain-dark italic uppercase tracking-tighter leading-none">{nextMatch.title}</p>
                                <p className="text-xs font-bold text-brand mt-2 flex items-center gap-1 uppercase tracking-widest">
                                    <CalendarIcon className="w-3 h-3" />
                                    {nextMatch.date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · {nextMatch.date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 text-textDisabled-light" />
                        </div>
                    ) : (
                        <p className="text-xs font-bold text-textDisabled-light dark:text-textDisabled-dark uppercase tracking-widest">No hay partidos próximos</p>
                    )}
                </Widget>

                {/* Widget Forma */}
                <Widget title="Estado de Forma" icon={<TeamFormIcon />}>
                    <div className="flex items-center gap-2">
                        {teamForm.map(item => {
                            const colors: Record<string, string> = { 
                                V: 'bg-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.3)]', 
                                E: 'bg-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.3)]', 
                                D: 'bg-rose-500 shadow-[0_4px_12px_rgba(244,63,94,0.3)]' 
                            };
                            return (
                                <div key={item.key} className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs ${colors[item.result]}`}>
                                    {item.result}
                                </div>
                            );
                        })}
                        {teamForm.length === 0 && <p className="text-xs font-bold text-textDisabled-light dark:text-textDisabled-dark uppercase">Sin historial</p>}
                    </div>
                </Widget>
            </div>

            {/* Fichas de Jugadores Estrella */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PlayerStatWidget 
                    player={topScorer} 
                    stat={topScorer?.stats?.goals || 0} 
                    label="Pichichi" 
                    icon={<SoccerBallIcon className="w-4 h-4"/>} 
                    color="bg-amber-500" 
                />
                <PlayerStatWidget 
                    player={topAssister} 
                    stat={topAssister?.stats?.assists || 0} 
                    label="Asistente" 
                    icon={<ShoeIcon className="w-4 h-4"/>} 
                    color="bg-blue-500" 
                />
            </div>

            {/* Widget Chat */}
            <button 
                onClick={() => { setActiveChatTeam(team); setSection('chat'); }}
                className="w-full bg-gradient-to-r from-gray-900 to-black dark:from-black dark:to-gray-900 p-8 rounded-[40px] shadow-xl flex items-center justify-between group transition-all active:scale-[0.98]"
            >
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-brand shadow-inner">
                        <ChatBubbleLeftRightIcon className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Vestuario Virtual</h3>
                        <p className="text-sm font-bold text-white/50 uppercase tracking-widest mt-1">Chat grupal activo</p>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all text-white/30">
                    <ChevronRightIcon className="w-6 h-6" />
                </div>
            </button>
        </div>
    );
};

const MyTeamDashboard: React.FC<MyTeamDashboardProps> = ({ userTeams, user, allUsers, allBookings, allTeams, onBack, addNotification, onUpdateTeam, setIsPremiumModalOpen, onUpdateUserTeams, setSection, onRemovePlayerFromTeam, onLeaveTeam, setActiveChatTeam }) => {
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(userTeams[0] || null);
    const [isCreating, setIsCreating] = useState(userTeams.length === 0);
    const [view, setView] = useState<TeamView>('dashboard');
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    
    useEffect(() => {
        if (selectedTeam) {
            const updatedTeamData = userTeams.find(t => t.id === selectedTeam.id);
            if (!updatedTeamData) {
                setSelectedTeam(null);
            } else if (JSON.stringify(updatedTeamData) !== JSON.stringify(selectedTeam)) {
                setSelectedTeam(updatedTeamData);
            }
        } else if (isCreating && userTeams.length > 0) {
            setSelectedTeam(userTeams[0]);
            setIsCreating(false);
        }
    }, [userTeams, selectedTeam, isCreating]);

    const handleCreateTeam = async (teamData: { name: string; logo: string | null; level: 'Casual' | 'Intermedio' | 'Competitivo' }) => {
        const currentUserAsPlayer = user.playerProfile || {
            id: user.id, name: user.name, position: 'Cualquiera', level: teamData.level, stats: { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 }
        };

        const newTeamData: Omit<Team, 'id'> = {
            name: teamData.name,
            logo: teamData.logo || undefined,
            level: teamData.level,
            captainId: user.id,
            players: [currentUserAsPlayer],
            stats: { wins: 0, losses: 0, draws: 0 },
            formation: '4-4-2',
            playerPositions: {},
            schedule: [],
            matchHistory: [],
            messagingPermissions: 'all',
        };
        
        try {
            const newTeam = await db.addTeam(newTeamData);
            if (newTeam && newTeam.id) {
                const newTeamIds = [...(user.teamIds || []), newTeam.id];
                await onUpdateUserTeams(newTeamIds);
                addNotification({type: 'success', title: '¡Equipo Creado!', message: `Bienvenido a ${newTeam.name}.`});
                setIsCreating(false);
                setSelectedTeam(newTeam);
            }
        } catch (error) {
            console.error("Team creation failed:", String(error));
        }
    };

    if (isCreating) {
        return <CreateTeamView onBack={userTeams.length > 0 ? () => setIsCreating(false) : onBack} onCreate={handleCreateTeam} user={user} setIsPremiumModalOpen={setIsPremiumModalOpen} />;
    }
    
    if (userTeams.length === 0 && !isCreating) {
        return <CreateTeamView onBack={onBack} onCreate={handleCreateTeam} user={user} setIsPremiumModalOpen={setIsPremiumModalOpen} />;
    }

    if (selectedTeam) {
        const team = selectedTeam;
        const isCaptain = team.captainId === user.id;

        const handleUpdatePlayer = (updatedPlayer: Player) => {
            const updatedPlayers = team.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
            onUpdateTeam(team.id, { players: updatedPlayers });
        };
    
        const handleAddPlayer = async (newPlayer: Player) => {
            const updatedPlayers = [...team.players, newPlayer];
            await onUpdateTeam(team.id, { players: updatedPlayers });
            await db.addChatMessage(team.id, { type: 'system', text: `${newPlayer.name} se ha unido al equipo.` });
        };
        
        const TABS: { id: TeamView; label: string; icon: React.ReactNode }[] = [
            { id: 'dashboard', label: 'Inicio', icon: <DashboardIcon /> },
            { id: 'roster', label: 'Plantilla', icon: <TshirtIcon /> },
            { id: 'tactics', label: 'Pizarra', icon: <ClipboardListIcon /> },
            { id: 'schedule', label: 'Eventos', icon: <CalendarIcon /> },
            { id: 'performance', label: 'Ranking', icon: <ChartBarIcon /> },
        ];

        const renderContent = () => {
            switch (view) {
                case 'roster':
                    return <RosterView team={team} isCaptain={isCaptain} onBack={() => setView('dashboard')} onUpdatePlayer={handleUpdatePlayer} onAddPlayer={handleAddPlayer} onRemovePlayer={(pid) => onRemovePlayerFromTeam(team.id, pid)} allUsers={allUsers} />;
                case 'tactics':
                    return <TacticsView team={team} isCaptain={isCaptain} onBack={() => setView('dashboard')} onUpdateTeam={(updates) => onUpdateTeam(team.id, updates)} user={user} setIsPremiumModalOpen={setIsPremiumModalOpen} />;
                case 'schedule':
                    return <ScheduleView team={team} isCaptain={isCaptain} onBack={() => setView('dashboard')} onUpdateTeam={(updates) => onUpdateTeam(team.id, updates)} addNotification={addNotification} />;
                case 'performance':
                    return <PerformanceView team={team} allBookings={allBookings} onUpdateTeam={(updates) => onUpdateTeam(team.id, updates)} />;
                default:
                    return <DashboardGrid team={team} setView={setView} setSection={setSection} setActiveChatTeam={setActiveChatTeam} />;
            }
        };

        return (
             <div className="space-y-6 pb-32 bg-bgMain-light dark:bg-bgMain-dark min-h-screen">
                <div className="px-1">
                    <button onClick={() => setSelectedTeam(null)} className="flex items-center gap-2 text-textMuted-light dark:text-textMuted-dark font-black text-[10px] uppercase tracking-[0.2em] mb-4 hover:text-brand transition-colors">
                        <ChevronLeftIcon className="h-4 w-4" />
                        Mis Equipos
                    </button>
                    
                    {/* Header Principal del Equipo */}
                    <div className="bg-bgSurface-light dark:bg-bgSurface-dark border border-borderDefault-light dark:border-borderDefault-dark rounded-[40px] p-6 shadow-premium-light dark:shadow-premium-dark relative overflow-hidden">
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-[32px] bg-gray-50 dark:bg-gray-800 border-4 border-white dark:border-gray-700 overflow-hidden shadow-xl flex items-center justify-center">
                                        {team.logo ? (
                                            <img src={team.logo} alt={`${team.name} logo`} className="w-full h-full object-cover" />
                                        ) : (
                                            <ShieldIcon className="w-12 h-12 text-textDisabled-light" />
                                        )}
                                    </div>
                                    {isCaptain && (
                                        <div className="absolute -bottom-2 -right-2 bg-amber-400 text-black text-[9px] font-black px-2 py-1 rounded-lg border-2 border-white shadow-lg uppercase tracking-tighter italic">Capitán</div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-textMain-light dark:text-textMain-dark leading-none">{team.name}</h1>
                                    <p className="text-[10px] font-black text-textMuted-light dark:text-textMuted-dark uppercase tracking-[0.25em]">{team.level}</p>
                                </div>
                            </div>
                            {!isCaptain && (
                                <button onClick={() => setIsLeaveModalOpen(true)} className="p-3 text-rose-500 rounded-2xl bg-rose-50 dark:bg-rose-900/20 active:scale-90 transition-all">
                                    <LogoutIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Fila de Estadísticas Rápidas */}
                        <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-900/50 rounded-3xl mt-6 border border-borderDefault-light dark:border-borderDefault-dark">
                            <HeaderStatCard label="Victorias" value={team.stats?.wins || 0} colorClass="text-emerald-500" />
                            <HeaderStatCard label="Empates" value={team.stats?.draws || 0} colorClass="text-amber-500" />
                            <HeaderStatCard label="Derrotas" value={team.stats?.losses || 0} colorClass="text-rose-500" />
                        </div>

                        {/* Marca de agua decorativa */}
                        <ShieldIcon className="absolute -right-8 -top-8 w-40 h-40 text-gray-50 dark:text-gray-900 opacity-20 pointer-events-none" />
                    </div>
                </div>
                
                {/* Navegación Refinada */}
                <div className="sticky top-20 z-30 -mx-4 bg-bgMain-light/80 dark:bg-bgMain-dark/80 backdrop-blur-md px-4 border-b border-borderDefault-light dark:border-borderDefault-dark mb-4">
                    <nav className="flex justify-between items-center max-w-lg mx-auto">
                        {TABS.map(tab => (
                            <NavTab 
                                key={tab.id} 
                                label={tab.label} 
                                icon={tab.icon} 
                                isActive={view === tab.id} 
                                onClick={() => setView(tab.id)} 
                            />
                        ))}
                    </nav>
                </div>
                
                <main className="px-1">
                    {renderContent()}
                </main>

                <ConfirmationModal
                    isOpen={isLeaveModalOpen}
                    onClose={() => setIsLeaveModalOpen(false)}
                    onConfirm={() => { onLeaveTeam(team.id); setSelectedTeam(null); setIsLeaveModalOpen(false); }}
                    title={`¿Abandonar ${team.name}?`}
                    message="Ya no serás miembro de este equipo. Esta acción no se puede deshacer."
                    confirmButtonText="Sí, abandonar"
                />
            </div>
        );
    }
    
    return (
        <div className="space-y-8 animate-ios pb-32">
            <div className="px-1">
                <button onClick={onBack} className="flex items-center gap-2 text-textMuted-light dark:text-textMuted-dark font-black text-[10px] uppercase tracking-[0.2em] mb-4 hover:text-brand transition-colors">
                    <ChevronLeftIcon className="h-4 w-4" />
                    DaviPlay
                </button>
                <div className="flex justify-between items-end mb-8">
                    <div className="space-y-1">
                        <p className="text-textMuted-light dark:text-textMuted-dark text-sm font-medium">Gestiona tu equipo</p>
                        <h1 className="text-4xl font-black tracking-tighter text-textMain-light dark:text-textMain-dark uppercase italic">Mis Equipos</h1>
                    </div>
                    <button onClick={() => setIsCreating(true)} className="bg-brand text-white font-black p-4 rounded-2xl shadow-button active:scale-90 transition-all">
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="space-y-4 px-1">
                {userTeams.length > 0 ? userTeams.map(team => (
                    <button 
                        key={team.id} 
                        onClick={() => { setView('dashboard'); setSelectedTeam(team); }} 
                        className="w-full bg-bgSurface-light dark:bg-bgSurface-dark border border-borderDefault-light dark:border-borderDefault-dark p-6 rounded-[32px] flex items-center justify-between shadow-premium-light dark:shadow-premium-dark active:scale-[0.98] transition-all group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-borderDefault-light dark:border-borderDefault-dark overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                                {team.logo ? <img src={team.logo} alt={`${team.name} logo`} className="w-full h-full object-cover" /> : <ShieldIcon className="w-8 h-8 text-textDisabled-light"/>}
                            </div>
                            <div className="text-left">
                                <p className="font-black text-xl italic uppercase tracking-tighter text-textMain-light dark:text-textMain-dark">{team.name}</p>
                                <p className="text-[10px] font-bold text-textMuted-light dark:text-textMuted-dark uppercase tracking-widest mt-1">{team.level}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {team.captainId === user.id && (
                                <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg uppercase italic border border-amber-200">Líder</span>
                            )}
                            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-textDisabled-light">
                                <ChevronRightIcon className="w-5 h-5"/>
                            </div>
                        </div>
                    </button>
                )) : (
                    <div className="text-center py-24 bg-bgSurface-light/50 dark:bg-bgSurface-dark/30 rounded-[40px] border-2 border-dashed border-borderDefault-light dark:border-borderDefault-dark px-6">
                        <ShieldIcon className="mx-auto h-20 w-20 text-textDisabled-light opacity-30 mb-6" />
                        <h2 className="text-2xl font-black text-textMain-light dark:text-textMain-dark italic uppercase tracking-tighter">Sin Escuadra</h2>
                        <p className="text-textMuted-light dark:text-textMuted-dark mt-2 font-medium">Aún no eres parte de ningún equipo.</p>
                        <button onClick={() => setIsCreating(true)} className="mt-8 bg-brand text-white font-black py-4 px-10 rounded-3xl shadow-button active:scale-95 transition-all uppercase tracking-widest text-sm">Crear Equipo</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTeamDashboard;