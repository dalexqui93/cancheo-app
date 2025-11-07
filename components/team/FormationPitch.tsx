import React, { RefObject } from 'react';
import type { Player } from '../../types';

interface PlayerMarkerProps {
    player: Player;
    position: { x: number; y: number; pos?: string };
    onPointerDown: (e: React.PointerEvent) => void;
    isDragged: boolean;
    isCaptain: boolean;
}

const getPositionAbbreviation = (player: Player, position: { pos?: string }): string => {
    if (position.pos) return position.pos;
    switch (player.position) {
        case 'Portero': return 'POR';
        case 'Defensa': return 'DEF';
        case 'Medio': return 'MED';
        case 'Delantero': return 'DEL';
        default: return 'JUG';
    }
};

const PlayerMarker: React.FC<PlayerMarkerProps> = ({ player, position, onPointerDown, isDragged, isCaptain }) => {
    const lastName = player.name.split(' ').pop();
    const displayPosition = getPositionAbbreviation(player, position);

    return (
        <div
            onPointerDown={onPointerDown}
            className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center shadow-md touch-none cursor-grab active:cursor-grabbing transition-opacity ${isDragged ? 'opacity-30' : 'opacity-100'}`}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
        >
            <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary-600)] text-white flex items-center justify-center border-2 border-white dark:border-gray-800 select-none">
                    <span className="text-sm font-black">{player.number || '?'}</span>
                </div>
                {isCaptain && (
                    <div title="Capitán" className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-gray-800">C</div>
                )}
            </div>
            <span className="mt-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-semibold rounded select-none">
                {lastName}
            </span>
             <span className="mt-0.5 text-white text-[10px] font-bold uppercase select-none" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                {displayPosition}
            </span>
        </div>
    );
};

interface FormationPitchProps {
    pitchRef: RefObject<HTMLDivElement>;
    players: Player[];
    positions: { [playerId: string]: { x: number; y: number; pos?: string } };
    onPointerDown: (e: React.PointerEvent, playerId: string) => void;
    draggedPlayerId: string | undefined;
    captainId: string;
}

const FormationPitch: React.FC<FormationPitchProps> = ({ pitchRef, players, positions, onPointerDown, draggedPlayerId, captainId }) => {
    return (
        <div className="w-full aspect-[7/10] max-w-lg mx-auto relative select-none">
            {/* Pitch Background */}
            <div 
                ref={pitchRef}
                className="absolute inset-0 bg-green-600 dark:bg-green-800 rounded-lg overflow-hidden border-4 border-white/50"
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25%] aspect-square border-2 border-white/50 rounded-full" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-0.5 bg-white/50" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[18%] border-2 border-white/50 rounded-b-lg border-t-0" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[18%] border-2 border-white/50 rounded-t-lg border-b-0" />
            </div>

            {/* Player Markers */}
            {players.filter(p => positions[p.id]).map(player => {
                return (
                    <PlayerMarker
                        key={player.id}
                        player={player}
                        position={positions[player.id]}
                        onPointerDown={(e) => onPointerDown(e, player.id)}
                        isDragged={draggedPlayerId === player.id}
                        isCaptain={captainId === player.id}
                    />
                );
            })}
        </div>
    );
};

export default FormationPitch;