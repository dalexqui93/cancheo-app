import React, { useState } from 'react';
import type { Player, User } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import StatSlider from '../../components/player_profile/StatSlider';
import { RulerIcon } from '../../components/icons/RulerIcon';
import { WeightScaleIcon } from '../../components/icons/WeightScaleIcon';
import { DumbbellIcon } from '../../components/icons/DumbbellIcon';
import { RunningIcon } from '../../components/icons/RunningIcon';
import { BatteryIcon } from '../../components/icons/BatteryIcon';
import { SparklesIcon } from '../../components/icons/SparklesIcon';
import { SoccerPlayerIcon } from '../../components/icons/SoccerPlayerIcon';
import { ShoeIcon } from '../../components/icons/ShoeIcon';
import { IdentificationIcon } from '../../components/icons/IdentificationIcon';
import { ChevronDownIcon } from '../../components/icons/ChevronDownIcon';


interface PlayerProfileCreatorViewProps {
    onBack: () => void;
    user: User;
    onSave: (updatedProfile: Player) => void;
}

const ProfileAccordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-black/20 rounded-xl transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
                aria-expanded={isOpen}
            >
                <h2 className="text-xl font-bold">{title}</h2>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 pt-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};


const PlayerProfileCreatorView: React.FC<PlayerProfileCreatorViewProps> = ({ onBack, user, onSave }) => {
    const [profile, setProfile] = useState<Player>(user.playerProfile || {
        id: user.id,
        name: user.name,
        position: 'Cualquiera',
        level: 1,
        stats: {
            matchesPlayed: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
        },
        xp: 0,
        achievements: [],
    });

    const updateProfile = (updates: Partial<Player>) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    const SKILLS = [
        'Tiro Potente', 'Regate Rápido', 'Defensa Férrea', 'Visión de Juego', 
        'Resistencia', 'Velocidad', 'Cabeceo', 'Pase Preciso', 'Marcaje', 
        'Portero Ágil', 'Tiros Libres', 'Liderazgo'
    ];
    const toggleSkill = (skill: string) => {
        const currentSkills = profile.specialSkills || [];
        const newSkills = currentSkills.includes(skill)
            ? currentSkills.filter(s => s !== skill)
            : [...currentSkills, skill];
        updateProfile({ specialSkills: newSkills });
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto px-4 py-6 sm:py-8">
                <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-400)] font-semibold mb-6 hover:underline">
                    <ChevronLeftIcon className="h-5 w-5" />
                    Volver a DaviPlay
                </button>

                <h1 className="text-4xl font-black tracking-tight text-center mb-8" style={{textShadow: `0 0 15px var(--color-primary-500)`}}>
                    Edita tu Perfil de Jugador
                </h1>
                
                <div className="max-w-3xl mx-auto space-y-4">
                    <ProfileAccordion title="👤 Datos Personales" defaultOpen>
                        <PersonalInfoPanel profile={profile} onUpdate={updateProfile} />
                    </ProfileAccordion>
                    <ProfileAccordion title="🏋️ Atributos Físicos">
                         <PhysicalInfoPanel profile={profile} onUpdate={updateProfile} />
                    </ProfileAccordion>
                    <ProfileAccordion title="🌟 Habilidades y Posición">
                        <SkillsPanel profile={profile} allSkills={SKILLS} onToggleSkill={toggleSkill} onUpdate={updateProfile} />
                    </ProfileAccordion>
                </div>

                 <div className="mt-12 text-center">
                    <button 
                        onClick={() => onSave(profile)}
                        className="bg-[var(--color-primary-600)] text-white font-bold py-3 px-12 rounded-lg hover:bg-[var(--color-primary-700)] transition-transform transform hover:scale-105 shadow-lg shadow-[var(--color-primary-700)]/30"
                    >
                        Guardar Perfil
                    </button>
                </div>
            </div>
        </div>
    );
};

