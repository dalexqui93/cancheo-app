import React, { useState, useMemo } from 'react';
import type { User, Player, WeatherData, ConfirmedBooking, Notification } from '../types';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import { UserIcon } from '../components/icons/UserIcon';
import StarRating from '../components/StarRating';
import { calculateDistance } from '../utils/geolocation';
import { SpinnerIcon } from '../components/icons/SpinnerIcon';
import { XIcon } from '../components/icons/XIcon';
import { timeSince } from '../utils/timeSince';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { ChatBubbleBottomCenterTextIcon } from '../components/icons/ChatBubbleBottomCenterTextIcon';
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

const InviteToMatchModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    player: Player;
    userBookings: ConfirmedBooking[];
    onSendInvite: (booking: ConfirmedBooking) => void;
}> = ({ isOpen, onClose, player, userBookings, onSendInvite }) => {
    if (!isOpen) return null;

    const upcomingBookings = userBookings.filter(b => {
        const bookingTime = new Date(b.date);
        const [h, m] = b.time.split(':');
        bookingTime.setHours(parseInt(h), parseInt(m));
        return bookingTime > new Date() && b.status === 'confirmed';
    }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Invitar a Partido</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <p className="text-sm text-gray-400 mb-4">Selecciona uno de tus próximos partidos para invitar a <span className="font-bold">{player.name}</span>.</p>
                    <div className="space-y-3">
                        {upcomingBookings.length > 0 ? upcomingBookings.map(booking => (
                            <button key={booking.id} onClick={() => onSendInvite(booking)} className="w-full text-left p-3 bg-black/20 rounded-lg hover:bg-white/20 transition-colors">
                                <p className="font-semibold">{booking.field.name}</p>
                                <div className="text-xs text-gray-400 flex items-center gap-4 mt-1">
                                    <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> {new Date(booking.date).toLocaleDateString('es-CO', {weekday: 'short', month: 'long', day: 'numeric'})}</span>
                                    <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3"/> {booking.time}</span>
                                </div>
                            </button>
                        )) : (
                            <p className="text-center text-gray-400 py-8">No tienes partidos próximos reservados.</p>
                        )}
                    </div>
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
    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-xl flex flex-col h-full">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-black/30 flex items-center justify-center shadow-md border-2 border-white/20 overflow-hidden flex-shrink-0">
                {player.profilePicture ? <img src={player.profilePicture} alt={player.name} className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-gray-400"/>}
            </div>
            <div className="flex-grow min-w-0">
                <button onClick={() => onViewProfile(player)} className="font-bold text-lg text-white text-left hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 rounded-sm">
                    {player.name}
                </button>
                <p className="text-sm text-gray-400">{player.position}</p>
                <div className="mt-1 flex items-center gap-2">
                    <StarRating rating={levelToRating(player.level)} />
                    <span className="text-xs text-gray-400">{typeof player.level === 'number' ? `Nvl ${player.level}` : player.level}</span>
                </div>
                {distance !== null && (
                     <p className="text-xs text-gray-300 flex items-center gap-1 mt-1 font-semibold">
                        <LocationIcon className="w-3 h-3 text-amber-400"/> {distance.toFixed(1)} km de ti
                    </p>
                )}
            </div>
        </div>
        {player.availabilityNote && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-start gap-2 text-sm text-gray-300 italic">
                <ChatBubbleBottomCenterTextIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-400" />
                <p>"{player.availabilityNote}"</p>
            </div>
        )}
        <div className="mt-4 pt-4 border-t border-white/20 flex-grow flex items-end gap-3">
            <button onClick={() => onInvite(player)} className="w-full py-2 px-4 rounded-lg font-semibold bg-white/10 hover:bg-white/20 text-sm">Invitar a Jugar</button>
            <button onClick={() => onInviteToMatch(player)} className="w-full py-2 px-4 rounded-lg font-semibold bg-amber-600 text-white hover:bg-amber-700 shadow-sm text-sm">Invitar a Partido</button>
        </div>
    </div>
);

const AvailableTodayView: React.FC<AvailableTodayViewProps> = ({ user, allUsers, weatherData, allBookings, onBack, onSetAvailability, addNotification, onViewProfile }) => {
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [playerToInvite, setPlayerToInvite] = useState<Player | null>(null);
    const [availabilityNote, setAvailabilityNote] = useState(user.playerProfile?.availabilityNote || '');

    const handleSaveNote = () => {
        if (!user.playerProfile?.isAvailableToday) return;
        onSetAvailability(true, availabilityNote);
    };

    const handleAvailabilityChange = (isAvailable: boolean) => {
        setIsLoadingAvailability(true);
        const noteToSend = isAvailable ? availabilityNote : '';
        onSetAvailability(isAvailable, noteToSend)
            .then(() => {
                if (!isAvailable) {
                    setAvailabilityNote('');
                }
            })
            .catch(() => {})
            .finally(() => {
                setIsLoadingAvailability(false);
            });
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
        const targetUser = allUsers.find(u => u.id === player.id);
        if (targetUser) {
            const newNotification: Notification = {
                id: Date.now(),
                type: 'info',
                title: '¡Te han invitado a jugar!',
                message: `${user.name} vio que estás disponible y quiere organizar un partido.`,
                timestamp: new Date(),
                read: false,
            };
            const updatedNotifications = [newNotification, ...(targetUser.notifications || [])].slice(0, 50);
            try {
                await db.updateUser(targetUser.id, { notifications: updatedNotifications });
            } catch (error) {
                console.error("Failed to send notification:", String(error));
            }
        }
        addNotification({type: 'success', title: 'Invitación Enviada', message: `Has invitado a ${player.name} a jugar.`});
    };

    const handleInviteToMatch = (player: Player) => {
        setPlayerToInvite(player);
        setIsInviteModalOpen(true);
    };

    const handleSendSpecificInvite = async (booking: ConfirmedBooking) => {
        if (!playerToInvite) return;
        
        const targetUser = allUsers.find(u => u.id === playerToInvite.id);
        if (targetUser) {
            const newNotification: Notification = {
                id: Date.now(),
                type: 'success',
                title: '¡Invitación a un partido!',
                message: `${user.name} te ha invitado a su partido en ${booking.field.name} a las ${booking.time}.`,
                timestamp: new Date(),
                read: false,
            };
            const updatedNotifications = [newNotification, ...(targetUser.notifications || [])].slice(0, 50);
            try {
                await db.updateUser(targetUser.id, { notifications: updatedNotifications });
            } catch (error) {
                console.error("Failed to send notification:", String(error));
            }
        }

        addNotification({type: 'success', title: 'Invitación a Partido Enviada', message: `Invitaste a ${playerToInvite.name} a tu partido en ${booking.field.name}.`});
        setIsInviteModalOpen(false);
        setPlayerToInvite(null);
    };

    return (
        <div className="p-4 sm:p-6 pb-[6.5rem]">
            <button onClick={onBack} className="flex items-center gap-2 text-amber-400 font-semibold mb-6 hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver a DaviPlay
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-6">Disponibles Hoy</h1>
            <p className="mt-2 text-base text-gray-400">Actívate para que otros te inviten o busca jugadores listos para un partido.</p>

            <div className="my-6 bg-black/20 backdrop-blur-md border border-amber-500/50 rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex-grow">
                        <h3 className="font-bold text-lg">¿Listo para jugar hoy?</h3>
                        <p className="text-xs text-gray-300">Activa tu disponibilidad para aparecer en esta lista.</p>
                    </div>
                     <div className="flex items-center gap-3">
                        {isLoadingAvailability && <SpinnerIcon className="w-6 h-6 text-amber-400"/>}
                        <button
                            type="button"
                            className={`${
                                user.playerProfile?.isAvailableToday ? 'bg-green-500' : 'bg-gray-600'
                            } relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
                            role="switch"
                            aria-checked={user.playerProfile?.isAvailableToday}
                            onClick={() => handleAvailabilityChange(!user.playerProfile?.isAvailableToday)}
                            disabled={isLoadingAvailability}
                        >
                            <span className={`${
                                user.playerProfile?.isAvailableToday ? 'translate-x-5' : 'translate-x-0'
                            } pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
                        </button>
                    </div>
                </div>
                {user.playerProfile?.isAvailableToday && (
                    <div className="mt-4 pt-4 border-t border-white/20 animate-fade-in">
                        <label htmlFor="availability-note" className="block text-sm font-semibold text-gray-300 mb-2">
                            Añade una nota pública (opcional):
                        </label>
                        <textarea
                            id="availability-note"
                            value={availabilityNote}
                            onChange={e => setAvailabilityNote(e.target.value)}
                            onBlur={handleSaveNote}
                            placeholder="Ej: Busco un partido de 7v7, soy delantero."
                            maxLength={140}
                            rows={2}
                            className="w-full bg-black/30 rounded-md p-2 border-0 ring-1 ring-white/20 focus:ring-amber-500 text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">{availabilityNote.length}/140</p>
                    </div>
                )}
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight text-white mt-8 mb-4">Jugadores Disponibles</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePlayers.map(({ player, distance }) => (
                    <PlayerAvailableCard 
                        key={player.id}
                        player={player}
                        distance={distance}
                        onInvite={handleInvite}
                        onInviteToMatch={handleInviteToMatch}
                        onViewProfile={onViewProfile}
                    />
                ))}
            </div>
            {availablePlayers.length === 0 && (
                 <div className="text-center py-20 px-6 bg-black/20 rounded-2xl">
                    <UserIcon className="mx-auto h-16 w-16 text-gray-500" />
                    <h2 className="mt-4 text-2xl font-bold tracking-tight">Nadie disponible por ahora</h2>
                    <p className="mt-2 text-base text-gray-400 max-w-md mx-auto">
                        Activa tu disponibilidad o vuelve más tarde para encontrar jugadores.
                    </p>
                </div>
            )}
            
            {playerToInvite && (
                <InviteToMatchModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    player={playerToInvite}
                    userBookings={allBookings.filter(b => b.userId === user.id)}
                    onSendInvite={handleSendSpecificInvite}
                />
            )}
        </div>
    );
};

export default AvailableTodayView;