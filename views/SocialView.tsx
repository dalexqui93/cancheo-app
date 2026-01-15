import React, { useState, useMemo } from 'react';
import type { User, Team, Player, Tournament, Notification, WeatherData, ConfirmedBooking, SocialSection, Invitation } from '../types';
import { View } from '../types';
import { ShieldIcon } from '../components/icons/ShieldIcon';
import { SoccerBallIcon } from '../components/icons/SoccerBallIcon';
import { TrophyIcon } from '../components/icons/TrophyIcon';
import { ForumIcon } from '../components/icons/ForumIcon';
import { SwordsAndBallIcon } from '../components/icons/SwordsAndBallIcon';
import { UserPlusIcon } from '../components/icons/UserPlusIcon';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { CalendarDaysIcon } from '../components/icons/CalendarDaysIcon';
import { FireIcon } from '../components/icons/FireIcon';
import { MedalIcon } from '../components/icons/MedalIcon';
import { UserIcon } from '../components/icons/UserIcon';
import { DumbbellIcon } from '../components/icons/DumbbellIcon';
import { RunningIcon } from '../components/icons/RunningIcon';
import { BatteryIcon } from '../components/icons/BatteryIcon';
import MyTeamDashboard from './team/MyTeamDashboard';
import SportsForumView from './forum/SportsForumView';
import AvailableTodayView from './AvailableTodayView';
import PlayerProfileDetailView from './player_profile/PlayerProfileDetailView';
import TeamChatView from './team/TeamChatView';

interface SocialViewProps {
    user: User;
    allTeams: Team[];
    allUsers: User[];
    allBookings: ConfirmedBooking[];
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
    onNavigate: (view: View) => void;
    setIsPremiumModalOpen: (isOpen: boolean) => void;
    section: SocialSection;
    setSection: (section: SocialSection) => void;
    onUpdateUserTeams: (teamIds: string[]) => Promise<void>;
    onUpdateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
    sentInvitations: Invitation[];
    onSendInvitation: (team: Team, player: Player) => void;
    onCancelInvitation: (invitationId: string) => void;
    onRemovePlayerFromTeam: (teamId: string, playerId: string) => void;
    onLeaveTeam: (teamId: string) => void;
    weatherData: WeatherData | null;
    onSetAvailability: (isAvailable: boolean, note?: string) => Promise<void>;
}

const HubWidget: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
    <div className={`bg-bgSurface-light/80 dark:bg-bgSurface-dark/40 backdrop-blur-md border border-borderDefault-light dark:border-borderDefault-dark rounded-3xl p-5 shadow-premium-light dark:shadow-premium-dark ${className}`}>
        <div className="flex items-center gap-3 mb-4">
            <div className="text-amber-500 dark:text-amber-400">{icon}</div>
            <h3 className="font-bold text-textMain-light dark:text-textMain-dark uppercase text-xs tracking-widest">{title}</h3>
        </div>
        <div>{children}</div>
    </div>
);

