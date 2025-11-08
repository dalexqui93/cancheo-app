import React, { useState, useMemo, useCallback, useRef } from 'react';
import type { User, Team, Player, Tournament, Match, Notification, Group, KnockoutRound, MatchEvent, TeamEvent, Formation, SocialSection, ChatMessage, Invitation, WeatherData } from '../../types';
import { UserPlusIcon } from '../components/icons/UserPlusIcon';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { ShieldIcon } from '../components/icons/ShieldIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { XIcon } from '../components/icons/XIcon';
import { SoccerBallIcon } from '../components/icons/SoccerBallIcon';
import { UploadIcon } from '../components/icons/UploadIcon';
import MyTeamDashboard from './team/MyTeamDashboard';
import { SearchIcon } from '../components/icons/SearchIcon';
import SportsForumView from './forum/SportsForumView';
import { UserIcon } from '../components/icons/UserIcon';
import { View } from '../types';
import PlayerProfileDetailView from './player_profile/PlayerProfileDetailView';
import { LogoutIcon } from '../components/icons/LogoutIcon';
import { TrophyIcon } from '../components/icons/TrophyIcon';
import PremiumBadge from '../components/PremiumBadge';
import { PlayerKickingBallIcon } from '../components/icons/PlayerKickingBallIcon';
import { DumbbellIcon } from '../components/icons/DumbbellIcon';
import { RunningIcon } from '../components/icons/RunningIcon';
import { BatteryIcon } from '../components/icons/BatteryIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { CalendarDaysIcon } from '../components/icons/CalendarDaysIcon';
import { MedalIcon } from '../components/icons/MedalIcon';
import { FireIcon } from '../components/icons/FireIcon';
import { ForumIcon } from '../components/icons/ForumIcon';
import { SwordsIcon } from '../components/icons/SwordsIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';
import StarRating from '../components/StarRating';
import TeamChatView from './team/TeamChatView';
import ConfirmationModal from '../components/ConfirmationModal';
import { TrashIcon } from '../components/icons/TrashIcon';
import { calculateDistance } from '../utils/geolocation';
import { LocationIcon } from '../components/icons/LocationIcon';


// --- MOCK DATA ---
// NOTE: Team data is now fetched from database.ts, but other social mocks remain here for now.

const mockSchedule: TeamEvent[] = [
    { id: 'ev1', type: 'match', date: new Date(new Date().setDate(new Date().getDate() + 3)), title: 'vs. Atlético Panas', location: 'Gol Center Envigado' },
    { id: 'ev2', type: 'training', date: new Date(new Date().setDate(new Date().getDate() + 5)), title: 'Entrenamiento Táctico', location: 'Cancha El Templo' },
    { id: 'ev3', type: 'event', date: new Date(new Date().setDate(new Date().getDate() + 10)), title: 'Asado de Equipo', location: 'Club Campestre' },
];

const getMockTournaments = (teams: Team[]): Tournament[] => {
    const groupAMatches: Match[] = [
        { id: 'g1m1', teamA: teams[0], teamB: teams[1], scoreA: 3, scoreB: 1, date: new Date(2024, 7, 1), status: 'jugado', isEditable: true, events: []},
        { id: 'g1m2', teamA: teams[2], teamB: teams[3], scoreA: 2, scoreB: 2, date: new Date(2024, 7, 1), status: 'jugado', isEditable: true, events: [] },
    ];

    return [
        {
            id: 'tor1', name: 'Copa Verano 2024', format: 'Fútbol 7', prize: '$1,000,000',
            status: 'en juego', structure: 'groups-then-knockout', teams: teams.slice(0,4),
            groups: [{ id: 'g1', name: 'Grupo A', teams: teams.slice(0, 4), standings: [], matches: groupAMatches }],
            knockoutRounds: []
        },
        {
            id: 'tor2', name: 'Torneo Relámpago', format: 'Fútbol 5', prize: 'Trofeo + Medallas',
            status: 'inscripciones abiertas', structure: 'knockout', teams: [],
        }
    ];
};

