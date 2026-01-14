import React, { useState, useMemo } from 'react';
import type { SoccerField, User, WeatherData, ConfirmedBooking, Team, AcceptedMatchInvite } from '../types';
import FieldCard from '../components/FieldCard';
import { SearchIcon } from '../components/icons/SearchIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import CompactWeatherWidget from '../components/weather/CompactWeatherWidget';
import { ClockIcon } from '../components/icons/ClockIcon';
import { SoccerBallIcon } from '../components/icons/SoccerBallIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';

interface HomeProps {
    onSearch: (location: string) => void;
    onSelectField: (field: SoccerField) => void;
    fields: SoccerField[];
    loading: boolean;
    favoriteFields: string[];
    onToggleFavorite: (complexId: string) => void;
    user: User | null;
    onSearchByLocation: () => void;
    isSearchingLocation: boolean;
    weatherData: WeatherData | null;
    isWeatherLoading: boolean;
    onRefreshWeather: () => void;
    allBookings: ConfirmedBooking[];
    allTeams: Team[];
    currentTime: Date;
    acceptedMatches: AcceptedMatchInvite[];
    onSelectBooking: (booking: ConfirmedBooking) => void;
}

const Home: React.FC<HomeProps> = ({ 
    onSearch, onSelectField, fields, loading, favoriteFields, onToggleFavorite, 
    user, onSearchByLocation, isSearchingLocation, weatherData, isWeatherLoading, 
    onRefreshWeather, allBookings, currentTime, acceptedMatches, onSelectBooking
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Logic for global matches today
    const globalMatchesToday = useMemo(() => {
        const todayStr = currentTime.toISOString().split('T')[0];
        const nowTime = currentTime.getHours() * 60 + currentTime.getMinutes();

        return allBookings
            .filter(b => {
                if (!b.date) return false;
                const bDateStr = new Date(b.date).toISOString().split('T')[0];
                return bDateStr === todayStr && b.status !== 'cancelled';
            })
            .map(b => {
                const [hours, minutes] = b.time.split(':').map(Number);
                const startTime = hours * 60 + minutes;
                const endTime = startTime + 60; // Assume 1hr matches

                let status: 'upcoming' | 'live' | 'final' = 'upcoming';
                if (nowTime >= startTime && nowTime <= endTime) status = 'live';
                else if (nowTime > endTime || b.status === 'completed') status = 'final';

                return { ...b, liveStatus: status };
            })
            .sort((a, b) => {
                // Priority: Live > Upcoming > Final
                const statusOrder = { live: 0, upcoming: 1, final: 2 };
                return statusOrder[a.liveStatus] - statusOrder[b.liveStatus];
            });
    }, [allBookings, currentTime]);

    const todayMatches = useMemo(() => {
        if (!user) return { bookings: [], invites: [] };
        const todayStr = currentTime.toISOString().split('T')[0];
        
        const userTodayBookings = allBookings.filter(b => {
            if (!b.date) return false;
            const bDateStr = new Date(b.date).toISOString().split('T')[0];
            return b.userId === user.id && bDateStr === todayStr && b.status !== 'cancelled';
        });

        const userAcceptedToday = acceptedMatches.filter(m => {
            if (!m.matchDate) return false;
            const mDateStr = new Date(m.matchDate).toISOString().split('T')[0];
            return mDateStr === todayStr;
        });

        return { bookings: userTodayBookings, invites: userAcceptedToday };
    }, [user, allBookings, acceptedMatches, currentTime]);

    const groupedFields = useMemo(() => {
        const grouped: { [key: string]: SoccerField[] } = {};
        fields.forEach(field => {
            const id = field.complexId || field.id;
            if (!grouped[id]) grouped[id] = [];
            grouped[id].push(field);
        });
        return Object.values(grouped);
    }, [fields]);

    const hasUserActionToday = (todayMatches?.bookings?.length || 0) > 0 || (todayMatches?.invites?.length || 0) > 0;

    return (
        <div className="space-y-8 animate-ios pb-32">
            {/* Header / Search Section */}
            <div className="px-1">
                <div className="flex justify-between items-end mb-6">
                    <div className="space-y-1">
                        <p className="text-gray-400 text-sm font-medium">Hola, {user?.name ? user.name.split(' ')[0] : 'jugador'} 👋</p>
                        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Cancheo</h1>
                    </div>
                    {weatherData && (
                        <div className="active:scale-95 transition-transform">
                            <CompactWeatherWidget 
                                weatherData={weatherData} 
                                isLoading={isWeatherLoading} 
                                onRefresh={onRefreshWeather} 
                            />
                        </div>
                    )}
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Busca tu próxima cancha..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSearch(searchTerm)}
                        className="w-full h-14 pl-12 pr-16 bg-white border-none rounded-2xl shadow-premium text-textMain placeholder:text-gray-400 font-semibold focus:ring-2 focus:ring-brand/50 transition-all outline-none"
                    />
                    <button 
                        onClick={onSearchByLocation}
                        disabled={isSearchingLocation}
                        className="absolute right-2.5 top-2.5 h-9 w-9 bg-brand text-white rounded-xl flex items-center justify-center shadow-button active:scale-90 transition-all disabled:opacity-50"
                    >
                        {isSearchingLocation ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <LocationIcon className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Global Live Scoreboard Section */}
            {globalMatchesToday.length > 0 && (
                <section className="animate-ios">
                    <div className="flex justify-between items-center px-1 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-brand animate-pulse"></div>
                            <h2 className="text-xs font-black text-brand uppercase tracking-[0.2em]">Marcadores de Hoy</h2>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{currentTime.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
                    </div>

                    <div className="flex gap-4 overflow-x-auto ios-scroller -mx-4 px-4 pb-2">
                        {globalMatchesToday.map(match => (
                            <div 
                                key={match.id}
                                className={`flex-shrink-0 w-[280px] p-4 rounded-3xl border transition-all ${
                                    match.liveStatus === 'live' 
                                    ? 'bg-brand/5 border-brand/30 shadow-[0_0_15px_rgba(255,100,82,0.1)]' 
                                    : 'bg-white/5 border-white/10'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[150px]">
                                        {match.field.name}
                                    </span>
                                    {match.liveStatus === 'live' ? (
                                        <span className="flex items-center gap-1.5 bg-brand text-white text-[9px] font-black px-2 py-0.5 rounded-md animate-pulse">
                                            LIVE
                                        </span>
                                    ) : match.liveStatus === 'final' ? (
                                        <span className="bg-gray-700 text-gray-300 text-[9px] font-black px-2 py-0.5 rounded-md">
                                            FINAL
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-black text-gray-500 uppercase">{match.time}</span>
                                    )}
                                </div>

                                <div className="flex justify-between items-center gap-2">
                                    <div className="flex-1 text-center min-w-0">
                                        <p className="text-white font-bold text-sm truncate uppercase tracking-tight">{match.teamName || match.userName}</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-xl border border-white/5">
                                        <span className={`text-xl font-black ${match.liveStatus === 'live' ? 'text-white' : 'text-gray-400'}`}>
                                            {match.scoreA ?? 0}
                                        </span>
                                        <span className="text-gray-600 font-bold">-</span>
                                        <span className={`text-xl font-black ${match.liveStatus === 'live' ? 'text-white' : 'text-gray-400'}`}>
                                            {match.scoreB ?? 0}
                                        </span>
                                    </div>

                                    <div className="flex-1 text-center min-w-0">
                                        <p className="text-white font-bold text-sm truncate uppercase tracking-tight">{match.rivalName || 'Rival'}</p>
                                    </div>
                                </div>
                                
                                <div className="mt-3 flex items-center justify-center gap-1 text-[9px] font-bold text-gray-500">
                                    <LocationIcon className="w-2.5 h-2.5" />
                                    {match.field.city}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Today's Matches - User's Specific Agenda */}
            {hasUserActionToday && (
                <section className="px-1 animate-slide-in-up">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Tu Agenda Personal</h2>
                    </div>
                    
                    <div className="space-y-3">
                        {todayMatches.bookings.map(booking => (
                            <div 
                                key={booking.id}
                                onClick={() => onSelectBooking(booking)}
                                className="bg-gradient-to-r from-[#0E1320] to-[#111827] border border-white/10 p-5 rounded-3xl shadow-xl flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-brand/20 flex items-center justify-center text-brand">
                                        <SoccerBallIcon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg leading-tight">{booking.field.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
                                                <ClockIcon className="w-3.5 h-3.5" />
                                                {booking.time}
                                            </span>
                                            <span className="bg-green-500/20 text-green-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-green-500/30">CONFIRMADO</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRightIcon className="w-6 h-6 text-gray-600 group-hover:text-brand transition-colors" />
                            </div>
                        ))}
                        
                        {todayMatches.invites.map(invite => (
                            <div 
                                key={invite.id}
                                className="bg-gradient-to-r from-[#0E1320] to-[#111827] border border-white/10 p-5 rounded-3xl shadow-xl flex items-center justify-between group opacity-90"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                                        <SoccerBallIcon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg leading-tight">{invite.fieldName}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
                                                <ClockIcon className="w-3.5 h-3.5" />
                                                {invite.matchTime}
                                            </span>
                                            <span className="text-[10px] font-bold text-amber-400/80 uppercase">Invitado por {invite.inviterName.split(' ')[0]}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Quick Filters */}
            <div className="flex gap-3 overflow-x-auto ios-scroller -mx-4 px-4 py-2">
                {['⚽ Fútbol 5', '🏟️ Fútbol 7', '🏆 Fútbol 11', '🏙️ Medellín', '⛪ Bogotá'].map((cat, idx) => (
                    <button 
                        key={cat}
                        className={`flex-shrink-0 px-6 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${idx === 0 ? 'bg-brand text-white shadow-button' : 'bg-white/5 border border-white/10 text-gray-300'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Content Section */}
            <section className="space-y-6">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-2xl font-black tracking-tight text-white italic uppercase">Canchas Populares</h2>
                    <button className="text-brand text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity">Ver Todas</button>
                </div>
                
                {loading ? (
                    <div className="space-y-6 animate-pulse px-1">
                        <div className="h-72 bg-white/10 rounded-4xl shimmer-bg"></div>
                        <div className="h-72 bg-white/10 rounded-4xl shimmer-bg"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 px-1">
                        {groupedFields.slice(0, 5).map((fieldGroup) => (
                            <FieldCard
                                key={fieldGroup[0].complexId || fieldGroup[0].id}
                                fields={fieldGroup}
                                onSelect={onSelectField}
                                isFavorite={favoriteFields.includes(fieldGroup[0].complexId || fieldGroup[0].id)}
                                onToggleFavorite={onToggleFavorite}
                                className="animate-ios"
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Promo Banner */}
            <div className="mx-1 p-8 rounded-5xl bg-gradient-to-br from-brand to-orange-500 text-white relative overflow-hidden shadow-2xl group active:scale-[0.98] transition-transform">
                <div className="relative z-10 space-y-3">
                    <h3 className="text-3xl font-black italic leading-none uppercase tracking-tighter">¿Dueño de canchas?</h3>
                    <p className="text-sm font-medium opacity-90 max-w-[220px]">Sube de nivel tu negocio con Cancheo Pro.</p>
                    <button className="mt-4 bg-white text-brand px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-xl active:scale-95 transition-transform tracking-widest">REGISTRARME</button>
                </div>
                <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <SoccerBallIcon className="absolute -right-6 top-1/2 -translate-y-1/2 w-40 h-40 text-white/5 rotate-12" />
            </div>
        </div>
    );
};

export default Home;