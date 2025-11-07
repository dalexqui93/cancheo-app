import React, { useState, useRef, useEffect } from 'react';
import type { Team, Formation, Player, User } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import FormationPitch from '../../components/team/FormationPitch';
import { SparklesIcon } from '../../components/icons/SparklesIcon';
import { GoogleGenAI } from '@google/genai';
import { XIcon } from '../../components/icons/XIcon';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';

interface TacticsViewProps {
    team: Team;
    user: User;
    isCaptain: boolean;
    onBack: () => void;
    onUpdateTeam: (team: Partial<Team>) => void;
    setIsPremiumModalOpen: (isOpen: boolean) => void;
}

const TacticalAnalysisModal: React.FC<{ team: Team; onClose: () => void; }> = ({ team, onClose }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getAnalysis = async () => {
            const lastMatches = (team.matchHistory || [])
                .slice(0, 3)
                .map(m => `vs ${'name' in m.teamB ? m.teamB.name : 'Rival'}: ${m.scoreA}-${m.scoreB}`)
                .join(', ');
            
            const prompt = `Eres un analista táctico de fútbol experto. Mi equipo amateur se llama "${team.name}" y nuestro nivel es ${team.level}.
Formación actual: ${team.formation}.
Últimos 3 resultados: ${lastMatches || 'No hay partidos registrados'}.
Notas tácticas actuales: "${team.tacticsNotes || 'Ninguna'}".

Analiza esta información y dame un consejo táctico para mejorar. Sugiere un posible cambio de formación o estrategia, y explica por qué sería beneficioso. Sé conciso y directo en tu recomendación.`;

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
                setAnalysis(response.text);
            } catch (e) {
                console.error("Error getting AI analysis:", String(e));
                setAnalysis('Hubo un error al obtener el análisis. Por favor, inténtalo de nuevo más tarde.');
            } finally {
                setIsLoading(false);
            }
        };
        getAnalysis();
    }, [team]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-yellow-400"/> Análisis del DT Virtual</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center text-center p-8">
                            <SpinnerIcon className="w-12 h-12 text-[var(--color-primary-500)]" />
                            <p className="mt-4 font-semibold">Analizando jugadas...</p>
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none whitespace-pre-wrap">{analysis}</div>
                    )}
                </div>
            </div>
        </div>
    );
};


const FORMATIONS: { name: Formation, layout: { pos: string, x: number, y: number }[] }[] = [
    { name: '4-4-2', layout: [
        { pos: 'POR', x: 50, y: 92 },
        { pos: 'LI', x: 15, y: 75 }, { pos: 'DFC', x: 35, y: 78 }, { pos: 'DFC', x: 65, y: 78 }, { pos: 'LD', x: 85, y: 75 },
        { pos: 'MI', x: 15, y: 50 }, { pos: 'MC', x: 35, y: 55 }, { pos: 'MC', x: 65, y: 55 }, { pos: 'MD', x: 85, y: 50 },
        { pos: 'DC', x: 35, y: 25 }, { pos: 'DC', x: 65, y: 25 },
    ]},
    { name: '4-3-3', layout: [
        { pos: 'POR', x: 50, y: 92 },
        { pos: 'LI', x: 15, y: 75 }, { pos: 'DFC', x: 35, y: 78 }, { pos: 'DFC', x: 65, y: 78 }, { pos: 'LD', x: 85, y: 75 },
        { pos: 'MC', x: 30, y: 55 }, { pos: 'MCD', x: 50, y: 65 }, { pos: 'MC', x: 70, y: 55 },
        { pos: 'EI', x: 20, y: 25 }, { pos: 'DC', x: 50, y: 20 }, { pos: 'ED', x: 80, y: 25 },
    ]},
    { name: '3-5-2', layout: [
        { pos: 'POR', x: 50, y: 92 },
        { pos: 'DFC', x: 25, y: 78 }, { pos: 'DFC', x: 50, y: 80 }, { pos: 'DFC', x: 75, y: 78 },
        { pos: 'CI', x: 10, y: 50 }, { pos: 'MC', x: 35, y: 55 }, { pos: 'MCO', x: 50, y: 45 }, { pos: 'MC', x: 65, y: 55 }, { pos: 'CD', x: 90, y: 50 },
        { pos: 'DC', x: 35, y: 25 }, { pos: 'DC', x: 65, y: 25 },
    ]},
];

