import React, { useMemo, useState } from 'react';
import type { Player, Team, Match } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { ChevronDownIcon } from '../../components/icons/ChevronDownIcon';
import { SoccerBallIcon } from '../../components/icons/SoccerBallIcon';
import { ShoeIcon } from '../../components/icons/ShoeIcon';
import { YellowCardIcon } from '../../components/icons/YellowCardIcon';
import { RedCardIcon } from '../../components/icons/RedCardIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { XIcon } from '../../components/icons/XIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import ConfirmationModal from '../../components/ConfirmationModal';

interface PerformanceViewProps {
    team: Team;
    onBack: () => void;
    onUpdateTeam: (team: Team) => void;
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

const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const MatchModal: React.FC<{
    match: Match | null;
    onClose: () => void;
    onSave: (data: { opponentName: string, scoreA: number, scoreB: number, date: string }) => void;
}> = ({ match, onClose, onSave }) => {
    const [opponentName, setOpponentName] = useState(match && 'name' in match.teamB ? match.teamB.name : '');
    const [scoreA, setScoreA] = useState(match?.scoreA ?? 0);
    const [scoreB, setScoreB] = useState(match?.scoreB ?? 0);
    const [date, setDate] = useState(match ? formatDateForInput(new Date(match.date)) : formatDateForInput(new Date()));

    const handleSubmit = () => {
        if (opponentName.trim() && date) {
            onSave({ opponentName, scoreA, scoreB, date });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md m-4 p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">{match ? 'Editar' : 'Agregar'} Partido</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="font-semibold block mb-1">Nombre del Rival</label>
                        <input type="text" value={opponentName} onChange={e => setOpponentName(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="font-semibold block mb-1">Tu Marcador</label>
                            <input type="number" value={scoreA} onChange={e => setScoreA(Number(e.target.value))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                        <div className="flex-1">
                            <label className="font-semibold block mb-1">Marcador Rival</label>
                            <input type="number" value={scoreB} onChange={e => setScoreB(Number(e.target.value))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                    </div>
                     <div>
                        <label className="font-semibold block mb-1">Fecha del Partido</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-5 rounded-lg font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Cancelar</button>
                    <button onClick={handleSubmit} className="py-2 px-5 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm">Guardar</button>
                </div>
            </div>
        </div>
    );
};


const StatBox: React.FC<{ title: string; value: string | number; subValue?: string, children?: React.ReactNode }> = ({ title, value, subValue, children }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 h-full flex flex-col justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            {subValue && <p className="text-xs text-gray-500 dark:text-gray-400">{subValue}</p>}
        </div>
        {children && <div className="mt-2">{children}</div>}
    </div>
);

const TopPerformerCard: React.FC<{ player: Player | undefined; stat: number; title: string; icon: React.ReactNode }> = ({ player, stat, title, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 flex items-center gap-4 h-full">
        {player ? <>
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {player.profilePicture ? <img src={player.profilePicture} alt={player.name} className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-slate-500 dark:text-gray-400"/>}
            </div>
            <div>
                <p className="text-xs font-bold text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] uppercase tracking-wide">{title}</p>
                <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{player.name}</p>
                <div className="flex items-center gap-2 mt-1 text-gray-700 dark:text-gray-300">
                    {icon}
                    <span className="font-bold text-xl">{stat}</span>
                </div>
            </div>
        </> : <p className="text-center w-full text-gray-500 dark:text-gray-400">No hay datos</p>}
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
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <button className="flex items-center gap-1" onClick={() => onSort(sortKey)}>
                {label}
                {isCurrentKey && <ChevronDownIcon className={`w-4 h-4 transition-transform ${currentSort.direction === 'asc' ? 'transform rotate-180' : ''}`} />}
            </button>
        </th>
    );
};

const PerformanceView: React.FC<PerformanceViewProps> = ({ team, onBack, onUpdateTeam }) => {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'matchesPlayed', direction: 'desc' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);

    const matchHistory = useMemo(() => (team.matchHistory || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [team.matchHistory]);
    
    const { totalMatches, winPercentage, goalsFor, topScorer, topAssister } = useMemo(() => {
        const history = team.matchHistory || [];
        const totalMatches = history.length;
        const winPercentage = totalMatches > 0 ? ((team.stats.wins / totalMatches) * 100).toFixed(0) + '%' : 'N/A';
        const goalsFor = history.reduce((sum, p) => sum + (p.scoreA || 0), 0);

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

    const handleOpenModal = (match: Match | null) => {
        setEditingMatch(match);
        setIsModalOpen(true);
    };

    const handleSaveMatch = (data: { opponentName: string, scoreA: number, scoreB: number, date: string }) => {
        let updatedHistory: Match[];

        if (editingMatch) {
            updatedHistory = (team.matchHistory || []).map(m => m.id === editingMatch.id ? {
                ...m,
                teamB: { id: `ext-${Date.now()}`, name: data.opponentName },
                scoreA: data.scoreA,
                scoreB: data.scoreB,
                date: new Date(`${data.date}T00:00:00`),
            } : m);
        } else {
            const newMatch: Match = {
                id: `mh-${Date.now()}`,
                teamA: { id: team.id, name: team.name, logo: team.logo },
                teamB: { id: `ext-${Date.now()}`, name: data.opponentName },
                scoreA: data.scoreA,
                scoreB: data.scoreB,
                date: new Date(`${data.date}T00:00:00`),
                status: 'jugado',
            };
            updatedHistory = [...(team.matchHistory || []), newMatch];
        }
        
        const newStats = recalculateTeamStats(updatedHistory, team.id);
        onUpdateTeam({ ...team, matchHistory: updatedHistory, stats: newStats });
        setIsModalOpen(false);
        setEditingMatch(null);
    };

    const handleDeleteMatch = () => {
        if (!matchToDelete) return;
        const updatedHistory = (team.matchHistory || []).filter(m => m.id !== matchToDelete.id);
        const newStats = recalculateTeamStats(updatedHistory, team.id);
        onUpdateTeam({ ...team, matchHistory: updatedHistory, stats: newStats });
        setMatchToDelete(null);
    };


    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver al Panel
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Rendimiento del Equipo</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatBox title="Récord General" value={`${team.stats.wins}-${team.stats.draws}-${team.stats.losses}`} subValue="V-E-P">
                    <div className="flex h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <div className="bg-green-500" style={{width: `${(team.stats.wins/totalMatches)*100}%`}}></div>
                        <div className="bg-yellow-500" style={{width: `${(team.stats.draws/totalMatches)*100}%`}}></div>
                        <div className="bg-red-500" style={{width: `${(team.stats.losses/totalMatches)*100}%`}}></div>
                    </div>
                </StatBox>
                <StatBox title="Goles a Favor" value={goalsFor} />
                <StatBox title="Tasa de Victorias" value={winPercentage} />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <TopPerformerCard player={topScorer} stat={topScorer?.stats.goals ?? 0} title="Máximo Goleador" icon={<SoccerBallIcon className="w-5 h-5"/>} />
                 <TopPerformerCard player={topAssister} stat={topAssister?.stats.assists ?? 0} title="Máximo Asistente" icon={<ShoeIcon className="w-5 h-5"/>} />
             </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
                <div className="p-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Historial de Partidos</h2>
                    <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-[var(--color-primary-600)] text-white font-bold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-sm text-sm">
                        <PlusIcon className="w-5 h-5" />
                        Agregar Partido
                    </button>
                </div>
                {matchHistory.length > 0 ? (
                    <div className="space-y-3 p-6 pt-0">
                        {matchHistory.map(match => {
                            const result = (match.scoreA ?? 0) > (match.scoreB ?? 0) ? 'V' : (match.scoreA ?? 0) < (match.scoreB ?? 0) ? 'D' : 'E';
                            const resultColor = result === 'V' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : result === 'D' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
                            return (
                                <div key={match.id} className="bg-slate-50 dark:bg-gray-700/50 p-3 rounded-lg flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-black text-lg ${resultColor}`}>{result}</div>
                                    <div className="flex-grow">
                                        <p className="font-semibold">vs. {'name' in match.teamB ? match.teamB.name : 'Rival'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(match.date).toLocaleDateString('es-CO', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                                    </div>
                                    <div className="font-bold text-lg">{match.scoreA} - {match.scoreB}</div>
                                    <button onClick={() => handleOpenModal(match)} className="text-sm font-semibold text-[var(--color-primary-600)] hover:underline">Editar</button>
                                    <button onClick={() => setMatchToDelete(match)} className="text-gray-400 hover:text-red-500 p-1 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="px-6 pb-6 text-gray-500 dark:text-gray-400">No hay partidos registrados.</p>
                )}
            </div>
            
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 p-6">Estadísticas de Jugadores</h2>
                <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <SortableHeader label="Jugador" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeader label="PJ" sortKey="matchesPlayed" currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeader label="G" sortKey="goals" currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeader label="A" sortKey="assists" currentSort={sortConfig} onSort={handleSort} />
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tarjetas</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                           {sortedPlayers.map(player => (
                               <tr key={player.id}>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{player.name}</div>
                                       <div className="text-sm text-gray-500 dark:text-gray-400">{player.position}</div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.stats.matchesPlayed}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.stats.goals}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.stats.assists}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
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
            {isModalOpen && <MatchModal match={editingMatch} onClose={() => setIsModalOpen(false)} onSave={handleSaveMatch} />}
            <ConfirmationModal
                isOpen={!!matchToDelete}
                onClose={() => setMatchToDelete(null)}
                onConfirm={handleDeleteMatch}
                title="Eliminar Partido"
                message="¿Estás seguro de que quieres eliminar este partido del historial? Esta acción no se puede deshacer."
                confirmButtonText="Sí, eliminar"
            />
        </div>
    );
};

export default PerformanceView;