// --- END MOCK DATA ---

interface SocialViewProps {
    user: User;
    allTeams: Team[];
    allUsers: User[];
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
    onNavigate: (view: View) => void;
    setIsPremiumModalOpen: (isOpen: boolean) => void;
    section: SocialSection;
    setSection: (section: SocialSection) => void;
    onUpdateUserTeams: (teamIds: string[]) => Promise<void>;
    onUpdateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
    sentInvitations: Invitation[];
    onSendInvitation: (team: Team, player: Player) => void;
    onCancelInvitation: (invitationId: string) => void;
    onRemovePlayerFromTeam: (teamId: string, playerId: string) => void;
    onLeaveTeam: (teamId: string) => void;
    weatherData: WeatherData | null;
}

const PlayerProfileOnboarding: React.FC<{ onNavigate: (view: View) => void }> = ({ onNavigate }) => {
    return (
        <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md border dark:border-gray-700">
            <img src="https://i.pinimg.com/originals/72/19/90/721990480d1f30f45c862cecad967e2d.gif" alt="Bienvenido a DaviPlay" className="mx-auto h-40 w-auto rounded-lg" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Bienvenido a DaviPlay</h2>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Crea tu perfil de jugador para unirte a equipos, competir en torneos y registrar tus estadísticas. ¡Es hora de saltar a la cancha virtual!
            </p>
            <button
                onClick={() => onNavigate(View.PLAYER_PROFILE_CREATOR)}
                className="mt-6 bg-[var(--color-primary-600)] text-white font-bold py-3 px-8 rounded-lg hover:bg-[var(--color-primary-700)] transition-transform transform hover:scale-105 shadow-md"
            >
                Crear mi Perfil de Jugador
            </button>
        </div>
    );
};

