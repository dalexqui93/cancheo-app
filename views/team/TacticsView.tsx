import React, { useState, useRef, useEffect } from 'react';
import type { Team, Formation, Player } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import FormationPitch from '../../components/team/FormationPitch';

interface TacticsViewProps {
    team: Team;
    onBack: () => void;
    onUpdateTeam: (team: Team) => void;
}

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

const DraggablePlayerToken: React.FC<{ player: Player; onPointerDown: (e: React.PointerEvent, playerId: string) => void; isDragged: boolean; isCaptain: boolean }> = ({ player, onPointerDown, isDragged, isCaptain }) => (
    <div
        onPointerDown={(e) => onPointerDown(e, player.id)}
        className={`relative w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex flex-col items-center justify-center shadow-md text-center p-1 transition-opacity ${isDragged ? 'opacity-40' : 'opacity-100'} touch-none cursor-grab active:cursor-grabbing`}
        title={player.name}
    >
        <span className="font-black text-xl text-orange-500">{player.number || '?'}</span>
        <span className="text-[9px] font-semibold uppercase text-gray-600 dark:text-gray-300 truncate w-full">
            {player.name.split(' ').pop()}
        </span>
        {isCaptain && (
            <div title="Capitán" className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-gray-200">C</div>
        )}
    </div>
);


const TacticsView: React.FC<TacticsViewProps> = ({ team, onBack, onUpdateTeam }) => {
    const [formation, setFormation] = useState<Formation>('Custom');
    const [notes, setNotes] = useState(team.tacticsNotes || '');
    const [playerPositions, setPlayerPositions] = useState<{[playerId: string]: { x: number; y: number; pos?: string }}>(team.playerPositions);
    
    // State for custom drag-and-drop
    const [draggedPlayer, setDraggedPlayer] = useState<{ id: string, origin: 'pitch' | 'bench' } | null>(null);
    const [dragPosition, setDragPosition] = useState<{ x: number, y: number } | null>(null);
    const pitchRef = useRef<HTMLDivElement>(null);
    const benchRef = useRef<HTMLDivElement>(null);
    const draggedPlayerDetails = team.players.find(p => p.id === draggedPlayer?.id);

    // Effect to manage body scroll during drag operations
    useEffect(() => {
        if (draggedPlayer) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        
        // Cleanup function to restore original styles when component unmounts
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [draggedPlayer]);

    const handleSave = () => {
        onUpdateTeam({ ...team, formation, tacticsNotes: notes, playerPositions });
    };

    const handleFormationChange = (newFormation: Formation) => {
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
        } else {
             // When switching to 'Custom', we don't change positions, but we might want to clear specific pos tags
            // For now, we'll just keep the current positions.
        }
    };
    
    const handlePointerDown = (e: React.PointerEvent, playerId: string, origin: 'pitch' | 'bench') => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setDraggedPlayer({ id: playerId, origin });
        setDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggedPlayer) return;
        setDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!draggedPlayer) return;
        
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

    const playersOnPitchIds = Object.keys(playerPositions);
    const benchPlayers = team.players.filter(p => !playersOnPitchIds.includes(p.id));

    return (
        <div onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} className="pb-24 md:pb-4">
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold mb-6 hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver al Panel
            </button>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Tácticas y Formaciones</h1>
                <button onClick={handleSave} className="bg-[var(--color-primary-600)] text-white font-bold py-2 px-5 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-sm">
                    Guardar Táctica
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="flex-grow bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                        <FormationPitch
                            pitchRef={pitchRef}
                            players={team.players}
                            positions={playerPositions}
                            onPointerDown={(e, playerId) => handlePointerDown(e, playerId, 'pitch')}
                            draggedPlayerId={draggedPlayer?.id}
                            captainId={team.captainId}
                        />
                    </div>
                     <div 
                        ref={benchRef}
                        className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border dark:border-gray-700"
                    >
                        <h3 className="text-sm font-bold text-center text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Banquillo</h3>
                        <div className="flex flex-row flex-wrap justify-center items-center gap-3 min-h-[5rem]">
                             {benchPlayers.length > 0 ? (
                                benchPlayers.map(player => (
                                    <DraggablePlayerToken 
                                        key={player.id} 
                                        player={player}
                                        onPointerDown={(e, playerId) => handlePointerDown(e, playerId, 'bench')}
                                        isDragged={draggedPlayer?.id === player.id}
                                        isCaptain={team.captainId === player.id}
                                    />
                                ))
                            ) : (
                                <p className="text-center text-xs text-gray-400">Todos en la cancha</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border dark:border-gray-700">
                        <label htmlFor="formation-select" className="block text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Formación</label>
                        <select
                            id="formation-select"
                            value={formation}
                            onChange={(e) => handleFormationChange(e.target.value as Formation)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700"
                        >
                            <option value="Custom">Personalizada</option>
                            {FORMATIONS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                        </select>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border dark:border-gray-700">
                        <label htmlFor="tactics-notes" className="block text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Notas Tácticas</label>
                        <textarea
                            id="tactics-notes"
                            rows={8}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700"
                            placeholder="Ej: Presión alta, buscar al delantero, etc."
                        />
                    </div>
                </div>
            </div>
            {/* Drag Ghost Element */}
            {draggedPlayer && dragPosition && draggedPlayerDetails && (
                <div 
                    className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: dragPosition.x, top: dragPosition.y }}
                >
                    <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex flex-col items-center justify-center shadow-lg text-center p-1 opacity-90 ring-2 ring-[var(--color-primary-500)]">
                        <span className="font-black text-xl text-orange-500">{draggedPlayerDetails.number || '?'}</span>
                        <span className="text-[9px] font-semibold uppercase text-gray-700 dark:text-gray-200 truncate w-full">
                            {draggedPlayerDetails.name.split(' ').pop()}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TacticsView;