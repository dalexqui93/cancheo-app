import React, { useState, useMemo } from 'react';
import type { User, Player, WeatherData, ConfirmedBooking, Notification } from '../types';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import { UserIcon } from '../components/icons/UserIcon';
import StarRating from '../components/StarRating';
import { calculateDistance } from '../utils/geolocation';
import { SpinnerIcon } from '../components/icons/SpinnerIcon';
import { XIcon } from '../components/icons/XIcon';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { ChatBubbleBottomCenterTextIcon } from '../components/icons/ChatBubbleBottomCenterTextIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { GoogleGenAI } from '@google/genai';
import * as db from '../database';

const levelToRating = (level: Player['level']): number => {
    if (typeof level === 'number') return level;
    switch (level) {
        case 'Casual': return 2;
        case 'Intermedio': return 3.5;
        case 'Competitivo': return 5;
        default: return 0;
    }
};

interface AvailableTodayViewProps {
    user: User;
    allUsers: User[];
    weatherData: WeatherData | null;
    allBookings: ConfirmedBooking[];
    onBack: () => void;
    onSetAvailability: (isAvailable: boolean, note?: string) => Promise<void>;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
    onViewProfile: (player: Player) => void;
}

const AiMatchmakerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    availablePlayers: Player[];
}> = ({ isOpen, onClose, availablePlayers }) => {
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateMatch = async () => {
        setIsLoading(true);
        try {
            const playersInfo = availablePlayers.map(p => 
                `- ${p.name}: Posición ${p.position}, Nivel ${p.level}, Velocidad ${p.speed}, Fuerza ${p.strength}`
            ).join('\n');

            const prompt = `Actúa como un coordinador técnico de fútbol. Tengo estos jugadores disponibles para un partido hoy:\n${playersInfo}\n\nDivide a estos jugadores en dos equipos (Equipo A y Equipo B) que sean lo más equilibrados posible. Explica brevemente por qué los dividiste así y cuál sería la clave táctica del partido. Responde en español con un tono profesional y motivador.`;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            setResult(response.text);
        } catch (error) {
            console.error(error);
            setResult("No pudimos conectar con el DT Virtual. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="bg-bgSurface-light dark:bg-bgSurface-dark rounded-[40px] shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[85vh] overflow-hidden border border-borderDefault-light dark:border-borderDefault-dark" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-borderDefault-light dark:border-borderDefault-dark flex justify-between items-center bg-gradient-to-r from-brand/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand/20 flex items-center justify-center text-brand">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">Matchmaker IA</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"><XIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="p-8 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <SpinnerIcon className="w-12 h-12 text-brand mb-4" />
                            <p className="font-bold text-textMain-light dark:text-textMain-dark">Analizando perfiles y equilibrando balanza...</p>
                        </div>
                    ) : result ? (
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{result}</p>
                        </div>
                    ) : (
                        <div className="text-center space-y-4">
                            <p className="text-textMuted-light dark:text-textMuted-dark">Nuestro algoritmo analizará a los <strong>{availablePlayers.length}</strong> jugadores activos para crear el partido más justo.</p>
                            <button 
                                onClick={generateMatch}
                                className="bg-brand text-white font-black py-4 px-8 rounded-2xl shadow-button hover:opacity-90 transition-all uppercase tracking-widest text-xs"
                            >
                                Generar Alineaciones
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PlayerAvailableCard: React.FC<{
    player: Player;
    distance: number | null;
    onInvite: (player: Player) => void;
    onInviteToMatch: (player: Player) => void;
    onViewProfile: (player: Player) => void;
}> = ({ player, distance, onInvite, onInviteToMatch, onViewProfile }) => (
    <div className="bg-bgSurface-light dark:bg-bgSurface-dark border border-borderDefault-light dark:border-borderDefault-dark p-6 rounded-[32px] flex flex-col h-full shadow-premium-light dark:shadow-premium-dark relative overflow-hidden group">
        <div className="flex items-center gap-5 relative z-10">
            <div 
                onClick={() => onViewProfile(player)}
                className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-borderDefault-light dark:border-borderDefault-dark overflow-hidden flex-shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-sm"
            >
                {player.profilePicture ? <img src={player.profilePicture} alt={player.name} className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-textDisabled-light"/>}
            </div>
            <div className="flex-grow min-w-0">
                <button onClick={() => onViewProfile(player)} className="font-black text-lg text-textMain-light dark:text-textMain-dark text-left hover:text-brand transition-colors uppercase italic tracking-tighter">
                    {player.name}
                </button>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-black bg-brand/10 text-brand px-2 py-0.5 rounded-lg uppercase tracking-widest">{player.position}</span>
                    <span className="text-[10px] font-bold text-textMuted-light dark:text-textMuted-dark uppercase">{typeof player.level === 'number' ? `Nivel ${player.level}` : player.level}</span>
                </div>
                {distance !== null && (
                     <p className="text-[10px] text-textMuted-light dark:text-textMuted-dark flex items-center gap-1 mt-1.5 font-bold uppercase tracking-widest">
                        <LocationIcon className="w-3 h-3 text-brand"/> a {distance.toFixed(1)} km
                    </p>
                )}
            </div>
        </div>
        
        {player.availabilityNote && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl flex items-start gap-3 text-xs text-textMuted-light dark:text-textMuted-dark italic border border-borderDefault-light dark:border-borderDefault-dark relative z-10">
                <ChatBubbleBottomCenterTextIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand/50" />
                <p>"{player.availabilityNote}"</p>
            </div>
        )}
        
        <div className="mt-6 flex gap-2 relative z-10">
            <button onClick={() => onInvite(player)} className="flex-1 py-3 px-4 rounded-xl font-black bg-gray-100 dark:bg-gray-800 text-textMain-light dark:text-textMain-dark text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-borderDefault-light dark:border-borderDefault-dark">Chat</button>
            <button onClick={() => onInviteToMatch(player)} className="flex-1 py-3 px-4 rounded-xl font-black bg-brand text-white text-[10px] uppercase tracking-widest shadow-button transition-all active:scale-95">Invitar</button>
        </div>

        {/* Marca de agua decorativa */}
        <UserIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-50 dark:text-gray-900/20 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
    </div>
);

const AvailableTodayView: React.FC<AvailableTodayViewProps> = ({ user, allUsers, weatherData, allBookings, onBack, onSetAvailability, addNotification, onViewProfile }) => {
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [isMatchmakerOpen, setIsMatchmakerOpen] = useState(false);
    const [availabilityNote, setAvailabilityNote] = useState(user.playerProfile?.availabilityNote || '');

    const handleAvailabilityChange = (isAvailable: boolean) => {
        setIsLoadingAvailability(true);
        onSetAvailability(isAvailable, isAvailable ? availabilityNote : '')
            .finally(() => setIsLoadingAvailability(false));
    };

    const availablePlayers = useMemo(() => {
        const players = allUsers
            .filter(u => u.playerProfile && u.playerProfile.isAvailableToday && u.id !== user.id)
            .map(u => u.playerProfile!);
        
        if (weatherData) {
            return players.map(p => {
                const distance = p.lastKnownLocation ? calculateDistance(weatherData.latitude, weatherData.longitude, p.lastKnownLocation.latitude, p.lastKnownLocation.longitude) : null;
                return { player: p, distance };
            }).sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        }
        return players.map(p => ({ player: p, distance: null }));
    }, [allUsers, user.id, weatherData]);

    const handleInvite = async (player: Player) => {
        addNotification({type: 'success', title: 'Invitación Enviada', message: `Has invitado a ${player.name} a jugar.`});
    };

    return (
        <div className="space-y-8 animate-ios pb-32">
            <div className="px-1">
                <button onClick={onBack} className="flex items-center gap-2 text-textMuted-light dark:text-textMuted-dark font-black text-[10px] uppercase tracking-[0.2em] mb-4 hover:text-brand transition-colors">
                    <ChevronLeftIcon className="h-4 w-4" />
                    DaviPlay
                </button>
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-textMuted-light dark:text-textMuted-dark text-sm font-medium">Jugadores activos hoy</p>
                        <h1 className="text-4xl font-black tracking-tighter text-textMain-light dark:text-textMain-dark uppercase italic">Disponibles</h1>
                    </div>
                    {availablePlayers.length >= 2 && (
                        <button 
                            onClick={() => setIsMatchmakerOpen(true)}
                            className="bg-gray-900 dark:bg-brand text-white p-4 rounded-2xl shadow-xl active:scale-90 transition-all flex items-center gap-2"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">IA Match</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="mx-1 bg-bgSurface-light dark:bg-bgSurface-dark border border-borderDefault-light dark:border-borderDefault-dark rounded-[40px] p-8 shadow-premium-light dark:shadow-premium-dark relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-md">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-textMain-light dark:text-textMain-dark">¿Sales a jugar hoy?</h3>
                        <p className="text-sm font-medium text-textMuted-light dark:text-textMuted-dark mt-1">Actívate para aparecer en la lista y recibir invitaciones de otros equipos.</p>
                    </div>
                     <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-3xl border border-borderDefault-light dark:border-borderDefault-dark">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${user.playerProfile?.isAvailableToday ? 'text-brand' : 'text-textDisabled-light'}`}>
                            {user.playerProfile?.isAvailableToday ? 'DISPONIBLE' : 'INACTIVO'}
                        </span>
                        <button
                            type="button"
                            className={`${user.playerProfile?.isAvailableToday ? 'bg-brand' : 'bg-gray-300 dark:bg-gray-700'} relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-4 border-transparent transition-colors duration-200 ease-in-out`}
                            onClick={() => handleAvailabilityChange(!user.playerProfile?.isAvailableToday)}
                        >
                            <span className={`${user.playerProfile?.isAvailableToday ? 'translate-x-6' : 'translate-x-0'} inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out`}/>
                        </button>
                    </div>
                </div>
                {user.playerProfile?.isAvailableToday && (
                    <div className="mt-6 animate-slide-in-up">
                        <textarea
                            value={availabilityNote}
                            onChange={e => setAvailabilityNote(e.target.value)}
                            onBlur={() => onSetAvailability(true, availabilityNote)}
                            placeholder="Escribe algo para convencer a los equipos..."
                            className="w-full bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-4 border border-borderDefault-light dark:border-borderDefault-dark text-sm focus:ring-2 focus:ring-brand/20 transition-all outline-none"
                            maxLength={100}
                            rows={2}
                        />
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1">
                {availablePlayers.map(({ player, distance }) => (
                    <PlayerAvailableCard 
                        key={player.id}
                        player={player}
                        distance={distance}
                        onInvite={handleInvite}
                        onInviteToMatch={() => {}}
                        onViewProfile={onViewProfile}
                    />
                ))}
            </div>

            {availablePlayers.length === 0 && (
                 <div className="text-center py-24 px-6 bg-bgSurface-light/50 dark:bg-bgSurface-dark/30 rounded-[40px] border-2 border-dashed border-borderDefault-light dark:border-borderDefault-dark mx-1">
                    <UserIcon className="mx-auto h-20 w-20 text-textDisabled-light opacity-30 mb-6" />
                    <h2 className="text-2xl font-black text-textMain-light dark:text-textMain-dark italic uppercase tracking-tighter">Sin Jugadores</h2>
                    <p className="text-textMuted-light dark:text-textMuted-dark mt-2 font-medium">Nadie se ha activado hoy todavía. ¡Sé el primero!</p>
                </div>
            )}
            
            <AiMatchmakerModal 
                isOpen={isMatchmakerOpen}
                onClose={() => setIsMatchmakerOpen(false)}
                availablePlayers={availablePlayers.map(a => a.player)}
            />
        </div>
    );
};

export default AvailableTodayView;