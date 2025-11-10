import React, { useMemo, useState, useEffect } from 'react';
import type { Player, Team, Match, ConfirmedBooking } from '../../types';
import { ChevronDownIcon } from '../../components/icons/ChevronDownIcon';
import { SoccerBallIcon } from '../../components/icons/SoccerBallIcon';
import { ShoeIcon } from '../../components/icons/ShoeIcon';
import { YellowCardIcon } from '../../components/icons/YellowCardIcon';
import { RedCardIcon } from '../../components/icons/RedCardIcon';
import { UserIcon } from '../../components/icons/UserIcon';

interface PerformanceViewProps {
    team: Team;
    allBookings: ConfirmedBooking[];
    onUpdateTeam: (updates: Partial<Team>) => void;
}

type SortKey = keyof Player['stats'] | 'name';
type SortDirection = 'asc' | 'desc';

const recalculateTeamStats = (matches: Match[], teamId: string) => {
    let wins = 0, losses = 0, draws = 0;
    matches.forEach(match => {
        if (typeof match.scoreA !== 'number' || typeof match.scoreB !== 'number') return;
        
        const isTeamA = 'id' in match.teamA && match.teamA.id === teamId;
        const scoreUs = isTeamA ? match.scoreA : match.scoreB;
        const scoreThem = isTeamA ? match.scoreB : match.scoreA;

        if (scoreUs > scoreThem) wins++;
        else if (scoreUs < scoreThem) losses++;
        else draws++;
    });
    return { wins, losses, draws };
};


const StatBox: React.FC<{ title: string; value: string | number; subValue?: string, children?: React.ReactNode }> = ({ title, value, subValue, children }) => (
    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-xl h-full flex flex-col justify-between">
        <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
        {children && <div className="mt-2">{children}</div>}
    </div>
);