// --- Player Hub Components ---
const HubWidget: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
    <div className={`bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
            <div className="text-[var(--color-primary-400)]">{icon}</div>
            <h3 className="font-bold text-white/90">{title}</h3>
        </div>
        <div>{children}</div>
    </div>
);

const PlayerCardComponent: React.FC<{ player: Player, onNavigateToCreator: () => void }> = ({ player, onNavigateToCreator }) => {
    const xpPercentage = ((player.xp || 0) / 1000) * 100;

    const Stat: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
        <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-1 text-[var(--color-primary-400)]">{icon}</div>
            <p className="font-black text-2xl">{value}</p>
            <p className="text-xs font-semibold text-white/70 uppercase">{label}</p>
        </div>
    );
    
    return (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6 relative holographic-shine h-full flex flex-col justify-between">
            <div>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-bold text-white/70">NIVEL {player.level}</p>
                        <h2 className="text-3xl font-black tracking-tight">{player.name}</h2>
                        <p className="font-semibold text-[var(--color-primary-400)]">{player.position}</p>
                    </div>
                     <div className="w-20 h-20 rounded-full bg-black/30 flex items-center justify-center shadow-md border-2 border-white/20 overflow-hidden flex-shrink-0">
                        {player.profilePicture ? (
                            <img src={player.profilePicture} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-10 h-10 text-white/70" />
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                        <span className="text-white/70">PROGRESO</span>
                        <span>{player.xp || 0} / 1000 XP</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-2.5">
                        <div className="bg-[var(--color-primary-500)] h-2.5 rounded-full progress-bar-fill" style={{ width: `${xpPercentage}%` }}></div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4">
                    <Stat icon={<DumbbellIcon className="w-6 h-6"/>} label="Fuerza" value={player.strength || 0} />
                    <Stat icon={<RunningIcon className="w-6 h-6"/>} label="Velocidad" value={player.speed || 0} />
                    <Stat icon={<BatteryIcon className="w-6 h-6"/>} label="Resistencia" value={player.stamina || 0} />
                </div>
            </div>
             <button onClick={onNavigateToCreator} className="mt-6 w-full text-center bg-white/10 hover:bg-white/20 transition-colors font-bold py-3 px-5 rounded-lg flex items-center justify-center gap-2">
                <PencilIcon className="w-5 h-5"/>
                Editar Perfil
            </button>
        </div>
    );
};

const UpcomingMatchWidget: React.FC = () => {
    const nextMatch = mockSchedule.find(e => e.type === 'match' && e.date > new Date());
    
    if (!nextMatch) {
        return <HubWidget title="Próximo Partido" icon={<CalendarDaysIcon className="w-5 h-5"/>}><p className="text-sm text-white/60">No hay partidos programados.</p></HubWidget>;
    }

    return (
        <HubWidget title="Próximo Partido" icon={<CalendarDaysIcon className="w-5 h-5"/>}>
            <p className="font-bold text-lg">{nextMatch.title}</p>
            <p className="text-sm text-white/70">{nextMatch.date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
            <p className="text-xs text-white/50">@{nextMatch.location}</p>
        </HubWidget>
    );
};

const DailyChallengesWidget: React.FC = () => (
    <HubWidget title="Desafíos Diarios" icon={<TrophyIcon className="w-5 h-5"/>}>
        <div className="space-y-2">
            <div className="text-sm bg-black/20 p-2 rounded-md">
                <p className="font-semibold">Juega 1 partido</p>
                <p className="text-xs text-[var(--color-primary-400)] font-bold">+150 XP</p>
            </div>
            <div className="text-sm bg-black/20 p-2 rounded-md">
                <p className="font-semibold">Reacciona a 3 posts en el foro</p>
                <p className="text-xs text-[var(--color-primary-400)] font-bold">+50 XP</p>
            </div>
        </div>
    </HubWidget>
);

const StreakWidget: React.FC = () => (
    <HubWidget title="Mi Racha" icon={<FireIcon className="w-5 h-5"/>} className="text-center">
        <p className="text-3xl font-black">3 <span className="text-lg">V</span></p>
        <p className="text-xs text-white/60">Victorias seguidas</p>
    </HubWidget>
);

const LatestAchievementWidget: React.FC = () => (
    <HubWidget title="Último Logro" icon={<MedalIcon className="w-5 h-5"/>} className="text-center">
        <p className="text-3xl">🏆</p>
        <p className="text-xs text-white/60 font-semibold truncate">Goleador del Torneo</p>
    </HubWidget>
);


const HubNavigation: React.FC<{ onNavigate: (section: SocialSection) => void }> = ({ onNavigate }) => {
    const navItems = [
        { section: 'sports-forum' as SocialSection, icon: <ForumIcon className="w-7 h-7" />, label: 'Foro' },
        { section: 'my-team' as SocialSection, icon: <ShieldIcon className="w-7 h-7" />, label: 'Mi Equipo' },
        { section: 'tournaments' as SocialSection, icon: <TrophyIcon className="w-7 h-7" />, label: 'Torneos' },
        { section: 'challenge' as SocialSection, icon: <SwordsIcon className="w-7 h-7" />, label: 'Retar' },
        { section: 'find-players' as SocialSection, icon: <UserPlusIcon className="w-7 h-7" />, label: 'Fichajes' },
    ];
    return (
        <div className="mt-6 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {navItems.map(item => (
                    <button key={item.section} onClick={() => onNavigate(item.section)} className="text-center p-3 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="w-12 h-12 mx-auto rounded-full bg-white/10 flex items-center justify-center text-[var(--color-primary-400)] mb-1">
                            {item.icon}
                        </div>
                        <p className="text-xs font-bold">{item.label}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const PlayerHub: React.FC<{ user: User; onSectionNavigate: (section: SocialSection) => void; onNavigateToCreator: () => void; }> = ({ user, onSectionNavigate, onNavigateToCreator }) => {
    if (!user.playerProfile) return null;
    return (
        <div className="p-4 sm:p-6 pb-[6.5rem] relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PlayerCardComponent player={user.playerProfile} onNavigateToCreator={onNavigateToCreator} />
                </div>
                <div className="space-y-4">
                    <UpcomingMatchWidget />
                    <DailyChallengesWidget />
                    <div className="grid grid-cols-2 gap-4">
                        <StreakWidget />
                        <LatestAchievementWidget />
                    </div>
                </div>
            </div>
            <HubNavigation onNavigate={onSectionNavigate} />
        </div>
    );
};

// --- Main Social View ---

const BackButton: React.FC<{ onClick: () => void, text: string }> = ({ onClick, text }) => (
    <button onClick={onClick} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] font-semibold mb-6 hover:underline">
        <ChevronLeftIcon className="h-5 h-5" />
        {text}
    </button>
);

const TeamProfileView: React.FC<{ team: Team, onBack: () => void }> = ({ team, onBack }) => {
    const sortedHistory = (team.matchHistory || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return (
        <div className="p-4 animate-fade-in">
             <BackButton onClick={onBack} text="Volver a Retar Equipos" />
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 text-center sm:text-left">
                    {team.logo ? <img src={team.logo} alt={`${team.name} logo`} className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700" /> : <ShieldIcon className="w-24 h-24 text-gray-400" />}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{team.name}</h1>
                        <p className="font-semibold text-gray-500 dark:text-gray-400">{team.level}</p>
                    </div>
                </div>
                 <div className="grid grid-cols-3 gap-4 text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                     <div>
                         <p className="text-3xl font-black text-green-500 dark:text-green-400">{team.stats.wins}</p>
                         <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase">Victorias</p>
                     </div>
                     <div>
                         <p className="text-3xl font-black text-yellow-500 dark:text-yellow-400">{team.stats.draws}</p>
                         <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase">Empates</p>
                     </div>
                     <div>
                         <p className="text-3xl font-black text-red-500 dark:text-red-400">{team.stats.losses}</p>
                         <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase">Derrotas</p>
                     </div>
                 </div>
                 <div className="mt-8">
                     <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Historial de Partidos Recientes</h3>
                     <div className="space-y-3">
                        {sortedHistory.length > 0 ? (
                            sortedHistory.slice(0, 5).map(match => {
                                const isTeamA = 'id' in match.teamA && match.teamA.id === team.id;
                                const scoreUs = (isTeamA ? match.scoreA : match.scoreB) ?? 0;
                                const scoreThem = (isTeamA ? match.scoreB : match.scoreA) ?? 0;
                                const opponent = isTeamA ? match.teamB : match.teamA;
                                const opponentName = 'name' in opponent ? opponent.name : 'Rival';

                                let result: 'V' | 'E' | 'D';
                                let resultColor = '';
                                if (scoreUs > scoreThem) {
                                    result = 'V';
                                    resultColor = 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300';
                                } else if (scoreUs < scoreThem) {
                                    result = 'D';
                                    resultColor = 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300';
                                } else {
                                    result = 'E';
                                    resultColor = 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300';
                                }
                                
                                return (
                                    <div key={match.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-black text-lg ${resultColor}`}>{result}</div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">vs. {opponentName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(match.date).toLocaleDateString('es-CO', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                                        </div>
                                        <div className="font-bold text-lg text-gray-800 dark:text-gray-100">{scoreUs} - {scoreThem}</div>
                                    </div>
                                )
                            })
                        ) : (
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400">No hay partidos registrados.</p>
                        )}
                     </div>
                 </div>
             </div>
        </div>
    );
};

