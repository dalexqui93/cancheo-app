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

type SocialSection = 'main' | 'tournaments' | 'my-team' | 'challenge' | 'find-players' | 'sports-forum';

const SectionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; isPremium?: boolean; isLocked?: boolean }> = ({ title, description, icon, onClick, isPremium = false, isLocked = false }) => (
    <button onClick={onClick} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 text-left w-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-6">
        <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)]/50 rounded-lg flex items-center justify-center text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                {title}
                {isPremium && isLocked && <PremiumBadge />}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
    </button>
);

const PlayerProfileOnboarding: React.FC<{ onNavigate: (view: View) => void }> = ({ onNavigate }) => {
    return (
        <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md border dark:border-gray-700">
            <PlayerKickingBallIcon className="mx-auto h-20 w-20 text-[var(--color-primary-500)]" />
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

const SocialView: React.FC<SocialViewProps> = ({ user, addNotification, onNavigate, setIsPremiumModalOpen }) => {
    const [section, setSection] = useState<SocialSection>('main');
    const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
    const [teams, setTeams] = useState<Team[]>(mockTeams);
    const [viewingPlayerProfile, setViewingPlayerProfile] = useState<Player | null>(null);
    
    // Find the user's team from the mock data, or leave it undefined if they don't have one.
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

    const handlePremiumSectionClick = (action: () => void) => {
        if (user.isPremium) {
            action();
        } else {
            setIsPremiumModalOpen(true);
        }
    };

    const renderContent = () => {
        if (!user.playerProfile) {
            return <PlayerProfileOnboarding onNavigate={onNavigate} />;
        }

        switch (section) {
            case 'tournaments':
                return <TournamentsView 
                            tournaments={tournaments} 
                            onBack={() => setSection('main')} 
                            addNotification={addNotification} 
                            user={user} />;
            case 'my-team':
                return <MyTeamDashboard
                    team={userTeam}
                    onBack={() => setSection('main')}
                    addNotification={addNotification}
                    onUpdateTeam={handleUpdateTeam}
                    onCreateTeam={handleCreateTeam}
                    allPlayers={mockPlayers}
                 />
            case 'challenge':
                const otherTeams = teams.filter(t => t.id !== userTeam?.id);
                return <ChallengeView teams={otherTeams} onBack={() => setSection('main')} addNotification={addNotification} />;
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
                            onBack={() => setSection('main')} 
                            onRecruit={handleRecruit} 
                            onViewProfile={setViewingPlayerProfile} 
                        />;
            case 'sports-forum':
                return <SportsForumView user={user} addNotification={addNotification} onBack={() => setSection('main')} />;
            default:
                return (
                    <>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">DaviPlay</h1>
                        <div className="space-y-4">
                            <SectionCard title="Mi Perfil de Jugador" description="Crea y personaliza tu avatar deportivo." icon={<span className="text-3xl">👕</span>} onClick={() => onNavigate(View.PLAYER_PROFILE_CREATOR)} />
                            <SectionCard title="Foro Deportivo" description="Publica, debate y opina sobre deportes." icon={<span className="text-2xl">💬</span>} onClick={() => handlePremiumSectionClick(() => setSection('sports-forum'))} isPremium isLocked={!user.isPremium} />
                            <SectionCard title="Torneos" description="Compite por la gloria y los premios." icon={<span className="text-2xl">🏆</span>} onClick={() => handlePremiumSectionClick(() => setSection('tournaments'))} isPremium isLocked={!user.isPremium} />
                            <SectionCard title="Mi Equipo" description="Gestiona tu plantilla, tácticas y más." icon={<span className="text-2xl">🛡️</span>} onClick={() => handlePremiumSectionClick(() => setSection('my-team'))} isPremium isLocked={!user.isPremium} />
                            <SectionCard title="Retar Equipos" description="Encuentra rivales y organiza partidos." icon={<span className="text-2xl">⚔️</span>} onClick={() => handlePremiumSectionClick(() => setSection('challenge'))} isPremium isLocked={!user.isPremium} />
                            <SectionCard title="Buscar Jugadores" description="Recluta nuevos talentos para tu equipo." icon={<span className="text-2xl">🕵️</span>} onClick={() => handlePremiumSectionClick(() => setSection('find-players'))} isPremium isLocked={!user.isPremium} />
                        </div>
                    </>
                );
        }
    };

    return <div className="animate-fade-in">{renderContent()}</div>;
};

// --- SUB-VIEWS ---

const BackButton: React.FC<{ onClick: () => void, text: string }> = ({ onClick, text }) => (
    <button onClick={onClick} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold mb-6 hover:underline">
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
        <div>
            <BackButton onClick={onBack} text="Volver a DaviPlay" />
            <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md border dark:border-gray-700 mt-6">
                <TrophyIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Próximamente: Torneos</h2>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    ¡Estamos preparando todo para que puedas competir por la gloria! La sección de torneos estará disponible muy pronto.
                </p>
            </div>
        </div>
    );
};

const TeamProfileView: React.FC<{ team: Team, onBack: () => void }> = ({ team, onBack }) => {
    const sortedHistory = (team.matchHistory || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return (
        <div>
             <BackButton onClick={onBack} text="Volver a Retar Equipos" />
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border dark:border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                    {team.logo ? <img src={team.logo} alt={`${team.name} logo`} className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700" /> : <ShieldIcon className="w-20 h-20 text-gray-400" />}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                        <p className="font-semibold text-gray-500 dark:text-gray-400">{team.level}</p>
                    </div>
                </div>
                 <div className="grid grid-cols-3 gap-4 text-center">
                     <div>
                         <p className="text-3xl font-black text-green-500">{team.stats.wins}</p>
                         <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase">Victorias</p>
                     </div>
                     <div>
                         <p className="text-3xl font-black text-yellow-500">{team.stats.draws}</p>
                         <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase">Empates</p>
                     </div>
                     <div>
                         <p className="text-3xl font-black text-red-500">{team.stats.losses}</p>
                         <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase">Derrotas</p>
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
                                    resultColor = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
                                } else if (scoreUs < scoreThem) {
                                    result = 'P';
                                    resultColor = 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
                                } else {
                                    result = 'E';
                                    resultColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
                                }
                                
                                return (
                                    <div key={match.id} className="bg-slate-50 dark:bg-gray-700/50 p-3 rounded-lg flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-black text-lg ${resultColor}`}>{result}</div>
                                        <div className="flex-grow">
                                            <p className="font-semibold">vs. {opponentName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(match.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                        <div className="font-bold text-lg">{scoreUs} - {scoreThem}</div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center py-4 text-gray-500 dark:text-gray-400">Este equipo aún no ha jugado partidos.</p>
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
        <div>
            <BackButton onClick={onBack} text="Volver a DaviPlay" />
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">Retar Equipos</h1>
             <div className="relative mb-6">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <input
                    type="text"
                    placeholder="Busca un equipo por su nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-3 pl-12 pr-4 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-[var(--color-primary-400)] text-gray-800 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 shadow-sm"
                />
            </div>
            <div className="space-y-4">
                {filteredTeams.length > 0 ? filteredTeams.map(team => (
                    <div key={team.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            {team.logo ? <img src={team.logo} alt="logo" className="w-10 h-10 rounded-full object-cover" /> : <ShieldIcon className="w-10 h-10 text-gray-400"/>}
                            <div>
                                <p className="font-bold text-lg">{team.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{team.level} - {team.players.length} jugadores</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => setSelectedTeam(team)} className="bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors text-sm">
                                Ver Perfil
                            </button>
                            <button onClick={() => handleChallenge(team)} className="bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)]/50 dark:text-[var(--color-primary-400)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-200)] dark:hover:bg-[var(--color-primary-900)]/80 transition-colors text-sm">
                                Retar
                            </button>
                        </div>
                    </div>
                )) : (
                    <p className="text-center py-10 text-gray-500 dark:text-gray-400">No se encontraron equipos con ese nombre.</p>
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
        <div>
            <BackButton onClick={onBack} text="Volver a DaviPlay" />
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">Buscar Jugadores</h1>
            <div className="space-y-4">
                {players.map(player => (
                    <div key={player.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {player.profilePicture ? <img src={player.profilePicture} alt={player.name} className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 text-slate-500 dark:text-gray-400"/>}
                            </div>
                            <div>
                                <p className="font-bold text-lg">{player.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{player.position} - Nivel: {player.level}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => onViewProfile(player)} className="bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors text-sm">
                                Ver Perfil
                            </button>
                            <button onClick={() => onRecruit(player)} className="bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)]/50 dark:text-[var(--color-primary-400)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-200)] dark:hover:bg-[var(--color-primary-900)]/80 transition-colors text-sm">
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