const DraggablePlayerToken: React.FC<{ player: Player; onPointerDown: (e: React.PointerEvent, playerId: string) => void; isDragged: boolean; isCaptain: boolean; isDraggable: boolean }> = ({ player, onPointerDown, isDragged, isCaptain, isDraggable }) => (
    <div
        onPointerDown={(e) => isDraggable && onPointerDown(e, player.id)}
        className={`relative w-16 h-16 bg-gray-700 rounded-full flex flex-col items-center justify-center shadow-md text-center p-1 transition-opacity ${isDragged ? 'opacity-40' : 'opacity-100'} ${isDraggable ? 'touch-none cursor-grab active:cursor-grabbing' : 'cursor-default'} border-2 border-gray-500`}
        title={player.name}
    >
        <span className="font-black text-xl text-orange-400">{player.number || '?'}</span>
        <span className="text-[9px] font-semibold uppercase text-gray-300 truncate w-full">
            {player.name.split(' ').pop()}
        </span>
        {isCaptain && (
            <div title="Capitán" className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center border border-gray-200">C</div>
        )}
    </div>
);


const TacticsView: React.FC<TacticsViewProps> = ({ team, user, isCaptain, onBack, onUpdateTeam, setIsPremiumModalOpen }) => {
    const [formation, setFormation] = useState<Formation>(team.formation || 'Custom');
    const [notes, setNotes] = useState(team.tacticsNotes || '');
    const [playerPositions, setPlayerPositions] = useState<{[playerId: string]: { x: number; y: number; pos?: string }}>(team.playerPositions);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    
    // State for custom drag-and-drop
    const [draggedPlayer, setDraggedPlayer] = useState<{ id: string, origin: 'pitch' | 'bench' } | null>(null);
    const [dragPosition, setDragPosition] = useState<{ x: number, y: number } | null>(null);
    const pitchRef = useRef<HTMLDivElement>(null);
    const benchRef = useRef<HTMLDivElement>(null);
    const draggedPlayerDetails = team.players.find(p => p.id === draggedPlayer?.id);

    // Effect to manage body scroll during drag operations
    useEffect(() => {
        if (draggedPlayer && isCaptain) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [draggedPlayer, isCaptain]);

    const handleSave = () => {
        if (!isCaptain) return;
        onUpdateTeam({ ...team, formation, tacticsNotes: notes, playerPositions });
    };

    const handleFormationChange = (newFormation: Formation) => {
        if (!isCaptain) return;
        setFormation(newFormation);
        const formationLayout = FORMATIONS.find(f => f.name === newFormation);
        if (formationLayout) {
            const newPositions: { [playerId: string]: { x: number; y: number; pos: string } } = {};
            const playersOnPitch = team.players.filter(p => playerPositions[p.id]);
            const playersOnBench = team.players.filter(p => !playerPositions[p.id]);
            
            const unassignedPlayers = [...playersOnPitch, ...playersOnBench];

            formationLayout.layout.forEach(spot => {
                const player = unassignedPlayers.shift();
                if(player) {
                    newPositions[player.id] = { x: spot.x, y: spot.y, pos: spot.pos };
                }
            });
            setPlayerPositions(newPositions);
        }
    };
    
    const handlePointerDown = (e: React.PointerEvent, playerId: string, origin: 'pitch' | 'bench') => {
        if (!isCaptain) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setDraggedPlayer({ id: playerId, origin });
        setDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggedPlayer || !isCaptain) return;
        setDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!draggedPlayer || !isCaptain) return;
        
        const pitchRect = pitchRef.current?.getBoundingClientRect();
        const benchRect = benchRef.current?.getBoundingClientRect();

        const isOverPitch = pitchRect && e.clientX >= pitchRect.left && e.clientX <= pitchRect.right && e.clientY >= pitchRect.top && e.clientY <= pitchRect.bottom;
        const isOverBench = benchRect && e.clientX >= benchRect.left && e.clientX <= benchRect.right && e.clientY >= benchRect.top && e.clientY <= benchRect.bottom;
        
        if (isOverPitch && pitchRect) {
            let x = ((e.clientX - pitchRect.left) / pitchRect.width) * 100;
            let y = ((e.clientY - pitchRect.top) / pitchRect.height) * 100;
            x = Math.max(6, Math.min(94, x));
            y = Math.max(5, Math.min(90, y));
            
            const existingPosData = playerPositions[draggedPlayer.id];
            const newPositions = { 
                ...playerPositions, 
                [draggedPlayer.id]: { x, y, pos: draggedPlayer.origin === 'pitch' ? existingPosData?.pos : undefined } 
            };
            setPlayerPositions(newPositions);
            setFormation('Custom');
        } else if (isOverBench) {
            if (draggedPlayer.origin === 'pitch') {
                const newPositions = { ...playerPositions };
                delete newPositions[draggedPlayer.id];
                setPlayerPositions(newPositions);
            }
        }

        setDraggedPlayer(null);
        setDragPosition(null);
    };

    const handleAiAnalysisClick = () => {
        setShowAnalysisModal(true);
    };

    const playersOnPitchIds = Object.keys(playerPositions);
    const benchPlayers = team.players.filter(p => !playersOnPitchIds.includes(p.id));

    return (
        <div onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Tácticas y Formaciones</h1>
                {isCaptain && (
                    <button onClick={handleSave} className="bg-[var(--color-primary-600)] text-white font-bold py-2 px-5 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-sm">
                        Guardar Táctica
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="flex-grow bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                        <FormationPitch
                            pitchRef={pitchRef}
                            players={team.players}
                            positions={playerPositions}
                            onPointerDown={(e, playerId) => handlePointerDown(e, playerId, 'pitch')}
                            draggedPlayerId={draggedPlayer?.id}
                            captainId={team.captainId}
                            isDraggable={isCaptain}
                        />
                    </div>
                     <div 
                        ref={benchRef}
                        className="bg-black/20 backdrop-blur-md border border-white/10 p-3 rounded-xl"
                    >
                        <h3 className="text-sm font-bold text-center text-gray-400 mb-2 uppercase tracking-wider">Banquillo</h3>
                        <div className="flex flex-row flex-wrap justify-center items-center gap-3 min-h-[5rem]">
                             {benchPlayers.length > 0 ? (
                                benchPlayers.map(player => (
                                    <DraggablePlayerToken 
                                        key={player.id} 
                                        player={player}
                                        onPointerDown={(e, playerId) => handlePointerDown(e, playerId, 'bench')}
                                        isDragged={draggedPlayer?.id === player.id}
                                        isCaptain={team.captainId === player.id}
                                        isDraggable={isCaptain}
                                    />
                                ))
                            ) : (
                                <p className="text-center text-xs text-gray-400">Todos en la cancha</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-5 rounded-xl">
                        <button onClick={handleAiAnalysisClick} className="w-full font-semibold text-yellow-400 hover:underline text-left flex items-center gap-2 mb-4 p-3 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20">
                            <SparklesIcon className="w-5 h-5" />
                            Consejo del Analista IA
                            <span className="text-xs bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded-full">PREMIUM</span>
                        </button>
                        <label htmlFor="formation-select" className="block text-lg font-bold mb-2">Formación</label>
                        <select
                            id="formation-select"
                            value={formation}
                            onChange={(e) => handleFormationChange(e.target.value as Formation)}
                            disabled={!isCaptain}
                            className="w-full p-2 border rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-gray-700 border-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed"
                        >
                            <option value="Custom">Personalizada</option>
                            {FORMATIONS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                        </select>
                    </div>
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-5 rounded-xl">
                        <label htmlFor="tactics-notes" className="block text-lg font-bold mb-2">Notas Tácticas</label>
                        <textarea
                            id="tactics-notes"
                            rows={8}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            readOnly={!isCaptain}
                            className="w-full p-2 border rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-gray-700 border-gray-600 read-only:bg-gray-800 read-only:cursor-default"
                            placeholder={isCaptain ? "Ej: Presión alta, buscar al delantero, etc." : "El capitán no ha dejado notas."}
                        />
                    </div>
                </div>
            </div>
            {/* Drag Ghost Element */}
            {draggedPlayer && dragPosition && draggedPlayerDetails && isCaptain && (
                <div 
                    className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: dragPosition.x, top: dragPosition.y }}
                >
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex flex-col items-center justify-center shadow-lg text-center p-1 opacity-90 ring-2 ring-[var(--color-primary-500)] border-2 border-gray-400">
                        <span className="font-black text-xl text-orange-400">{draggedPlayerDetails.number || '?'}</span>
                        <span className="text-[9px] font-semibold uppercase text-gray-200 truncate w-full">
                            {draggedPlayerDetails.name.split(' ').pop()}
                        </span>
                    </div>
                </div>
            )}

            {showAnalysisModal && <TacticalAnalysisModal team={team} onClose={() => setShowAnalysisModal(false)} />}
        </div>
    );
};

export default TacticsView;