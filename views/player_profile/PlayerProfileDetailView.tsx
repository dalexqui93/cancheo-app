import React from 'react';
import type { Player } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { RulerIcon } from '../../components/icons/RulerIcon';
import { WeightScaleIcon } from '../../components/icons/WeightScaleIcon';
import { DumbbellIcon } from '../../components/icons/DumbbellIcon';
import { RunningIcon } from '../../components/icons/RunningIcon';
import { BatteryIcon } from '../../components/icons/BatteryIcon';
import { SparklesIcon } from '../../components/icons/SparklesIcon';
import { ShoeIcon } from '../../components/icons/ShoeIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { UserPlusIcon } from '../../components/icons/UserPlusIcon';

interface PlayerProfileDetailViewProps {
    player: Player;
    onBack: () => void;
    onRecruit?: (player: Player) => void;
}

const StatDisplay: React.FC<{ icon: React.ReactNode; label: string; value: string | number | undefined }> = ({ icon, label, value }) => (
    <div className="bg-black/20 p-4 rounded-lg flex flex-col items-center justify-center text-center">
        <div className="text-gray-400">{icon}</div>
        <p className="text-2xl font-bold mt-1">{value || 'N/A'}</p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
);

const StatBar: React.FC<{ icon: React.ReactNode; label: string; value: number; max?: number }> = ({ icon, label, value, max = 100 }) => {
    const percentage = (value / max) * 100;
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-sm flex items-center gap-2">
                    {icon}
                    {label}
                </label>
                <span className="text-sm font-bold text-[var(--color-primary-400)]">{value}</span>
            </div>
            <div className="relative h-3 bg-black/30 rounded-full overflow-hidden">
                <div 
                    className="absolute top-0 left-0 h-3 rounded-full bg-[var(--color-primary-500)]"
                    style={{ 
                        width: `${percentage}%`,
                        boxShadow: `0 0 8px var(--color-primary-500)`
                    }}
                ></div>
            </div>
        </div>
    );
};

const PlayerProfileDetailView: React.FC<PlayerProfileDetailViewProps> = ({ player, onBack, onRecruit }) => {
    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-500)] font-semibold mb-6 hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver a Buscar Jugadores
            </button>
             <div className="bg-gray-900 text-white rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-[var(--color-primary-700)] via-gray-900 to-gray-900 p-6 text-center relative">
                    <div className="relative inline-block">
                        <div className="w-28 h-28 rounded-full bg-black/30 flex items-center justify-center shadow-md border-4 border-white/20 overflow-hidden mx-auto">
                            {player.profilePicture ? (
                                <img src={player.profilePicture} alt="Foto de perfil" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-16 h-16 text-gray-400" />
                            )}
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mt-4">{player.name}</h1>
                    <p className="text-[var(--color-primary-400)] font-semibold mt-1">{player.position}</p>
                </div>
                
                {/* Body */}
                <div className="p-6 space-y-6">
                     <div className="grid grid-cols-3 gap-4">
                        <StatDisplay icon={<UserIcon className="w-6 h-6"/>} label="Edad" value={player.age} />
                        <StatDisplay icon={<RulerIcon className="w-6 h-6"/>} label="Altura" value={player.height ? `${player.height} cm` : 'N/A'} />
                        <StatDisplay icon={<WeightScaleIcon className="w-6 h-6"/>} label="Peso" value={player.weight ? `${player.weight} kg` : 'N/A'} />
                    </div>

                    <div>
                        <h3 className="font-bold mb-3 text-lg">Atributos</h3>
                        <div className="space-y-4">
                            <StatBar icon={<DumbbellIcon className="w-5 h-5"/>} label="Fuerza" value={player.strength || 0} />
                            <StatBar icon={<RunningIcon className="w-5 h-5"/>} label="Velocidad" value={player.speed || 0} />
                            <StatBar icon={<BatteryIcon className="w-5 h-5"/>} label="Resistencia" value={player.stamina || 0} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg">Información Adicional</h3>
                        <div className="bg-black/20 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <ShoeIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400">Pie Dominante</p>
                                    <p className="font-semibold">{player.dominantFoot || 'No especificado'}</p>
                                </div>
                            </div>
                        </div>
                         {player.bio && (
                            <div className="bg-black/20 p-4 rounded-lg">
                                 <p className="text-xs text-gray-400 mb-1">Biografía</p>
                                 <p className="text-sm text-gray-300 italic">"{player.bio}"</p>
                            </div>
                        )}
                    </div>

                     <div>
                        <h3 className="font-bold mb-3 text-lg flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-[var(--color-primary-400)]"/> Habilidades Especiales</h3>
                        {player.specialSkills && player.specialSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {player.specialSkills.map(skill => (
                                    <span key={skill} className="py-1 px-3 text-sm rounded-full bg-[var(--color-primary-500)]/20 text-[var(--color-primary-300)] font-semibold">
                                       {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No se han especificado habilidades.</p>
                        )}
                    </div>
                </div>

                {onRecruit && (
                    <div className="p-6 border-t border-gray-700 bg-gray-900">
                        <button
                            onClick={() => onRecruit(player)}
                            className="w-full bg-[var(--color-primary-600)] text-white font-bold py-3 px-6 rounded-lg hover:bg-[var(--color-primary-700)] transition-transform transform hover:scale-105 shadow-lg shadow-[var(--color-primary-700)]/30 flex items-center justify-center gap-2"
                        >
                            <UserPlusIcon className="w-6 h-6" />
                            <span>Reclutar Jugador</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerProfileDetailView;