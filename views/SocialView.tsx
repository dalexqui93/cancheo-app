import React, { useState, useMemo, useCallback, useRef } from 'react';
import type { User, Team, Player, Tournament, Match, Notification, Group, KnockoutRound, MatchEvent, TeamEvent, Formation } from '../types';
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


// --- MOCK DATA ---
const mockPlayers: Player[] = [
    { 
        id: 'u1', name: 'Carlos Pérez', profilePicture: 'https://i.pravatar.cc/150?u=u1', number: 9, position: 'Delantero', level: 'Competitivo', stats: { matchesPlayed: 15, goals: 12, assists: 4, yellowCards: 3, redCards: 0 },
        age: 28, height: 182, weight: 78, dominantFoot: 'Derecho', bio: 'Delantero rápido y letal en el área. Siempre buscando el gol.', strength: 85, speed: 92, stamina: 88, specialSkills: ['Tiro Potente', 'Regate Rápido', 'Cabeceo'],
    },
    { 
        id: 'u2', name: 'Ana García', profilePicture: 'https://i.pravatar.cc/150?u=u2', number: 4, position: 'Defensa', level: 'Competitivo', stats: { matchesPlayed: 15, goals: 1, assists: 2, yellowCards: 5, redCards: 0 },
        age: 26, height: 170, weight: 65, dominantFoot: 'Derecho', bio: 'Defensa central sólida y con buen juego aéreo.', strength: 90, speed: 75, stamina: 85, specialSkills: ['Defensa Férrea', 'Marcaje', 'Cabeceo'],
    },
    { 
        id: 'u3', name: 'Luis Fernandez', profilePicture: 'https://i.pravatar.cc/150?u=u3', number: 10, position: 'Medio', level: 'Competitivo', stats: { matchesPlayed: 15, goals: 6, assists: 9, yellowCards: 1, redCards: 0 },
        age: 30, height: 175, weight: 72, dominantFoot: 'Ambidiestro', bio: 'Mediocampista creativo con gran visión de juego.', strength: 78, speed: 82, stamina: 90, specialSkills: ['Visión de Juego', 'Pase Preciso', 'Regate Rápido'],
    },
    { 
        id: 'u4', name: 'Marta Gomez', profilePicture: 'https://i.pravatar.cc/150?u=u4', number: 1, position: 'Portero', level: 'Competitivo', stats: { matchesPlayed: 15, goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
        age: 24, height: 185, weight: 80, dominantFoot: 'Derecho', bio: 'Portera con excelentes reflejos y segura en el mano a mano.', strength: 88, speed: 80, stamina: 82, specialSkills: ['Portero Ágil', 'Liderazgo'],
    },
    { 
        id: 'u5', name: 'Juan Rodriguez', profilePicture: 'https://i.pravatar.cc/150?u=u5', number: 8, position: 'Medio', level: 'Intermedio', stats: { matchesPlayed: 13, goals: 3, assists: 5, yellowCards: 2, redCards: 0 },
        age: 22, height: 178, weight: 75, bio: 'Box-to-box midfielder.', strength: 80, speed: 85, stamina: 92, specialSkills: ['Resistencia', 'Pase Preciso'],
    },
    { 
        id: 'u6', name: 'Sofía López', profilePicture: 'https://i.pravatar.cc/150?u=u6', number: 11, position: 'Delantero', level: 'Intermedio', stats: { matchesPlayed: 10, goals: 7, assists: 2, yellowCards: 0, redCards: 0 },
        age: 25, height: 168, weight: 62, dominantFoot: 'Izquierdo', bio: 'Extremo veloz con buen uno contra uno.', strength: 70, speed: 94, stamina: 80, specialSkills: ['Velocidad', 'Regate Rápido'],
    },
    { id: 'u7', name: 'Diego Martínez', profilePicture: 'https://i.pravatar.cc/150?u=u7', number: 5, position: 'Defensa', level: 'Intermedio', stats: { matchesPlayed: 14, goals: 0, assists: 1, yellowCards: 8, redCards: 1 } },
    { id: 'u8', name: 'Leo Messi', profilePicture: 'https://i.pravatar.cc/150?u=u8', number: 30, position: 'Delantero', level: 'Competitivo', stats: { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 }},
    { id: 'u9', name: 'CR7', profilePicture: 'https://i.pravatar.cc/150?u=u9', number: 7, position: 'Delantero', level: 'Competitivo', stats: { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 }},
    { id: 'u10', name: 'Neymar Jr', profilePicture: 'https://i.pravatar.cc/150?u=u10', number: 10, position: 'Delantero', level: 'Competitivo', stats: { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 }},
    { id: 'u11', name: 'Kylian Mbappe', profilePicture: 'https://i.pravatar.cc/150?u=u11', number: 7, position: 'Delantero', level: 'Competitivo', stats: { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 }},
    { id: 'u12', name: 'Luka Modric', profilePicture: 'https://i.pravatar.cc/150?u=u12', number: 10, position: 'Medio', level: 'Competitivo', stats: { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 }},
];

const mockSchedule: TeamEvent[] = [
    { id: 'ev1', type: 'match', date: new Date(new Date().setDate(new Date().getDate() + 3)), title: 'vs. Atlético Panas', location: 'Gol Center Envigado' },
    { id: 'ev2', type: 'training', date: new Date(new Date().setDate(new Date().getDate() + 5)), title: 'Entrenamiento Táctico', location: 'Cancha El Templo' },
    { id: 'ev3', type: 'event', date: new Date(new Date().setDate(new Date().getDate() + 10)), title: 'Asado de Equipo', location: 'Club Campestre' },
];

const mockTeams: Team[] = [
    {
        id: 't1', name: 'Los Galácticos', captainId: 'u1', players: mockPlayers.slice(0, 7),
        level: 'Competitivo', stats: { wins: 1, losses: 0, draws: 1 },
        formation: '4-3-3',
        playerPositions: {},
        tacticsNotes: "Presión alta al rival. Salida rápida por las bandas. El #10 tiene libertad de movimiento.",
        schedule: mockSchedule,
        matchHistory: [
            { id: 'mh1', teamA: {id: 't1', name: 'Los Galácticos'}, teamB: {id: 'ext1', name: 'Rivales FC'}, scoreA: 3, scoreB: 3, date: new Date('2024-07-20'), status: 'jugado'},
            { id: 'mh2', teamA: {id: 't1', name: 'Los Galácticos'}, teamB: {id: 'ext2', name: 'Deportivo Amigos'}, scoreA: 5, scoreB: 2, date: new Date('2024-07-13'), status: 'jugado'},
        ],
    },
    {
        id: 't2', name: 'Atlético Panas', captainId: 'u6', players: [],
        level: 'Intermedio', stats: { wins: 8, losses: 5, draws: 3 },
        formation: '4-4-2', playerPositions: {}, schedule: [], 
        matchHistory: [
             { id: 'mh3', teamA: {id: 't2', name: 'Atlético Panas'}, teamB: {id: 'ext3', name: 'Real Mandil'}, scoreA: 1, scoreB: 2, date: new Date('2024-07-22'), status: 'jugado'},
             { id: 'mh4', teamA: {id: 't2', name: 'Atlético Panas'}, teamB: {id: 'ext4', name: 'Spartans FC'}, scoreA: 4, scoreB: 0, date: new Date('2024-07-15'), status: 'jugado'},
        ],
    },
    {
        id: 't3', name: 'Real Mandil', captainId: 'u-other', players: [mockPlayers[8], mockPlayers[9]],
        level: 'Casual', stats: { wins: 3, losses: 9, draws: 2 },
        formation: '4-4-2', playerPositions: {}, schedule: [], matchHistory: [],
    },
    {
        id: 't4', name: 'Spartans FC', captainId: 'u-other', players: [mockPlayers[10], mockPlayers[11]],
        level: 'Competitivo', stats: { wins: 15, losses: 1, draws: 0 },
        formation: '4-4-2', playerPositions: {}, schedule: [], matchHistory: [],
    },
];

const groupAMatches: Match[] = [
    { id: 'g1m1', teamA: mockTeams[0], teamB: mockTeams[1], scoreA: 3, scoreB: 1, date: new Date(2024, 7, 1), status: 'jugado', isEditable: true, events: []},
    { id: 'g1m2', teamA: mockTeams[2], teamB: mockTeams[3], scoreA: 2, scoreB: 2, date: new Date(2024, 7, 1), status: 'jugado', isEditable: true, events: [] },
];

const mockTournaments: Tournament[] = [
    {
        id: 'tor1', name: 'Copa Verano 2024', format: 'Fútbol 7', prize: '$1,000,000',
        status: 'en juego', structure: 'groups-then-knockout', teams: mockTeams.slice(0,4),
        groups: [{ id: 'g1', name: 'Grupo A', teams: mockTeams.slice(0, 4), standings: [], matches: groupAMatches }],
        knockoutRounds: []
    },
    {
        id: 'tor2', name: 'Torneo Relámpago', format: 'Fútbol 5', prize: 'Trofeo + Medallas',
        status: 'inscripciones abiertas', structure: 'knockout', teams: [],
    }
];
// --- END MOCK DATA ---

interface SocialViewProps {
    user: User;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
    onNavigate: (view: View) => void;
    setIsPremiumModalOpen: (isOpen: boolean) => void;
}

type SocialSection = 'hub' | 'tournaments' | 'my-team' | 'challenge' | 'find-players' | 'sports-forum';

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
        <div className="p-4 sm:p-6 pb-28 relative z-10">
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

const SocialView: React.FC<SocialViewProps> = ({ user, addNotification, onNavigate, setIsPremiumModalOpen }) => {
    const [section, setSection] = useState<SocialSection>('hub');
    const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
    const [teams, setTeams] = useState<Team[]>(mockTeams);
    const [viewingPlayerProfile, setViewingPlayerProfile] = useState<Player | null>(null);
    
    const [userTeam, setUserTeam] = useState<Team | undefined>(teams.find(t => t.id === user.teamId));

    const handleUpdateTeam = (updatedTeam: Team) => {
        setUserTeam(updatedTeam);
        setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    };

    const handleCreateTeam = (teamData: { name: string; logo: string | null; level: 'Casual' | 'Intermedio' | 'Competitivo' }) => {
        const currentUserAsPlayer = mockPlayers.find(p => p.id === user.id) || {
            id: user.id, name: user.name, position: 'Cualquiera', level: teamData.level, stats: { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 }
        };
        const newTeam: Team = {
            id: `t-${Date.now()}`,
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
        };
        setTeams(prev => [newTeam, ...prev]);
        setUserTeam(newTeam);
        addNotification({type: 'success', title: '¡Equipo Creado!', message: `Bienvenido a ${newTeam.name}.`});
    };
    
    const handleRecruit = (player: Player) => {
        addNotification({
            type: 'info',
            title: 'Invitación Enviada',
            message: `Se ha enviado una invitación a ${player.name} para unirse a tu equipo.`
        });
    };

    const handlePremiumSectionClick = (section: SocialSection) => {
        // This function now correctly handles navigation between hub sections.
        // The premium check that was here before is temporarily disabled.
        setSection(section);
    };

    const renderContent = () => {
        if (!user.playerProfile) {
            return <div className="p-4"><PlayerProfileOnboarding onNavigate={onNavigate} /></div>;
        }

        switch (section) {
            case 'tournaments':
                return <TournamentsView 
                            tournaments={tournaments} 
                            onBack={() => setSection('hub')} 
                            addNotification={addNotification} 
                            user={user} />;
            case 'my-team':
                return <MyTeamDashboard
                    team={userTeam}
                    onBack={() => setSection('hub')}
                    addNotification={addNotification}
                    onUpdateTeam={handleUpdateTeam}
                    onCreateTeam={handleCreateTeam}
                    allPlayers={mockPlayers}
                 />;
            case 'challenge':
                const otherTeams = teams.filter(t => t.id !== userTeam?.id);
                return <ChallengeView teams={otherTeams} onBack={() => setSection('hub')} addNotification={addNotification} />;
            case 'find-players':
                if (viewingPlayerProfile) {
                    return <PlayerProfileDetailView 
                                player={viewingPlayerProfile} 
                                onBack={() => setViewingPlayerProfile(null)} 
                                onRecruit={handleRecruit}
                            />;
                }
                const userTeamPlayers = userTeam?.players || [];
                const availablePlayers = mockPlayers.filter(p => !userTeamPlayers.find(ut => ut.id === p.id));
                return <FindPlayersView 
                            players={availablePlayers} 
                            onBack={() => setSection('hub')} 
                            onRecruit={handleRecruit} 
                            onViewProfile={setViewingPlayerProfile} 
                        />;
            case 'sports-forum':
                return <SportsForumView user={user} addNotification={addNotification} onBack={() => setSection('hub')} />;
            default:
                return <PlayerHub user={user} onSectionNavigate={handlePremiumSectionClick} onNavigateToCreator={() => onNavigate(View.PLAYER_PROFILE_CREATOR)} />
        }
    };

    return <div className="animate-fade-in text-white">{renderContent()}</div>;
};

// --- SUB-VIEWS ---

const BackButton: React.FC<{ onClick: () => void, text: string }> = ({ onClick, text }) => (
    <button onClick={onClick} className="flex items-center gap-2 text-[var(--color-primary-400)] font-semibold mb-6 hover:underline">
        <ChevronLeftIcon className="h-5 w-5" />
        {text}
    </button>
);

const TournamentsView: React.FC<{
    tournaments: Tournament[];
    onBack: () => void;
    addNotification: (notif: Omit<Notification, 'id'>) => void;
    user: User;
}> = ({ tournaments, onBack, addNotification, user }) => {
    return (
        <div className="p-4 pb-24 md:pb-4">
            <BackButton onClick={onBack} text="Volver a DaviPlay" />
            <div className="text-center py-20 px-6 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl mt-6">
                <TrophyIcon className="mx-auto h-16 w-16 text-gray-400" />
                <h2 className="mt-4 text-2xl font-bold tracking-tight">Próximamente: Torneos</h2>
                <p className="mt-2 text-base text-gray-400 max-w-md mx-auto">
                    ¡Estamos preparando todo para que puedas competir por la gloria! La sección de torneos estará disponible muy pronto.
                </p>
            </div>
        </div>
    );
};

const TeamProfileView: React.FC<{ team: Team, onBack: () => void }> = ({ team, onBack }) => {
    const sortedHistory = (team.matchHistory || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return (
        <div className="p-4">
             <BackButton onClick={onBack} text="Volver a Retar Equipos" />
             <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-6">
                    {team.logo ? <img src={team.logo} alt={`${team.name} logo`} className="w-20 h-20 rounded-full object-cover border-4 border-gray-700" /> : <ShieldIcon className="w-20 h-20 text-gray-400" />}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                        <p className="font-semibold text-gray-400">{team.level}</p>
                    </div>
                </div>
                 <div className="grid grid-cols-3 gap-4 text-center">
                     <div>
                         <p className="text-3xl font-black text-green-400">{team.stats.wins}</p>
                         <p className="text-sm text-gray-400 font-semibold uppercase">Victorias</p>
                     </div>
                     <div>
                         <p className="text-3xl font-black text-yellow-400">{team.stats.draws}</p>
                         <p className="text-sm text-gray-400 font-semibold uppercase">Empates</p>
                     </div>
                     <div>
                         <p className="text-3xl font-black text-red-400">{team.stats.losses}</p>
                         <p className="text-sm text-gray-400 font-semibold uppercase">Derrotas</p>
                     </div>
                 </div>
                 <div className="mt-8">
                     <h3 className="text-xl font-bold mb-4">Historial de Partidos</h3>
                     <div className="space-y-3">
                        {sortedHistory.length > 0 ? (
                            sortedHistory.map(match => {
                                const isTeamA = 'id' in match.teamA && match.teamA.id === team.id;
                                const scoreUs = (isTeamA ? match.scoreA : match.scoreB) ?? 0;
                                const scoreThem = (isTeamA ? match.scoreB : match.scoreA) ?? 0;
                                const opponent = isTeamA ? match.teamB : match.teamA;
                                const opponentName = 'name' in opponent ? opponent.name : 'Rival';

                                let result: 'G' | 'E' | 'P';
                                let resultColor = '';
                                if (scoreUs > scoreThem) {
                                    result = 'G';
                                    resultColor = 'bg-green-900/50 text-green-300';
                                } else if (scoreUs < scoreThem) {
                                    result = 'P';
                                    resultColor = 'bg-red-900/50 text-red-300';
                                } else {
                                    result = 'E';
                                    resultColor = 'bg-yellow-900/50 text-yellow-300';
                                }
                                
                                return (
                                    <div key={match.id} className="bg-gray-700/50 p-3 rounded-lg flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-black text-lg ${resultColor}`}>{result}</div>
                                        <div className="flex-grow">
                                            <p className="font-semibold">vs. {opponentName}</p>
                                            <p className="text-xs text-gray-400">{new Date(match.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                        <div className="font-bold text-lg">{scoreUs} - {scoreThem}</div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center py-4 text-gray-400">Este equipo aún no ha jugado partidos.</p>
                        )}
                     </div>
                 </div>
             </div>
        </div>
    );
};

const ChallengeView: React.FC<{ teams: Team[], onBack: () => void, addNotification: (notif: Omit<Notification, 'id'>) => void }> = ({ teams, onBack, addNotification }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    
    const handleChallenge = (team: Team) => {
        addNotification({
            type: 'info',
            title: 'Reto Enviado',
            message: `Se ha enviado una solicitud de partido a ${team.name}.`
        });
    };

    const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (selectedTeam) {
        return <TeamProfileView team={selectedTeam} onBack={() => setSelectedTeam(null)} />;
    }

    return (
        <div className="p-4 pb-24 md:pb-4">
            <BackButton onClick={onBack} text="Volver a DaviPlay" />
            <h1 className="text-3xl font-bold tracking-tight mb-6">Retar Equipos</h1>
             <div className="relative mb-6">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <input
                    type="text"
                    placeholder="Busca un equipo por su nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-3 pl-12 pr-4 border-white/20 bg-black/20 rounded-full focus:ring-2 focus:ring-[var(--color-primary-400)] text-white placeholder-gray-400 shadow-sm"
                />
            </div>
            <div className="space-y-4">
                {filteredTeams.length > 0 ? filteredTeams.map(team => (
                    <div key={team.id} className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            {team.logo ? <img src={team.logo} alt="logo" className="w-10 h-10 rounded-full object-cover" /> : <ShieldIcon className="w-10 h-10 text-gray-400"/>}
                            <div>
                                <p className="font-bold text-lg">{team.name}</p>
                                <p className="text-sm text-gray-400">{team.level} - {team.players.length} jugadores</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => setSelectedTeam(team)} className="bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                                Ver Perfil
                            </button>
                            <button onClick={() => handleChallenge(team)} className="bg-[var(--color-primary-900)]/50 text-[var(--color-primary-400)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-900)]/80 transition-colors text-sm">
                                Retar
                            </button>
                        </div>
                    </div>
                )) : (
                    <p className="text-center py-10 text-gray-400">No se encontraron equipos con ese nombre.</p>
                )}
            </div>
        </div>
    );
};

const FindPlayersView: React.FC<{ 
    players: Player[], 
    onBack: () => void, 
    onRecruit: (player: Player) => void, 
    onViewProfile: (player: Player) => void 
}> = ({ players, onBack, onRecruit, onViewProfile }) => {
    return (
        <div className="p-4 pb-24 md:pb-4">
            <BackButton onClick={onBack} text="Volver a DaviPlay" />
            <h1 className="text-3xl font-bold tracking-tight mb-6">Buscar Jugadores</h1>
            <div className="space-y-4">
                {players.map(player => (
                    <div key={player.id} className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {player.profilePicture ? <img src={player.profilePicture} alt={player.name} className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 text-gray-400"/>}
                            </div>
                            <div>
                                <p className="font-bold text-lg">{player.name}</p>
                                <p className="text-sm text-gray-400">{player.position} - Nivel: {player.level}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => onViewProfile(player)} className="bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                                Ver Perfil
                            </button>
                            <button onClick={() => onRecruit(player)} className="bg-[var(--color-primary-900)]/50 text-[var(--color-primary-400)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-900)]/80 transition-colors text-sm">
                                Reclutar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default SocialView;