const PersonalInfoPanel: React.FC<{profile: Player, onUpdate: (updates: Partial<Player>) => void}> = ({ profile, onUpdate }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="font-semibold text-sm">Edad</label>
                <input type="number" value={profile.age || ''} onChange={e => { const val = parseInt(e.target.value); onUpdate({ age: isNaN(val) ? undefined : val }); }} className="w-full bg-black/30 rounded-md p-2 mt-1 border-0 ring-1 ring-white/20 focus:ring-[var(--color-primary-500)]" />
            </div>
            <div>
                <label className="font-semibold text-sm mb-2 block"><ShoeIcon className="w-4 h-4 inline mr-1"/> Pie Dominante</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['Derecho', 'Izquierdo', 'Ambidiestro'] as const).map(foot => (
                        <button key={foot} onClick={() => onUpdate({dominantFoot: foot})} className={`p-2 rounded-lg text-sm font-bold ${profile.dominantFoot === foot ? 'bg-[var(--color-primary-500)]' : 'bg-white/10'}`}>{foot}</button>
                    ))}
                </div>
            </div>
            <div>
                <label className="font-semibold text-sm mb-2 block">Biografía Corta</label>
                <textarea value={profile.bio || ''} onChange={e => onUpdate({bio: e.target.value})} placeholder="Cuéntanos sobre tu estilo de juego..." rows={3} className="w-full bg-black/30 rounded-md p-2 mt-1 border-0 ring-1 ring-white/20 focus:ring-[var(--color-primary-500)] text-sm" />
            </div>
        </div>
    );
};

const PhysicalInfoPanel: React.FC<{profile: Player, onUpdate: (updates: Partial<Player>) => void}> = ({ profile, onUpdate }) => {
    return (
        <div className="space-y-4">
             <div>
                <label className="font-semibold text-sm flex items-center gap-2"><RulerIcon className="w-4 h-4"/> Altura (cm)</label>
                <input type="number" value={profile.height || ''} onChange={e => { const val = parseInt(e.target.value); onUpdate({ height: isNaN(val) ? undefined : val }); }} className="w-full bg-black/30 rounded-md p-2 mt-1 border-0 ring-1 ring-white/20 focus:ring-[var(--color-primary-500)]" />
            </div>
            <div>
                <label className="font-semibold text-sm flex items-center gap-2"><WeightScaleIcon className="w-4 h-4"/> Peso (kg)</label>
                <input type="number" value={profile.weight || ''} onChange={e => { const val = parseInt(e.target.value); onUpdate({ weight: isNaN(val) ? undefined : val }); }} className="w-full bg-black/30 rounded-md p-2 mt-1 border-0 ring-1 ring-white/20 focus:ring-[var(--color-primary-500)]" />
            </div>
            <StatSlider icon={<DumbbellIcon className="w-5 h-5"/>} label="Fuerza" value={profile.strength || 60} onChange={val => onUpdate({strength: val})} />
            <StatSlider icon={<RunningIcon className="w-5 h-5"/>} label="Velocidad" value={profile.speed || 60} onChange={val => onUpdate({speed: val})} />
            <StatSlider icon={<BatteryIcon className="w-5 h-5"/>} label="Resistencia" value={profile.stamina || 60} onChange={val => onUpdate({stamina: val})} />
        </div>
    );
};

const SkillsPanel: React.FC<{profile: Player, allSkills: string[], onToggleSkill: (skill: string) => void, onUpdate: (updates: Partial<Player>) => void}> = ({ profile, allSkills, onToggleSkill, onUpdate }) => {
    const POSITIONS: Player['position'][] = ['Portero', 'Defensa', 'Medio', 'Delantero'];
    return (
        <div className="space-y-4">
            <div>
                <label className="font-semibold mb-2 block flex items-center gap-2"><SoccerPlayerIcon className="w-5 h-5"/> Posición Principal</label>
                <div className="grid grid-cols-2 gap-2">
                    {POSITIONS.map(pos => (
                        <button key={pos} onClick={() => onUpdate({position: pos})} className={`p-2 rounded-lg text-sm font-bold ${profile.position === pos ? 'bg-[var(--color-primary-500)]' : 'bg-white/10'}`}>{pos}</button>
                    ))}
                </div>
            </div>
            <div>
                 <label className="font-semibold mb-2 block flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-[var(--color-primary-400)]"/> Habilidades Especiales</label>
                 <p className="text-xs text-gray-400 mb-3">Selecciona hasta 3 habilidades que te definan.</p>
                 <div className="flex flex-wrap gap-2">
                    {allSkills.map(skill => {
                        const isSelected = profile.specialSkills?.includes(skill);
                        const isDisabled = !isSelected && (profile.specialSkills?.length ?? 0) >= 3;
                        return (
                            <button key={skill} onClick={() => onToggleSkill(skill)} disabled={isDisabled} className={`py-1 px-3 text-sm rounded-full transition-all ${isSelected ? 'bg-[var(--color-primary-500)] text-white' : 'bg-white/10 text-gray-300'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'}`}>
                               {skill}
                            </button>
                        );
                    })}
                 </div>
            </div>
        </div>
    );
};

export default PlayerProfileCreatorView;