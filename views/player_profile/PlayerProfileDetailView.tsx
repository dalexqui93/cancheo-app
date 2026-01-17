import React, { useState } from 'react';
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
import { MedalIcon } from '../../components/icons/MedalIcon';
import { GoogleGenAI } from '@google/genai';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';
import { XIcon } from '../../components/icons/XIcon';

interface PlayerProfileDetailViewProps {
    player: Player;
    onBack: () => void;
    onRecruit?: (player: Player) => void;
}

const ScoutReportModal: React.FC<{ player: Player; onClose: () => void }> = ({ player, onClose }) => {
    const [report, setReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const generateReport = async () => {
            try {
                const stats = `Posición: ${player.position}, Nivel: ${player.level}, Fuerza: ${player.strength}, Velocidad: ${player.speed}, Resistencia: ${player.stamina}, Pie: ${player.dominantFoot}, Goles: ${player.stats.goals}, Asistencias: ${player.stats.assists}`;
                const prompt = `Genera un "Scout Report" profesional para el jugador amateur "${player.name}". Sus estadísticas son: ${stats}. Define su Arquetipo de jugador (ej: 'El Muro', 'Falso 9', 'Motor del equipo'), analiza sus fortalezas basadas en sus números y menciona una debilidad técnica que debería trabajar. Sé directo, usa términos futbolísticos y mantén un estilo premium.`;

                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt
                });
                setReport(response.text);
            } catch (error) {
                setReport("Error al generar el informe. Cuota de IA excedida.");
            } finally {
                setIsLoading(false);
            }
        };
        generateReport();
    }, [player]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-bgSurface-light dark:bg-bgSurface-dark rounded-[40px] shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] border border-brand/30 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 bg-gradient-to-r from-brand to-emerald-600 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-6 h-6" />
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">AI Scout Report</h3>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/20 rounded-full"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="p-8 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <SpinnerIcon className="w-12 h-12 text-brand mb-4" />
                            <p className="font-bold">Analizando historial y atributos...</p>
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed italic">{report}</p>
                        </div>
                    )}
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-borderDefault-light dark:border-borderDefault-dark text-center">
                    <p className="text-[10px] font-black text-textMuted-light uppercase tracking-widest">Análisis generado por Cancheo IA</p>
                </div>
            </div>
        </div>
    );
};

const StatDisplay: React.FC<{ icon: React.ReactNode; label: string; value: string | number | undefined }> = ({ icon, label, value }) => (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-3xl flex flex-col items-center justify-center text-center border border-borderDefault-light dark:border-borderDefault-dark">
        <div className="text-brand/60">{icon}</div>
        <p className="text-xl font-black mt-2 text-textMain-light dark:text-textMain-dark italic">{value || 'N/A'}</p>
        <p className="text-[9px] font-black text-textMuted-light uppercase tracking-widest mt-1">{label}</p>
    </div>
);