const TopPerformerCard: React.FC<{ player: Player | undefined; stat: number; title: string; icon: React.ReactNode }> = ({ player, stat, title, icon }) => (
    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4 h-full">
        {player ? <>
            <div className="w-16 h-16 rounded-full bg-black/30 flex items-center justify-center shadow-md border-2 border-white/20 overflow-hidden flex-shrink-0">
                {player.profilePicture ? <img src={player.profilePicture} alt={player.name} className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-gray-400"/>}
            </div>
            <div>
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">{title}</p>
                <p className="font-bold text-lg text-white">{player.name}</p>
                <div className="flex items-center gap-2 mt-1 text-gray-300">
                    {icon}
                    <span className="font-bold text-xl">{stat}</span>
                </div>
            </div>
        </> : <p className="text-center w-full text-gray-400">No hay datos</p>}
    </div>
);

const SortableHeader: React.FC<{
    label: string;
    sortKey: SortKey;
    currentSort: { key: SortKey; direction: SortDirection };
    onSort: (key: SortKey) => void;
}> = ({ label, sortKey, currentSort, onSort }) => {
    const isCurrentKey = currentSort.key === sortKey;
    return (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
            <button className="flex items-center gap-1" onClick={() => onSort(sortKey)}>
                {label}
                {isCurrentKey && <ChevronDownIcon className={`w-4 h-4 transition-transform ${currentSort.direction === 'asc' ? 'transform rotate-180' : ''}`} />}
            </button>
        </th>
    );
};

const PerformanceView: React.FC<PerformanceViewProps> = ({ team, allBookings, onUpdateTeam }) => {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'matchesPlayed', direction: 'desc' });
    
    useEffect(() => {
        if (!allBookings || allBookings.length === 0) return;

        const existingBookingIds = new Set((team.matchHistory || []).map(m => m.bookingId).filter(Boolean));

        const newCompletedMatches = allBookings.filter(booking =>
            booking.status === 'completed' &&
            (booking.teamName?.toLowerCase() === team.name.toLowerCase()) &&
            !existingBookingIds.has(booking.id) &&
            typeof booking.scoreA === 'number' && typeof booking.scoreB === 'number'
        );

        if (newCompletedMatches.length === 0) {
            return;
        }

        const newMatches: Match[] = newCompletedMatches.map(booking => ({
            id: `mh-${booking.id}`,
            bookingId: booking.id,
            teamA: { id: team.id, name: team.name, logo: team.logo },
            teamB: { id: `ext-${booking.id}`, name: booking.rivalName || 'Rival' },
            scoreA: booking.scoreA,
            scoreB: booking.scoreB,
            date: new Date(booking.date),
            status: 'jugado',
        }));

        const updatedHistory = [...(team.matchHistory || []), ...newMatches];
        const newStats = recalculateTeamStats(updatedHistory, team.id);

        const updatedPlayers = team.players.map(player => ({
            ...player,
            stats: {
                ...player.stats,
                matchesPlayed: (player.stats.matchesPlayed || 0) + newCompletedMatches.length
            }
        }));

        onUpdateTeam({
            ...team,
            matchHistory: updatedHistory,
            stats: newStats,
            players: updatedPlayers
        });

    }, [allBookings, team, onUpdateTeam]);


    const matchHistory = useMemo(() => (team.matchHistory || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [team.matchHistory]);
    
    const { totalMatches, winPercentage, goalsFor, topScorer, topAssister } = useMemo(() => {
        const history = team.matchHistory || [];
        const totalMatches = history.length;
        const winPercentage = totalMatches > 0 ? ((team.stats.wins / totalMatches) * 100).toFixed(0) + '%' : 'N/A';
        const goalsFor = history.reduce((sum, match) => {
            const isTeamA = 'id' in match.teamA && match.teamA.id === team.id;
            return sum + (isTeamA ? (match.scoreA ?? 0) : (match.scoreB ?? 0));
        }, 0);

        const sortedByGoals = [...team.players].sort((a, b) => b.stats.goals - a.stats.goals);
        const topScorer = sortedByGoals[0]?.stats.goals > 0 ? sortedByGoals[0] : undefined;

        const sortedByAssists = [...team.players].sort((a, b) => b.stats.assists - a.stats.assists);
        const topAssister = sortedByAssists[0]?.stats.assists > 0 ? sortedByAssists[0] : undefined;
        
        return { totalMatches, winPercentage, goalsFor, topScorer, topAssister };
    }, [team]);

    const sortedPlayers = useMemo(() => {
        const sortablePlayers = [...team.players];
        sortablePlayers.sort((a, b) => {
            const aVal = sortConfig.key === 'name' ? a.name : a.stats[sortConfig.key as keyof Player['stats']];
            const bVal = sortConfig.key === 'name' ? b.name : b.stats[sortConfig.key as keyof Player['stats']];

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sortablePlayers;
    }, [team.players, sortConfig]);

    const handleSort = (key: SortKey) => {
        let direction: SortDirection = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight">Rendimiento del Equipo</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatBox title="Récord General" value={`${team.stats.wins}-${team.stats.draws}-${team.stats.losses}`} subValue="V-E-P">
                    <div className="flex h-3 rounded-full overflow-hidden bg-black/30">
                        <div className="bg-green-500" style={{width: `${totalMatches > 0 ? (team.stats.wins/totalMatches)*100 : 0}%`}}></div>
                        <div className="bg-yellow-500" style={{width: `${totalMatches > 0 ? (team.stats.draws/totalMatches)*100 : 0}%`}}></div>
                        <div className="bg-red-500" style={{width: `${totalMatches > 0 ? (team.stats.losses/totalMatches)*100 : 0}%`}}></div>
                    </div>
                </StatBox>
                <StatBox title="Goles a Favor" value={goalsFor} />
                <StatBox title="Tasa de Victorias" value={winPercentage} />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <TopPerformerCard player={topScorer} stat={topScorer?.stats.goals ?? 0} title="Máximo Goleador" icon={<SoccerBallIcon className="w-5 h-5"/>} />
                 <TopPerformerCard player={topAssister} stat={topAssister?.stats.assists ?? 0} title="Máximo Asistente" icon={<ShoeIcon className="w-5 h-5"/>} />
             </div>

            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl">
                <div className="p-6">
                    <h2 className="text-xl font-bold">Historial de Partidos</h2>
                     <p className="text-xs text-gray-400 mt-1">Solo se muestran los partidos jugados y reservados a través de la app.</p>
                </div>
                {matchHistory.length > 0 ? (
                    <div className="space-y-3 p-6 pt-0">
                        {matchHistory.map(match => {
                             const isTeamA = 'id' in match.teamA && match.teamA.id === team.id;
                            const scoreUs = (isTeamA ? match.scoreA : match.scoreB) ?? 0;
                            const scoreThem = (isTeamA ? match.scoreB : match.scoreA) ?? 0;
                            const result = scoreUs > scoreThem ? 'V' : scoreUs < scoreThem ? 'D' : 'E';
                            const resultColor = result === 'V' ? 'bg-green-900/50 text-green-300' : result === 'D' ? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300';
                            
                            return (
                                <div key={match.id} className="bg-black/20 p-3 rounded-lg flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-black text-lg ${resultColor}`}>{result}</div>
                                    <div className="flex-grow">
                                        <p className="font-semibold">vs. {'name' in match.teamB ? match.teamB.name : 'Rival'}</p>
                                        <p className="text-xs text-gray-400">{new Date(match.date).toLocaleDateString('es-CO', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                                    </div>
                                    <div className="font-bold text-lg">{scoreUs} - {scoreThem}</div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="px-6 pb-6 text-gray-400">No hay partidos registrados en la app.</p>
                )}
            </div>
            
             <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
                <h2 className="text-xl font-bold p-6">Estadísticas de Jugadores</h2>
                <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-black/20">
                            <tr>
                                <SortableHeader label="Jugador" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeader label="PJ" sortKey="matchesPlayed" currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeader label="G" sortKey="goals" currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeader label="A" sortKey="assists" currentSort={sortConfig} onSort={handleSort} />
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tarjetas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                           {sortedPlayers.map(player => (
                               <tr key={player.id} className="hover:bg-black/20">
                                   <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="text-sm font-medium text-white">{player.name}</div>
                                       <div className="text-sm text-gray-400">{player.position}</div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{player.stats.matchesPlayed}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{player.stats.goals}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{player.stats.assists}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                       <div className="flex items-center gap-2">
                                           <span className="flex items-center gap-1"><YellowCardIcon className="w-2.5 h-3.5"/> {player.stats.yellowCards}</span>
                                           <span className="flex items-center gap-1"><RedCardIcon className="w-2.5 h-3.5"/> {player.stats.redCards}</span>
                                       </div>
                                   </td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PerformanceView;