const TeamChallengeCard: React.FC<{
    team: Team;
    isCaptain: boolean;
    isMyTeam: boolean;
    onChallenge: (team: Team) => void;
    onViewProfile: (team: Team) => void;
}> = ({ team, isCaptain, isMyTeam, onChallenge, onViewProfile }) => (
    <div 
        onClick={() => onViewProfile(team)}
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border dark:border-gray-700 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
    >
        <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                ) : (
                    <ShieldIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                )}
            </div>
            <div className="min-w-0">
                <p className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate">{team.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{team.level}</p>
                 {team.distance !== undefined && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <LocationIcon className="w-3 h-3"/> {team.distance.toFixed(1)} km
                    </p>
                )}
            </div>
        </div>
        
        {isCaptain && !isMyTeam ? (
            <button
                onClick={(e) => { e.stopPropagation(); onChallenge(team); }}
                className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm text-sm flex-shrink-0"
            >
                <SwordsIcon className="w-4 h-4" />
                Retar
            </button>
        ) : (
            <button
                onClick={(e) => { e.stopPropagation(); onViewProfile(team); }}
                className="py-2 px-4 rounded-lg font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm flex-shrink-0"
            >
                Ver Perfil
            </button>
        )}
    </div>
);

const ChallengeView: React.FC<{
    allTeams: Team[];
    user: User;
    onBack: () => void;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
    weatherData: WeatherData | null;
}> = ({ allTeams, user, onBack, addNotification, weatherData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState<'All' | Team['level']>('All');
    const [viewingTeam, setViewingTeam] = useState<Team | null>(null);

    const isCaptain = useMemo(() => allTeams.some(t => t.captainId === user.id), [allTeams, user.id]);

    const filteredAndSortedTeams = useMemo(() => {
        let teamsWithDistance = allTeams.map(team => {
            if (weatherData && team.latitude && team.longitude) {
                const distance = calculateDistance(weatherData.latitude, weatherData.longitude, team.latitude, team.longitude);
                return { ...team, distance };
            }
            return { ...team, distance: Infinity };
        });

        return teamsWithDistance
            .filter(team => 
                team.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (levelFilter === 'All' || team.level === levelFilter)
            )
            .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }, [allTeams, searchTerm, levelFilter, weatherData]);


    const handleChallenge = (team: Team) => {
        addNotification({
            type: 'success',
            title: '¡Reto Enviado!',
            message: `Has retado a ${team.name} a un partido.`
        });
    };

    if (viewingTeam) {
        return <TeamProfileView team={viewingTeam} onBack={() => setViewingTeam(null)} />;
    }

    return (
        <div className="p-4 pb-[5.5rem] md:pb-4">
            <BackButton onClick={onBack} text="Volver a DaviPlay" />
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mt-6">Retar un Equipo</h1>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">Encuentra un rival y desafíalo a un partido amistoso.</p>
            
            <div className="mt-6 space-y-4 sticky top-0 bg-slate-50 dark:bg-gray-900 py-4 z-10">
                <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar equipo por nombre..."
                        className="w-full py-3 pl-11 pr-4 border border-gray-300 dark:border-gray-600 rounded-full text-gray-800 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                    />
                </div>
                <div className="flex space-x-2">
                    {(['All', 'Casual', 'Intermedio', 'Competitivo'] as const).map(level => (
                        <button
                            key={level}
                            onClick={() => setLevelFilter(level)}
                            className={`py-1.5 px-4 rounded-full text-sm font-semibold transition flex-grow ${levelFilter === level ? 'bg-[var(--color-primary-600)] text-white shadow' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border dark:border-gray-600'}`}
                        >
                            {level === 'All' ? 'Todos' : level}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6 space-y-4">
                {filteredAndSortedTeams.length > 0 ? (
                    filteredAndSortedTeams.map(team => (
                        <TeamChallengeCard 
                            key={team.id} 
                            team={team} 
                            isCaptain={isCaptain}
                            isMyTeam={user.teamIds?.includes(team.id) ?? false}
                            onChallenge={handleChallenge}
                            onViewProfile={setViewingTeam}
                        />
                    ))
                ) : (
                    <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md border dark:border-gray-700">
                        <SwordsIcon className="mx-auto h-16 w-16 text-gray-400" />
                        <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">No se encontraron equipos</h2>
                        <p className="mt-2 text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                            Intenta con otro nombre o ajusta los filtros de búsqueda.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const FindPlayersView: React.FC<{
    players: Player[];
    onBack: () => void;
    onViewProfile: (player: Player) => void;
    recruitingTeam: Team | null;
    sentInvitations: Invitation[];
    onSendInvitation: (team: Team, player: Player) => void;
    onCancelInvitation: (invitationId: string) => void;
    onRemovePlayerFromTeam: (teamId: string, playerId: string) => void;
}> = ({ players, onBack, onViewProfile, recruitingTeam, sentInvitations, onSendInvitation, onCancelInvitation, onRemovePlayerFromTeam }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);

    const filteredPlayers = players.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleConfirmRemove = () => {
        if (playerToRemove && recruitingTeam) {
            onRemovePlayerFromTeam(recruitingTeam.id, playerToRemove.id);
        }
        setPlayerToRemove(null);
    };

    return (
        <div className="p-4 pb-[5.5rem] md:pb-4">
            <BackButton onClick={onBack} text="Volver a DaviPlay" />
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mt-6">Fichajes</h1>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">Encuentra o gestiona jugadores para tu equipo.</p>
            {recruitingTeam && (
                <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 font-semibold p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-md">Gestionando para: {recruitingTeam.name}</p>
            )}
            
            <div className="mt-6 relative">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar jugador por nombre..."
                    className="w-full py-3 pl-11 pr-4 border border-gray-300 dark:border-gray-600 rounded-full text-gray-800 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 shadow-sm transition-all duration-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-primary-500)]"
                />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlayers.map(player => (
                    <PlayerRecruitCard 
                        key={player.id}
                        player={player}
                        onViewProfile={onViewProfile}
                        recruitingTeam={recruitingTeam}
                        sentInvitations={sentInvitations}
                        onSendInvitation={onSendInvitation}
                        onCancelInvitation={onCancelInvitation}
                        onRemovePlayer={setPlayerToRemove}
                    />
                ))}
            </div>
            {filteredPlayers.length === 0 && (
                <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md border dark:border-gray-700 mt-6">
                    <UserPlusIcon className="mx-auto h-16 w-16 text-gray-400" />
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">No se encontraron jugadores</h2>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        Intenta con otro nombre o revisa la lista completa de jugadores disponibles.
                    </p>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!playerToRemove}
                onClose={() => setPlayerToRemove(null)}
                onConfirm={handleConfirmRemove}
                title={`¿Expulsar a ${playerToRemove?.name}?`}
                message={`Esta acción eliminará permanentemente al jugador de ${recruitingTeam?.name}. El jugador será notificado. ¿Estás seguro?`}
                confirmButtonText="Sí, expulsar"
            />
        </div>
    );
};

const SocialView: React.FC<SocialViewProps> = ({ user, allTeams, allUsers, addNotification, onNavigate, setIsPremiumModalOpen, section, setSection, onUpdateUserTeams, onUpdateTeam, sentInvitations, onSendInvitation, onCancelInvitation, onRemovePlayerFromTeam, onLeaveTeam, weatherData }) => {
    const [tournaments, setTournaments] = useState<Tournament[]>(getMockTournaments(allTeams));
    const [viewingPlayerProfile, setViewingPlayerProfile] = useState<Player | null>(null);
    const [activeChatTeam, setActiveChatTeam] = useState<Team | null>(null);
    
    const userTeams = useMemo(() => user.teamIds ? allTeams.filter(t => user.teamIds.includes(t.id)) : [], [allTeams, user.teamIds]);
    
    const recruitingTeam = useMemo(() => {
        if (!user.playerProfile) return null;
        const captainedTeams = allTeams.filter(t => t.captainId === user.id);
        return captainedTeams.length > 0 ? captainedTeams[0] : null;
    }, [allTeams, user]);


    const renderContent = () => {
        if (!user.playerProfile) {
            return <div className="p-4 pb-[5.5rem] md:pb-4"><PlayerProfileOnboarding onNavigate={onNavigate} /></div>;
        }

        switch (section) {
            case 'tournaments':
                return <div className="p-4 sm:p-6 pb-[6.5rem]"><TournamentsView 
                            tournaments={tournaments} 
                            onBack={() => setSection('hub')} 
                            addNotification={addNotification} 
                            user={user} /></div>;
            case 'my-team':
                return <MyTeamDashboard
                    userTeams={userTeams}
                    user={user}
                    allUsers={allUsers}
                    onBack={() => setSection('hub')}
                    addNotification={addNotification}
                    onUpdateTeam={onUpdateTeam}
                    setIsPremiumModalOpen={setIsPremiumModalOpen}
                    onUpdateUserTeams={onUpdateUserTeams}
                    onLeaveTeam={onLeaveTeam}
                    onRemovePlayerFromTeam={onRemovePlayerFromTeam}
                    setSection={setSection}
                    setActiveChatTeam={setActiveChatTeam}
                 />;
            case 'chat':
                if (!activeChatTeam || !user.playerProfile) {
                    setSection('hub'); // Failsafe
                    return null;
                }
                return <TeamChatView
                    team={activeChatTeam}
                    currentUser={user.playerProfile}
                    onBack={() => {
                        setSection('my-team');
                    }}
                    onUpdateTeam={(updates) => onUpdateTeam(activeChatTeam.id, updates)}
                />;
            case 'challenge':
                return <div className="p-4 sm:p-6 pb-[6.5rem]"><ChallengeView allTeams={allTeams} user={user} onBack={() => setSection('hub')} addNotification={addNotification} weatherData={weatherData} /></div>;
            case 'find-players':
                return <div className="p-4 sm:p-6 pb-[6.5rem]">{
                    viewingPlayerProfile ? (
                    <PlayerProfileDetailView 
                                player={viewingPlayerProfile} 
                                onBack={() => setViewingPlayerProfile(null)} 
                            />
                ) : (
                    <FindPlayersView 
                        players={allUsers.filter(u => u.playerProfile && u.id !== user.id).map(u => u.playerProfile!)} 
                        onBack={() => setSection('hub')} 
                        onViewProfile={setViewingPlayerProfile}
                        recruitingTeam={recruitingTeam}
                        sentInvitations={sentInvitations}
                        onSendInvitation={onSendInvitation}
                        onCancelInvitation={onCancelInvitation}
                        onRemovePlayerFromTeam={onRemovePlayerFromTeam}
                    />
                )}</div>;
            case 'sports-forum':
                return <SportsForumView user={user} addNotification={addNotification} onBack={() => setSection('hub')} />;
            default:
                return <PlayerHub user={user} onSectionNavigate={setSection} onNavigateToCreator={() => onNavigate(View.PLAYER_PROFILE_CREATOR)} />
        }
    };
    
    const socialSectionsWithDarkBg = ['hub', 'my-team'];
    const hasDarkBg = socialSectionsWithDarkBg.includes(section);
    const showExitButton = section !== 'chat';

    return (
        <div className={`animate-fade-in relative ${hasDarkBg ? 'text-white' : 'text-gray-800 dark:text-gray-200'} ${section === 'chat' ? 'p-0' : ''}`}>
            {renderContent()}

            {/* Exit DaviPlay Button */}
            {showExitButton && (
                <button
                    onClick={() => onNavigate(View.HOME)}
                    className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 bg-gradient-to-br from-red-500 to-red-700 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center animate-pulse-glow transform transition-transform hover:scale-110"
                    aria-label="Salir de DaviPlay"
                >
                    <LogoutIcon className="w-8 h-8" />
                </button>
            )}
        </div>
    );
};

// --- SUB-VIEWS ---

const TournamentsView: React.FC<{
    tournaments: Tournament[];
    onBack: () => void;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
    user: User;
}> = ({ tournaments, onBack, addNotification, user }) => {
    return (
        <div className="p-4 pb-[5.5rem] md:pb-4">
            <BackButton onClick={onBack} text="Volver a DaviPlay" />
            <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md border dark:border-gray-700 mt-6">
                <TrophyIcon className="mx-auto h-16 w-16 text-gray-400" />
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Próximamente: Torneos</h2>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    ¡Estamos preparando todo para que puedas competir por la gloria! La sección de torneos estará disponible muy pronto.
                </p>
            </div>
        </div>
    );
};

const levelToRating = (level: Player['level']): number => {
    if (typeof level === 'number') return level;
    switch (level) {
        case 'Casual': return 2;
        case 'Intermedio': return 3.5;
        case 'Competitivo': return 5;
        default: return 0;
    }
};

const PlayerRecruitCard: React.FC<{
    player: Player;
    onViewProfile: (player: Player) => void;
    recruitingTeam: Team | null;
    sentInvitations: Invitation[];
    onSendInvitation: (team: Team, player: Player) => void;
    onCancelInvitation: (invitationId: string) => void;
    onRemovePlayer: (player: Player) => void;
}> = ({ player, onViewProfile, recruitingTeam, sentInvitations, onSendInvitation, onCancelInvitation, onRemovePlayer }) => {
    const existingInvitation = recruitingTeam ? sentInvitations.find(inv => inv.toUserId === player.id && inv.teamId === recruitingTeam.id) : null;
    const isAlreadyOnTeam = recruitingTeam?.players.some(p => p.id === player.id);
    
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border dark:border-gray-700 flex flex-col h-full">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {player.profilePicture ? (
                        <img src={player.profilePicture} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="w-8 h-8 text-slate-500 dark:text-gray-400"/>
                    )}
                </div>
                <div className="flex-grow">
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{player.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{player.position}</p>
                    <div className="mt-1 flex items-center gap-2">
                        <StarRating rating={levelToRating(player.level)} />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{typeof player.level === 'number' ? `Nvl ${player.level}` : player.level}</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 dark:bg-gray-700/50 p-2 rounded-lg">
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{player.strength || '-'}</p>
                    <p className="font-semibold text-gray-500 dark:text-gray-400">Fuerza</p>
                </div>
                <div className="bg-slate-50 dark:bg-gray-700/50 p-2 rounded-lg">
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{player.speed || '-'}</p>
                    <p className="font-semibold text-gray-500 dark:text-gray-400">Velocidad</p>
                </div>
                <div className="bg-slate-50 dark:bg-gray-700/50 p-2 rounded-lg">
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{player.stamina || '-'}</p>
                    <p className="font-semibold text-gray-500 dark:text-gray-400">Resist.</p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-grow flex items-end gap-3">
                <button onClick={() => onViewProfile(player)} className="w-full py-2 px-4 rounded-lg font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">
                    Ver Perfil
                </button>
                {recruitingTeam && (
                    isAlreadyOnTeam ? (
                        <button 
                            onClick={() => onRemovePlayer(player)} 
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 shadow-sm text-sm"
                        >
                            <TrashIcon className="w-4 h-4"/>
                            Expulsar
                        </button>
                    ) : existingInvitation ? (
                        <button onClick={() => onCancelInvitation(existingInvitation.id)} className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg font-semibold bg-gray-500 text-white hover:bg-gray-600 shadow-sm text-sm">
                            <XIcon className="w-4 h-4"/>
                            Cancelar
                        </button>
                    ) : (
                        <button onClick={() => onSendInvitation(recruitingTeam, player)} className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm text-sm">
                            <UserPlusIcon className="w-4 h-4"/>
                            Reclutar
                        </button>
                    )
                )}
            </div>
        </div>
    );
};

export default SocialView;