const StatBar: React.FC<{ icon: React.ReactNode; label: string; value: number; max?: number }> = ({ icon, label, value, max = 100 }) => {
    const percentage = (value / max) * 100;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-textMain-light dark:text-textMain-dark uppercase tracking-widest flex items-center gap-2">
                    {icon}
                    {label}
                </label>
                <span className="text-xs font-black text-brand italic">{value}</span>
            </div>
            <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className="absolute top-0 left-0 h-full bg-brand rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(29,185,84,0.4)]"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const PlayerProfileDetailView: React.FC<PlayerProfileDetailViewProps> = ({ player, onBack, onRecruit }) => {
    const [isScoutModalOpen, setIsScoutModalOpen] = useState(false);

    return (
        <div className="animate-ios pb-32 space-y-6">
            <div className="px-1 flex justify-between items-center">
                <button onClick={onBack} className="flex items-center gap-2 text-textMuted-light dark:text-textMuted-dark font-black text-[10px] uppercase tracking-[0.2em] hover:text-brand transition-colors">
                    <ChevronLeftIcon className="h-4 w-4" />
                    Volver
                </button>
                <button 
                    onClick={() => setIsScoutModalOpen(true)}
                    className="flex items-center gap-2 bg-gray-900 dark:bg-bgSurface-dark text-white px-4 py-2 rounded-xl shadow-lg active:scale-95 transition-all"
                >
                    <SparklesIcon className="w-4 h-4 text-brand" />
                    <span className="text-[9px] font-black uppercase tracking-widest">IA Scout</span>
                </button>
            </div>

            {/* Profile Header Card */}
            <div className="bg-bgSurface-light dark:bg-bgSurface-dark border border-borderDefault-light dark:border-borderDefault-dark rounded-[40px] overflow-hidden shadow-premium-light dark:shadow-premium-dark">
                <div className="bg-gradient-to-br from-gray-900 to-black p-8 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-28 h-28 rounded-[32px] bg-gray-800 border-4 border-white/10 overflow-hidden mx-auto shadow-2xl transition-transform hover:scale-105">
                            {player.profilePicture ? (
                                <img src={player.profilePicture} alt={player.name} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-16 h-16 text-gray-600 m-6" />
                            )}
                        </div>
                        <h1 className="text-3xl font-black text-white mt-5 italic uppercase tracking-tighter leading-none">{player.name}</h1>
                        <p className="text-[10px] font-black text-brand uppercase tracking-[0.3em] mt-3">{player.position} · {player.level}</p>
                    </div>
                    {/* Elementos decorativos */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                </div>
                
                <div className="p-8 space-y-10">
                     <div className="grid grid-cols-3 gap-4">
                        <StatDisplay icon={<UserIcon className="w-5 h-5"/>} label="Edad" value={player.age} />
                        <StatDisplay icon={<RulerIcon className="w-5 h-5"/>} label="Altura" value={player.height ? `${player.height}cm` : 'N/A'} />
                        <StatDisplay icon={<WeightScaleIcon className="w-5 h-5"/>} label="Peso" value={player.weight ? `${player.weight}kg` : 'N/A'} />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-textMain-light dark:text-textMain-dark uppercase tracking-[0.2em] italic ml-1">Atributos Físicos</h3>
                        <div className="space-y-5">
                            <StatBar icon={<DumbbellIcon className="w-4 h-4"/>} label="Fuerza" value={player.strength || 0} />
                            <StatBar icon={<RunningIcon className="w-4 h-4"/>} label="Velocidad" value={player.speed || 0} />
                            <StatBar icon={<BatteryIcon className="w-4 h-4"/>} label="Resistencia" value={player.stamina || 0} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-textMain-light dark:text-textMain-dark uppercase tracking-[0.2em] italic ml-1">Info. Técnica</h3>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-3xl border border-borderDefault-light dark:border-borderDefault-dark flex items-center gap-4">
                                <ShoeIcon className="w-6 h-6 text-brand" />
                                <div>
                                    <p className="text-[9px] font-black text-textMuted-light uppercase tracking-widest">Pie Dominante</p>
                                    <p className="font-black text-textMain-light dark:text-textMain-dark uppercase italic tracking-tighter">{player.dominantFoot || 'No especificado'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-textMain-light dark:text-textMain-dark uppercase tracking-[0.2em] italic ml-1">Habilidades Especiales</h3>
                            <div className="flex flex-wrap gap-2">
                                {player.specialSkills?.map(skill => (
                                    <span key={skill} className="px-3 py-2 bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest rounded-xl border border-brand/20">{skill}</span>
                                )) || <p className="text-xs text-textDisabled-light">Sin habilidades registradas</p>}
                            </div>
                        </div>
                    </div>

                    {player.bio && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-textMain-light dark:text-textMain-dark uppercase tracking-[0.2em] italic ml-1">Biografía</h3>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[32px] border border-borderDefault-light dark:border-borderDefault-dark">
                                <p className="text-sm text-textMuted-light dark:text-textMuted-dark font-medium leading-relaxed italic">"{player.bio}"</p>
                            </div>
                        </div>
                    )}
                </div>

                {onRecruit && (
                    <div className="p-8 border-t border-borderDefault-light dark:border-borderDefault-dark">
                        <button
                            onClick={() => onRecruit(player)}
                            className="w-full bg-brand text-white font-black py-5 px-8 rounded-3xl shadow-button hover:opacity-90 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 active:scale-95"
                        >
                            <UserPlusIcon className="w-5 h-5" />
                            Reclutar Jugador
                        </button>
                    </div>
                )}
            </div>

            {isScoutModalOpen && <ScoutReportModal player={player} onClose={() => setIsScoutModalOpen(false)} />}
        </div>
    );
};

export default PlayerProfileDetailView;