const PlayerCard: React.FC<{ player: Player; onEdit: () => void }> = ({ player, onEdit }) => {
    const xpPercentage = ((player.xp || 0) / 1000) * 100;
    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-5xl p-8 relative overflow-hidden shadow-2xl group animate-ios">
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Nivel {player.level}</p>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">{player.name}</h2>
                        <span className="inline-block bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase">{player.position}</span>
                    </div>
                    <div className="w-20 h-20 rounded-3xl bg-white/10 border-2 border-white/20 overflow-hidden shadow-2xl">
                        {player.profilePicture ? (
                            <img src={player.profilePicture} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white/50">
                                <UserIcon className="w-10 h-10" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 space-y-2">
                    <div className="flex justify-between text-[10px] font-black tracking-widest opacity-60">
                        <span>XP PROGRESO</span>
                        <span>{player.xp || 0} / 1000</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-1000" style={{ width: `${xpPercentage}%` }}></div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="text-center bg-white/5 p-3 rounded-2xl border border-white/5">
                        <DumbbellIcon className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                        <p className="text-lg font-black">{player.strength || 0}</p>
                        <p className="text-[8px] font-bold opacity-50 uppercase">Fuerza</p>
                    </div>
                    <div className="text-center bg-white/5 p-3 rounded-2xl border border-white/5">
                        <RunningIcon className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                        <p className="text-lg font-black">{player.speed || 0}</p>
                        <p className="text-[8px] font-bold opacity-50 uppercase">Velocidad</p>
                    </div>
                    <div className="text-center bg-white/5 p-3 rounded-2xl border border-white/5">
                        <BatteryIcon className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                        <p className="text-lg font-black">{player.stamina || 0}</p>
                        <p className="text-[8px] font-bold opacity-50 uppercase">Resist.</p>
                    </div>
                </div>
            </div>
            <button onClick={onEdit} className="absolute bottom-4 right-4 bg-white/10 p-2.5 rounded-2xl hover:bg-white/20 transition-colors">
                <PencilIcon className="w-5 h-5 text-white" />
            </button>
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        </div>
    );
};

const SocialView: React.FC<SocialViewProps> = ({ 
    user, allTeams, allUsers, allBookings, addNotification, onNavigate, 
    setIsPremiumModalOpen, section, setSection, onUpdateUserTeams, onUpdateTeam, 
    sentInvitations, onSendInvitation, onCancelInvitation, onRemovePlayerFromTeam, 
    onLeaveTeam, weatherData, onSetAvailability 
}) => {
    const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
    const [activeChatTeam, setActiveChatTeam] = useState<Team | null>(null);

    const userTeams = useMemo(() => user.teamIds ? allTeams.filter(t => user.teamIds.includes(t.id)) : [], [allTeams, user.teamIds]);

    const renderHub = () => (
        <div className="space-y-8 pb-32 animate-ios">
            <div className="px-1 flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-textMuted-light dark:text-textMuted-dark text-sm font-medium uppercase tracking-widest">Zona Social</p>
                    <h1 className="text-4xl font-black tracking-tighter text-textMain-light dark:text-textMain-dark uppercase italic">DaviPlay</h1>
                </div>
                <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-bgSurface-light dark:bg-bgSurface-dark shadow-premium-light dark:shadow-premium-dark flex items-center justify-center">
                        <MedalIcon className="w-6 h-6 text-amber-500" />
                    </div>
                </div>
            </div>

            <PlayerCard player={user.playerProfile!} onEdit={() => onNavigate(View.PLAYER_PROFILE_CREATOR)} />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                    { id: 'my-team', label: 'Mi Equipo', icon: <ShieldIcon />, color: 'bg-blue-500' },
                    { id: 'challenge', label: 'Retar', icon: <SwordsAndBallIcon />, color: 'bg-red-500' },
                    { id: 'available-today', label: 'Disponibles', icon: <SoccerBallIcon />, color: 'bg-green-500' },
                    { id: 'sports-forum', label: 'Foro', icon: <ForumIcon />, color: 'bg-purple-500' },
                    { id: 'find-players', label: 'Fichajes', icon: <UserPlusIcon />, color: 'bg-orange-500' },
                    { id: 'tournaments', label: 'Torneos', icon: <TrophyIcon />, color: 'bg-yellow-500' },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setSection(item.id as SocialSection)}
                        className="bg-bgSurface-light dark:bg-bgSurface-dark border border-borderDefault-light dark:border-borderDefault-dark p-6 rounded-[32px] flex flex-col items-center gap-3 shadow-premium-light dark:shadow-premium-dark active:scale-95 transition-all group"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${item.color} text-white flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12`}>
                            {React.cloneElement(item.icon as React.ReactElement, { className: 'w-7 h-7' })}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-textMain-light dark:text-textMain-dark">{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <HubWidget title="Próximo Partido" icon={<CalendarDaysIcon className="w-4 h-4"/>}>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-brand">
                            <SoccerBallIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="font-black text-textMain-light dark:text-textMain-dark italic">VS. DEP. ÁGUILAS</p>
                            <p className="text-[10px] font-bold text-textMuted-light dark:text-textMuted-dark uppercase">Sábado 18:00 · El Templo</p>
                        </div>
                    </div>
                </HubWidget>
                <HubWidget title="Mi Racha" icon={<FireIcon className="w-4 h-4"/>}>
                    <div className="flex gap-2">
                        {['V', 'V', 'E', 'V', 'V'].map((res, i) => (
                            <div key={i} className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white ${res === 'V' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                                {res}
                            </div>
                        ))}
                    </div>
                </HubWidget>
            </div>
        </div>
    );

    const renderContent = () => {
        if (!user.playerProfile) {
            return (
                <div className="text-center py-20 px-6 animate-ios">
                    <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-4xl flex items-center justify-center mx-auto mb-6">
                        <UserIcon className="w-12 h-12 text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-textMain-light dark:text-textMain-dark uppercase italic">Activa tu Perfil</h2>
                    <p className="mt-4 text-textMuted-light dark:text-textMuted-dark max-w-sm mx-auto font-medium">
                        Crea tu perfil de jugador para unirte a la comunidad más grande de cancheros.
                    </p>
                    <button
                        onClick={() => onNavigate(View.PLAYER_PROFILE_CREATOR)}
                        className="mt-8 bg-brand text-white font-black py-4 px-10 rounded-3xl shadow-button active:scale-95 transition-all uppercase tracking-widest text-sm"
                    >
                        Comenzar Ahora
                    </button>
                </div>
            );
        }

        switch (section) {
            case 'my-team':
                return <MyTeamDashboard userTeams={userTeams} user={user} allUsers={allUsers} allBookings={allBookings} allTeams={allTeams} onBack={() => setSection('hub')} addNotification={addNotification} onUpdateTeam={onUpdateTeam} setIsPremiumModalOpen={setIsPremiumModalOpen} onUpdateUserTeams={onUpdateUserTeams} setSection={setSection} onRemovePlayerFromTeam={onRemovePlayerFromTeam} onLeaveTeam={onLeaveTeam} setActiveChatTeam={setActiveChatTeam} />;
            case 'sports-forum':
                return <SportsForumView user={user} addNotification={addNotification} onBack={() => setSection('hub')} />;
            case 'available-today':
                return <AvailableTodayView user={user} allUsers={allUsers} weatherData={weatherData} allBookings={allBookings} onBack={() => setSection('hub')} onSetAvailability={onSetAvailability} addNotification={addNotification} onViewProfile={(p) => setViewingPlayer(p)} />;
            case 'chat':
                return activeChatTeam ? <TeamChatView team={activeChatTeam} currentUser={user.playerProfile} onBack={() => { setSection('my-team'); setActiveChatTeam(null); }} onUpdateTeam={onUpdateTeam} addNotification={addNotification} /> : null;
            case 'find-players':
                return <AvailableTodayView user={user} allUsers={allUsers} weatherData={weatherData} allBookings={allBookings} onBack={() => setSection('hub')} onSetAvailability={onSetAvailability} addNotification={addNotification} onViewProfile={(p) => setViewingPlayer(p)} />;
            case 'challenge':
            case 'tournaments':
                return (
                    <div className="py-20 text-center animate-ios">
                         <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-4xl flex items-center justify-center mx-auto mb-6">
                            <TrophyIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-black text-textMain-light dark:text-textMain-dark uppercase italic">Próximamente</h2>
                        <p className="text-textMuted-light dark:text-textMuted-dark mt-2">Estamos trabajando en esta sección para ti.</p>
                        <button onClick={() => setSection('hub')} className="mt-8 text-brand font-black uppercase tracking-widest text-xs">Volver al Hub</button>
                    </div>
                );
            default:
                return renderHub();
        }
    };

    return (
        <div className="container mx-auto px-4 pt-6">
            {viewingPlayer ? (
                <div className="animate-ios">
                    <button onClick={() => setViewingPlayer(null)} className="flex items-center gap-2 text-brand font-bold mb-6">
                        <ChevronLeftIcon className="w-5 h-5" /> Volver
                    </button>
                    <PlayerProfileDetailView player={viewingPlayer} onBack={() => setViewingPlayer(null)} onRecruit={userTeams.length > 0 ? (p) => { setSection('my-team'); onSendInvitation(userTeams[0], p); setViewingPlayer(null); } : undefined} />
                </div>
            ) : renderContent()}
        </div>
    );
};

export default SocialView;
